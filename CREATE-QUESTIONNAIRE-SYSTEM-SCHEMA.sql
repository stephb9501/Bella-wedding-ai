-- =====================================================
-- CUSTOM QUESTIONNAIRE & FEATURE SUGGESTION SYSTEM
-- =====================================================
-- Vendors/brides can suggest new questions/checklist items
-- Admin reviews and approves
-- Vendors customize questionnaires per category
-- Bride responses stored as documents
-- =====================================================

-- =====================================================
-- QUESTION TEMPLATES (Master Library)
-- =====================================================

CREATE TABLE IF NOT EXISTS questionnaire_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Question details
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- text, textarea, multiple_choice, checkbox, date, file_upload
  category VARCHAR(100) NOT NULL, -- Photography, Catering, DJ, Florist, etc.

  -- Options for multiple choice/checkbox
  options JSONB, -- ["Option 1", "Option 2", "Option 3"]

  -- Metadata
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  help_text TEXT,

  -- Who suggested it
  suggested_by_user_id UUID,
  suggested_by_role VARCHAR(50), -- vendor, bride, admin

  -- Approval status
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false, -- Auto-set if times_used > 50

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VENDOR CUSTOM QUESTIONNAIRES
-- =====================================================

CREATE TABLE IF NOT EXISTS vendor_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Questionnaire details
  name VARCHAR(255) NOT NULL, -- e.g., "Wedding Photography Intake Form"
  description TEXT,

  -- Selected questions from template library
  selected_questions JSONB NOT NULL, -- Array of question IDs with custom ordering

  -- Vendor's own custom questions (not in template library yet)
  custom_questions JSONB, -- [{question_text, question_type, options, is_required, help_text}, ...]

  -- Settings
  is_active BOOLEAN DEFAULT true,
  send_automatically BOOLEAN DEFAULT false, -- Send when bride books vendor
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 30, -- Remind bride 30 days before wedding

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(vendor_id, name)
);

-- =====================================================
-- QUESTIONNAIRE RESPONSES (from Brides)
-- =====================================================

CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  questionnaire_id UUID NOT NULL REFERENCES vendor_questionnaires(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
  bride_id UUID NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id),

  -- Responses (question_id → answer)
  responses JSONB NOT NULL, -- {"question_uuid": "answer", ...}

  -- Bride's custom questions for this specific wedding
  bride_custom_questions JSONB, -- [{question_text, question_type, options, answer}, ...]

  -- Completion tracking
  is_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),

  -- File uploads (if question type is file_upload)
  uploaded_files JSONB, -- [{question_id, file_path, file_url}, ...]

  -- Notifications
  bride_notified BOOLEAN DEFAULT false,
  vendor_notified BOOLEAN DEFAULT false,
  admin_notified BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FEATURE SUGGESTIONS (Crowdsourced Ideas)
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Suggestion details
  suggestion_type VARCHAR(50) NOT NULL, -- question, checklist_item, feature_request
  category VARCHAR(100), -- Photography, Catering, etc.
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  -- Suggested content (for questions/checklist items)
  suggested_question TEXT,
  suggested_question_type VARCHAR(50), -- text, multiple_choice, etc.
  suggested_options JSONB,

  -- Who suggested it
  suggested_by_user_id UUID NOT NULL,
  suggested_by_email VARCHAR(255),
  suggested_by_role VARCHAR(50), -- vendor, bride
  suggested_by_name VARCHAR(255),

  -- Admin review
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, implemented
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,

  -- If approved, link to created template
  created_template_id UUID REFERENCES questionnaire_templates(id),

  -- Voting (other users can upvote)
  upvote_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADMIN CUSTOM CONTENT (Copy/Paste or Upload)
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_custom_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content type
  content_type VARCHAR(50) NOT NULL, -- question_template, checklist_template, document_template

  -- Content
  content_data JSONB NOT NULL, -- Flexible structure for any type

  -- Metadata
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),

  -- File upload (if applicable)
  uploaded_file_path TEXT,
  uploaded_file_url TEXT,

  -- Admin who created it
  created_by UUID NOT NULL REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_questionnaire_templates_category ON questionnaire_templates(category);
CREATE INDEX IF NOT EXISTS idx_questionnaire_templates_status ON questionnaire_templates(status);
CREATE INDEX IF NOT EXISTS idx_questionnaire_templates_popular ON questionnaire_templates(is_popular);

