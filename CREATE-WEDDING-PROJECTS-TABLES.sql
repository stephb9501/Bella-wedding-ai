-- =====================================================
-- CREATE VENDOR CLIENT MANAGEMENT TABLES
-- =====================================================
-- These tables allow vendors to manage wedding projects
-- and create service-specific deliverables for each bride
-- =====================================================

-- Main wedding project table (one per accepted booking)
CREATE TABLE IF NOT EXISTS wedding_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  bride_id UUID NOT NULL,

  -- Project status
  status VARCHAR(50) DEFAULT 'active', -- active, completed, archived

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(booking_id)
);

-- Project notes (vendor's notes about the wedding)
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  title VARCHAR(255),
  content TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project files (contracts, invoices, mood boards, etc.)
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- contract, invoice, photo, document
  file_size INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project tasks/checklist
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  due_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Music playlists (for DJs/Musicians)
CREATE TABLE IF NOT EXISTS music_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  event_part VARCHAR(100), -- ceremony, cocktail_hour, reception, first_dance, etc.
  songs JSONB NOT NULL, -- [{title, artist, duration, notes}]

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shot lists (for Photographers/Videographers)
CREATE TABLE IF NOT EXISTS shot_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  category VARCHAR(100), -- getting_ready, ceremony, portraits, reception, etc.
  shots JSONB NOT NULL, -- [{description, location, time, completed}]

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wedding timeline (for all vendors, especially planners)
CREATE TABLE IF NOT EXISTS wedding_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  time_slot TIME NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  duration INTEGER, -- minutes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wedding_projects_vendor ON wedding_projects(vendor_id);
CREATE INDEX IF NOT EXISTS idx_wedding_projects_booking ON wedding_projects(booking_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_project ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_music_playlists_project ON music_playlists(project_id);
CREATE INDEX IF NOT EXISTS idx_shot_lists_project ON shot_lists(project_id);
CREATE INDEX IF NOT EXISTS idx_wedding_timeline_project ON wedding_timeline(project_id);

-- Enable Row Level Security
ALTER TABLE wedding_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shot_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Vendors can only access their own projects
CREATE POLICY "Vendors can view their projects"
  ON wedding_projects FOR SELECT
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can create projects"
  ON wedding_projects FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their projects"
  ON wedding_projects FOR UPDATE
  USING (vendor_id = auth.uid());

-- Notes policies
CREATE POLICY "Vendors can manage their project notes"
  ON project_notes FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- Files policies
CREATE POLICY "Vendors can manage their project files"
  ON project_files FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- Tasks policies
CREATE POLICY "Vendors can manage their project tasks"
  ON project_tasks FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- Playlists policies
CREATE POLICY "Vendors can manage their music playlists"
  ON music_playlists FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- Shot lists policies
CREATE POLICY "Vendors can manage their shot lists"
  ON shot_lists FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- Timeline policies
CREATE POLICY "Vendors can manage wedding timeline"
  ON wedding_timeline FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wedding_projects_updated_at
  BEFORE UPDATE ON wedding_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_notes_updated_at
  BEFORE UPDATE ON project_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS! Vendor client management tables created!
-- =====================================================
-- Vendors can now manage wedding projects with:
-- - Notes and planning documents
-- - File uploads (contracts, invoices)
-- - Task checklists
-- - Music playlists (DJs)
-- - Shot lists (Photographers)
-- - Wedding day timeline
-- =====================================================
