-- =====================================================
-- FILE UPLOAD & DOCUMENT MANAGEMENT SYSTEM
-- =====================================================
-- For contracts, invoices, mood boards, signed documents
-- Uses Supabase Storage for actual file storage
-- =====================================================

-- Table to track all uploaded files
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
  project_id UUID REFERENCES wedding_projects(id) ON DELETE CASCADE,

  -- File metadata
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100), -- contract, invoice, mood_board, inspiration, signed_document, other
  file_category VARCHAR(100), -- legal, financial, creative, communication
  mime_type VARCHAR(100),
  file_size_bytes BIGINT,

  -- Storage location (Supabase Storage path)
  storage_bucket VARCHAR(100) DEFAULT 'wedding-files',
  storage_path TEXT NOT NULL,
  public_url TEXT,

  -- Uploader info
  uploaded_by_user_id UUID NOT NULL,
  uploaded_by_role VARCHAR(50), -- vendor, bride, planner
  uploaded_by_name VARCHAR(255),

  -- Document properties
  is_signed BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT false,
  signature_date DATE,
  signed_by_user_id UUID,
  signed_by_name VARCHAR(255),

  -- Access control
  is_public BOOLEAN DEFAULT false,
  shared_with_bride BOOLEAN DEFAULT false,
  shared_with_all_vendors BOOLEAN DEFAULT false,

  -- Version control
  version_number INTEGER DEFAULT 1,
  replaces_file_id UUID REFERENCES project_files(id),
  is_latest_version BOOLEAN DEFAULT true,

  -- Metadata
  description TEXT,
  tags TEXT[], -- For searching: ['contract', 'final', 'signed']
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File download/view tracking
CREATE TABLE IF NOT EXISTS file_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,

  accessed_by_user_id UUID NOT NULL,
  accessed_by_role VARCHAR(50),
  access_type VARCHAR(50), -- view, download, delete

  ip_address INET,
  user_agent TEXT,

  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- File sharing permissions
CREATE TABLE IF NOT EXISTS file_sharing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,

  shared_with_user_id UUID NOT NULL,
  shared_by_user_id UUID NOT NULL,

  can_view BOOLEAN DEFAULT true,
  can_download BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,

  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_files_booking ON project_files(booking_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_type ON project_files(file_type);
CREATE INDEX IF NOT EXISTS idx_project_files_uploader ON project_files(uploaded_by_user_id);
CREATE INDEX IF NOT EXISTS idx_project_files_latest ON project_files(is_latest_version);
CREATE INDEX IF NOT EXISTS idx_file_access_log_file ON file_access_log(file_id);
CREATE INDEX IF NOT EXISTS idx_file_sharing_file ON file_sharing(file_id);
CREATE INDEX IF NOT EXISTS idx_file_sharing_user ON file_sharing(shared_with_user_id);

-- RLS
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_sharing ENABLE ROW LEVEL SECURITY;

-- Uploaders can view their own files
CREATE POLICY "Users can view files they uploaded"
  ON project_files FOR SELECT
  USING (uploaded_by_user_id = auth.uid());

-- Files shared with user
CREATE POLICY "Users can view files shared with them"
  ON project_files FOR SELECT
  USING (
    shared_with_bride = true OR
    shared_with_all_vendors = true OR
    EXISTS (
      SELECT 1 FROM file_sharing
      WHERE file_sharing.file_id = project_files.id
      AND file_sharing.shared_with_user_id = auth.uid()
    )
  );

-- Users can upload files to their projects
CREATE POLICY "Users can upload files"
  ON project_files FOR INSERT
  WITH CHECK (uploaded_by_user_id = auth.uid());

-- Users can update their own files
CREATE POLICY "Users can update their files"
  ON project_files FOR UPDATE
  USING (uploaded_by_user_id = auth.uid());

-- Users can delete their own files
CREATE POLICY "Users can delete their files"
  ON project_files FOR DELETE
  USING (uploaded_by_user_id = auth.uid());

-- Access log policies
CREATE POLICY "Users can view their access logs"
  ON file_access_log FOR SELECT
  USING (accessed_by_user_id = auth.uid());

CREATE POLICY "Anyone can log access"
  ON file_access_log FOR INSERT
  WITH CHECK (true);

-- File sharing policies
CREATE POLICY "Users can view shares for their files"
  ON file_sharing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_files
      WHERE project_files.id = file_sharing.file_id
      AND project_files.uploaded_by_user_id = auth.uid()
    )
    OR shared_with_user_id = auth.uid()
  );