CREATE INDEX IF NOT EXISTS idx_vendor_questionnaires_vendor ON vendor_questionnaires(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_questionnaires_active ON vendor_questionnaires(is_active);

CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_questionnaire ON questionnaire_responses(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_booking ON questionnaire_responses(booking_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_bride ON questionnaire_responses(bride_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_vendor ON questionnaire_responses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_complete ON questionnaire_responses(is_complete);

CREATE INDEX IF NOT EXISTS idx_feature_suggestions_status ON feature_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_type ON feature_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_suggested_by ON feature_suggestions(suggested_by_user_id);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_category ON feature_suggestions(category);

CREATE INDEX IF NOT EXISTS idx_admin_custom_content_type ON admin_custom_content(content_type);
CREATE INDEX IF NOT EXISTS idx_admin_custom_content_created_by ON admin_custom_content(created_by);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_custom_content ENABLE ROW LEVEL SECURITY;

-- Templates: Approved ones are public, admins see all
DROP POLICY IF EXISTS "Approved templates are public" ON questionnaire_templates;
CREATE POLICY "Approved templates are public"
  ON questionnaire_templates FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Admins can manage templates" ON questionnaire_templates;
CREATE POLICY "Admins can manage templates"
  ON questionnaire_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Vendor questionnaires: Vendors can manage their own
DROP POLICY IF EXISTS "Vendors can view their questionnaires" ON vendor_questionnaires;
CREATE POLICY "Vendors can view their questionnaires"
  ON vendor_questionnaires FOR SELECT
  USING (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Vendors can create questionnaires" ON vendor_questionnaires;
CREATE POLICY "Vendors can create questionnaires"
  ON vendor_questionnaires FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Vendors can update their questionnaires" ON vendor_questionnaires;
CREATE POLICY "Vendors can update their questionnaires"
  ON vendor_questionnaires FOR UPDATE
  USING (vendor_id = auth.uid());

-- Responses: Vendors and brides can view their own
DROP POLICY IF EXISTS "Vendors can view responses" ON questionnaire_responses;
CREATE POLICY "Vendors can view responses"
  ON questionnaire_responses FOR SELECT
  USING (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Brides can view their responses" ON questionnaire_responses;
CREATE POLICY "Brides can view their responses"
  ON questionnaire_responses FOR SELECT
  USING (bride_id = auth.uid());

DROP POLICY IF EXISTS "Brides can create responses" ON questionnaire_responses;
CREATE POLICY "Brides can create responses"
  ON questionnaire_responses FOR INSERT
  WITH CHECK (bride_id = auth.uid());

DROP POLICY IF EXISTS "Brides can update their responses" ON questionnaire_responses;
CREATE POLICY "Brides can update their responses"
  ON questionnaire_responses FOR UPDATE
  USING (bride_id = auth.uid());

-- Feature suggestions: Anyone can create, admins can review
DROP POLICY IF EXISTS "Anyone can view suggestions" ON feature_suggestions;
CREATE POLICY "Anyone can view suggestions"
  ON feature_suggestions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create suggestions" ON feature_suggestions;
CREATE POLICY "Users can create suggestions"
  ON feature_suggestions FOR INSERT
  WITH CHECK (suggested_by_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can review suggestions" ON feature_suggestions;
CREATE POLICY "Admins can review suggestions"
  ON feature_suggestions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admin custom content: Admins only
DROP POLICY IF EXISTS "Admins can manage custom content" ON admin_custom_content;
CREATE POLICY "Admins can manage custom content"
  ON admin_custom_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE TRIGGER update_questionnaire_templates_updated_at
  BEFORE UPDATE ON questionnaire_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_questionnaires_updated_at
  BEFORE UPDATE ON vendor_questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaire_responses_updated_at
  BEFORE UPDATE ON questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_custom_content_updated_at
  BEFORE UPDATE ON admin_custom_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-mark template as popular if used > 50 times
CREATE OR REPLACE FUNCTION mark_popular_templates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.times_used > 50 AND NOT NEW.is_popular THEN
    NEW.is_popular := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_popular_templates_trigger
  BEFORE UPDATE ON questionnaire_templates
  FOR EACH ROW
  EXECUTE FUNCTION mark_popular_templates();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get all approved questions for a category
CREATE OR REPLACE FUNCTION get_approved_questions(p_category VARCHAR)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  question_type VARCHAR,
  options JSONB,
  is_required BOOLEAN,
  help_text TEXT,
  times_used INTEGER,
  is_popular BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    qt.id,
    qt.question_text,
    qt.question_type,
    qt.options,
    qt.is_required,
    qt.help_text,
    qt.times_used,
    qt.is_popular
  FROM questionnaire_templates qt
  WHERE qt.category = p_category
    AND qt.status = 'approved'
  ORDER BY qt.is_popular DESC, qt.times_used DESC, qt.display_order;
END;
$$ LANGUAGE plpgsql;

-- Increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE questionnaire_templates
  SET times_used = times_used + 1
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql;

-- Get all vendor custom questions (for admin review)
CREATE OR REPLACE FUNCTION get_all_vendor_custom_questions()
RETURNS TABLE (
  questionnaire_id UUID,
  questionnaire_name VARCHAR,
  vendor_id UUID,
  vendor_name VARCHAR,
  vendor_category VARCHAR,
  custom_questions JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vq.id as questionnaire_id,
    vq.name as questionnaire_name,
    v.id as vendor_id,
    v.business_name as vendor_name,
    v.category as vendor_category,
    vq.custom_questions,
    vq.created_at
  FROM vendor_questionnaires vq
  JOIN vendors v ON v.id = vq.vendor_id
  WHERE vq.custom_questions IS NOT NULL
    AND jsonb_array_length(vq.custom_questions) > 0
  ORDER BY vq.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Promote a vendor custom question to main template library
CREATE OR REPLACE FUNCTION promote_custom_question_to_template(
  p_question_text TEXT,
  p_question_type VARCHAR,
  p_category VARCHAR,
  p_options JSONB DEFAULT NULL,
  p_is_required BOOLEAN DEFAULT false,
  p_help_text TEXT DEFAULT NULL,
  p_approved_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_template_id UUID;
BEGIN
  -- Insert into template library
  INSERT INTO questionnaire_templates (
    question_text,
    question_type,
    category,
    options,
    is_required,
    help_text,
    status,
    approved_by,
    approved_at
  ) VALUES (
    p_question_text,
    p_question_type,
    p_category,
    p_options,
    p_is_required,
    p_help_text,
    'approved',
    p_approved_by,
    NOW()
  )
  RETURNING id INTO v_template_id;

  RETURN v_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all bride custom questions (for admin review)
CREATE OR REPLACE FUNCTION get_all_bride_custom_questions()
RETURNS TABLE (
  response_id UUID,
  bride_id UUID,
  bride_name VARCHAR,
  vendor_id UUID,
  vendor_name VARCHAR,
  wedding_date DATE,
  bride_custom_questions JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    qr.id as response_id,
    qr.bride_id,
    u.full_name as bride_name,
    qr.vendor_id,
    v.business_name as vendor_name,
    w.wedding_date,
    qr.bride_custom_questions,
    qr.created_at
  FROM questionnaire_responses qr
  JOIN users u ON u.id = qr.bride_id
  JOIN vendors v ON v.id = qr.vendor_id
  LEFT JOIN weddings w ON w.user_id = qr.bride_id
  WHERE qr.bride_custom_questions IS NOT NULL
    AND jsonb_array_length(qr.bride_custom_questions) > 0
  ORDER BY qr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA (Default Photography Questions)
-- =====================================================

INSERT INTO questionnaire_templates (
  question_text, question_type, category, status, approved_at, is_required, display_order
) VALUES
  -- Photography
  ('What is your wedding date?', 'date', 'Photography', 'approved', NOW(), true, 1),
  ('What time is your ceremony?', 'text', 'Photography', 'approved', NOW(), true, 2),
  ('What time is your reception?', 'text', 'Photography', 'approved', NOW(), true, 3),
  ('How many hours of coverage do you need?', 'multiple_choice', 'Photography', 'approved', NOW(), true, 4),
  ('Do you want a first look session?', 'multiple_choice', 'Photography', 'approved', NOW(), false, 5),
  ('List any must-have shots (family, venue details, etc.)', 'textarea', 'Photography', 'approved', NOW(), false, 6),
  ('Upload inspiration photos (if any)', 'file_upload', 'Photography', 'approved', NOW(), false, 7),

  -- Catering
  ('How many guests are you expecting?', 'text', 'Catering', 'approved', NOW(), true, 1),
  ('Do you have any dietary restrictions to accommodate?', 'textarea', 'Catering', 'approved', NOW(), false, 2),
  ('Preferred meal style?', 'multiple_choice', 'Catering', 'approved', NOW(), true, 3),
  ('Do you need bar service?', 'multiple_choice', 'Catering', 'approved', NOW(), false, 4),

  -- DJ/Music
  ('What is your ceremony music preference?', 'textarea', 'DJ/Music', 'approved', NOW(), false, 1),
  ('First dance song?', 'text', 'DJ/Music', 'approved', NOW(), false, 2),
  ('Any songs you DO NOT want played?', 'textarea', 'DJ/Music', 'approved', NOW(), false, 3),
  ('Will there be toasts/speeches?', 'multiple_choice', 'DJ/Music', 'approved', NOW(), false, 4),

  -- Florist
  ('What is your wedding color palette?', 'text', 'Florist', 'approved', NOW(), true, 1),
  ('Do you have a floral vision/theme?', 'textarea', 'Florist', 'approved', NOW(), false, 2),
  ('How many bridesmaids bouquets?', 'text', 'Florist', 'approved', NOW(), false, 3),
  ('How many boutonnieres?', 'text', 'Florist', 'approved', NOW(), false, 4),
  ('Do you need centerpieces?', 'multiple_choice', 'Florist', 'approved', NOW(), false, 5)

ON CONFLICT DO NOTHING;

-- Set options for multiple choice questions
UPDATE questionnaire_templates
SET options = '["4 hours", "6 hours", "8 hours", "10+ hours"]'::jsonb
WHERE question_text = 'How many hours of coverage do you need?';

UPDATE questionnaire_templates
SET options = '["Yes, we want a first look", "No first look", "Undecided"]'::jsonb
WHERE question_text = 'Do you want a first look session?';

UPDATE questionnaire_templates
SET options = '["Plated dinner", "Buffet", "Family style", "Cocktail reception", "Other"]'::jsonb
WHERE question_text = 'Preferred meal style?';

UPDATE questionnaire_templates
SET options = '["Full bar", "Beer and wine only", "Cash bar", "No alcohol"]'::jsonb
WHERE question_text = 'Do you need bar service?';

UPDATE questionnaire_templates
SET options = '["Yes", "No", "Unsure"]'::jsonb
WHERE question_text = 'Will there be toasts/speeches?';

UPDATE questionnaire_templates
SET options = '["Yes, we need centerpieces", "No centerpieces", "Undecided"]'::jsonb
WHERE question_text = 'Do you need centerpieces?';

-- =====================================================
-- AUTO-SEND QUESTIONNAIRE WHEN BRIDE BOOKS VENDOR
-- =====================================================

-- Function to auto-send questionnaire when vendor is booked
CREATE OR REPLACE FUNCTION auto_send_questionnaire_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_questionnaire RECORD;
BEGIN
  -- Find vendor's active questionnaire with auto-send enabled
  SELECT * INTO v_questionnaire
  FROM vendor_questionnaires
  WHERE vendor_id = NEW.vendor_id
    AND is_active = true
    AND send_automatically = true
  LIMIT 1;

  -- If vendor has auto-send questionnaire, create a response for the bride
  IF FOUND THEN
    INSERT INTO questionnaire_responses (
      questionnaire_id,
      booking_id,
      bride_id,
      vendor_id,
      responses,
      is_complete,
      bride_notified
    ) VALUES (
      v_questionnaire.id,
      NEW.id,
      NEW.user_id, -- bride_id
      NEW.vendor_id,
      '{}'::jsonb, -- Empty responses initially
      false,
      true -- Will send notification to bride
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger when vendor booking is created
CREATE TRIGGER auto_send_questionnaire_trigger
  AFTER INSERT ON vendor_bookings
  FOR EACH ROW
  EXECUTE FUNCTION auto_send_questionnaire_on_booking();

-- =====================================================
-- SUCCESS! Questionnaire system created!
-- =====================================================
-- Features:
-- ✅ Vendors/brides can suggest new questions
-- ✅ Admin reviews and approves suggestions
-- ✅ Approved questions added to template library
-- ✅ Vendors customize questionnaires per category
-- ✅ Brides fill out questionnaires
-- ✅ Responses stored as documents
-- ✅ Admin can manually add questions (copy/paste or upload)
-- ✅ Popular questions auto-flagged (used 50+ times)
-- ✅ Default photography/catering/DJ/florist questions included
-- ✅ OPTIONAL AUTO-SEND: Vendors can enable to automatically send questionnaire when bride books them
-- ✅ Automatic integration with vendor bookings
-- =====================================================