CREATE POLICY "File owners can share files"
  ON file_sharing FOR INSERT
  WITH CHECK (shared_by_user_id = auth.uid());

-- Triggers
CREATE TRIGGER update_project_files_updated_at
  BEFORE UPDATE ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to mark old versions as not latest
CREATE OR REPLACE FUNCTION mark_old_version_not_latest()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.replaces_file_id IS NOT NULL THEN
    UPDATE project_files
    SET is_latest_version = false
    WHERE id = NEW.replaces_file_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_old_version_trigger
  AFTER INSERT ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION mark_old_version_not_latest();

-- Function to log file access
CREATE OR REPLACE FUNCTION log_file_access(
  p_file_id UUID,
  p_user_id UUID,
  p_user_role VARCHAR,
  p_access_type VARCHAR,
  p_ip_address INET,
  p_user_agent TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO file_access_log (
    file_id,
    accessed_by_user_id,
    accessed_by_role,
    access_type,
    ip_address,
    user_agent
  ) VALUES (
    p_file_id,
    p_user_id,
    p_user_role,
    p_access_type,
    p_ip_address,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUPABASE STORAGE BUCKETS
-- =====================================================
-- Run these commands in Supabase Dashboard > Storage:
--
-- 1. Create bucket: "wedding-files"
--    - Public: false (private files)
--    - File size limit: 50MB
--    - Allowed mime types: application/pdf, image/*,
--      application/vnd.*, application/msword, etc.
--
-- 2. Set RLS policies on storage:
--    - Users can upload to their own folders
--    - Users can download files they have access to
--
-- Folder structure:
-- wedding-files/
--   ├── {booking_id}/
--   │   ├── contracts/
--   │   ├── invoices/
--   │   ├── mood-boards/
--   │   ├── signed-documents/
--   │   └── other/
-- =====================================================

-- =====================================================
-- USAGE EXAMPLES:
-- =====================================================

-- EXAMPLE 1: Upload contract
-- INSERT INTO project_files (
--   booking_id, file_name, file_type, storage_path,
--   uploaded_by_user_id, uploaded_by_role, requires_signature
-- ) VALUES (
--   'booking-123', 'DJ_Contract_Final.pdf', 'contract',
--   'wedding-files/booking-123/contracts/DJ_Contract_Final.pdf',
--   'vendor-456', 'vendor', true
-- );

-- EXAMPLE 2: Upload signed contract (new version)
-- INSERT INTO project_files (
--   booking_id, file_name, file_type, storage_path,
--   uploaded_by_user_id, is_signed, replaces_file_id
-- ) VALUES (
--   'booking-123', 'DJ_Contract_Signed.pdf', 'contract',
--   'wedding-files/booking-123/contracts/DJ_Contract_Signed_v2.pdf',
--   'vendor-456', true, 'original-file-id'
-- );

-- EXAMPLE 3: Share file with bride
-- UPDATE project_files
-- SET shared_with_bride = true
-- WHERE id = 'file-id';

-- EXAMPLE 4: Track file downloads
-- SELECT log_file_access(
--   'file-id', 'user-id', 'bride', 'download',
--   '192.168.1.1', 'Mozilla/5.0...'
-- );

-- EXAMPLE 5: Get all contracts for a booking
-- SELECT * FROM project_files
-- WHERE booking_id = 'booking-123'
-- AND file_type = 'contract'
-- AND is_latest_version = true
-- ORDER BY created_at DESC;

-- =====================================================
-- ANALYTICS VIEWS:
-- =====================================================

-- File statistics per booking
CREATE OR REPLACE VIEW booking_file_stats AS
SELECT
  booking_id,
  COUNT(*) as total_files,
  SUM(file_size_bytes) as total_size_bytes,
  COUNT(CASE WHEN file_type = 'contract' THEN 1 END) as contract_count,
  COUNT(CASE WHEN file_type = 'invoice' THEN 1 END) as invoice_count,
  COUNT(CASE WHEN is_signed = true THEN 1 END) as signed_documents,
  COUNT(CASE WHEN requires_signature = true AND is_signed = false THEN 1 END) as pending_signatures
FROM project_files
WHERE is_latest_version = true
GROUP BY booking_id;

-- =====================================================
-- SUCCESS! File upload system created!
-- =====================================================
-- Features:
-- ✅ Upload contracts, invoices, mood boards, documents
-- ✅ Version control (upload new versions)
-- ✅ Digital signatures tracking
-- ✅ Granular sharing permissions
-- ✅ Access logging for legal evidence
-- ✅ File categorization and tagging
-- ✅ Integration with Supabase Storage
-- =====================================================
