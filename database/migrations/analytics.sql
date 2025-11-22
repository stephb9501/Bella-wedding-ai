-- Analytics and Insights Tables

-- Wedding Analytics - Track key metrics for brides
CREATE TABLE IF NOT EXISTS wedding_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,

  -- Task metrics
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  overdue_tasks INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,

  -- Budget metrics
  total_budget DECIMAL(10, 2) DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  budget_utilization DECIMAL(5, 2) DEFAULT 0,
  largest_expense_category TEXT,

  -- Vendor metrics
  vendors_contacted INTEGER DEFAULT 0,
  vendors_booked INTEGER DEFAULT 0,
  pending_responses INTEGER DEFAULT 0,

  -- Guest metrics
  total_guests INTEGER DEFAULT 0,
  rsvp_yes INTEGER DEFAULT 0,
  rsvp_no INTEGER DEFAULT 0,
  rsvp_pending INTEGER DEFAULT 0,
  rsvp_rate DECIMAL(5, 2) DEFAULT 0,

  -- Timeline metrics
  days_until_wedding INTEGER,
  weeks_until_wedding INTEGER,
  months_until_wedding INTEGER,
  on_track BOOLEAN DEFAULT true,

  -- Engagement metrics
  last_activity_at TIMESTAMP,
  activity_streak_days INTEGER DEFAULT 0,

  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(wedding_id)
);

-- Vendor Analytics - Track performance metrics for vendors
CREATE TABLE IF NOT EXISTS vendor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Booking metrics
  total_inquiries INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  booking_conversion_rate DECIMAL(5, 2) DEFAULT 0,
  pending_requests INTEGER DEFAULT 0,

  -- Revenue metrics (estimated)
  estimated_revenue DECIMAL(10, 2) DEFAULT 0,
  average_booking_value DECIMAL(10, 2) DEFAULT 0,

  -- Response metrics
  average_response_time_hours DECIMAL(6, 2) DEFAULT 0,
  response_rate DECIMAL(5, 2) DEFAULT 100,

  -- Review metrics
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  five_star_count INTEGER DEFAULT 0,
  four_star_count INTEGER DEFAULT 0,
  three_star_count INTEGER DEFAULT 0,
  two_star_count INTEGER DEFAULT 0,
  one_star_count INTEGER DEFAULT 0,

  -- Visibility metrics
  profile_views INTEGER DEFAULT 0,
  photo_views INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,

  -- Engagement metrics
  saved_count INTEGER DEFAULT 0,
  shared_count INTEGER DEFAULT 0,

  -- Ranking
  category_rank INTEGER,
  overall_rank INTEGER,

  -- Time periods
  period_start DATE,
  period_end DATE,

  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(vendor_id, period_start, period_end)
);

-- Daily Activity Log - Track user actions for insights
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,

  activity_type TEXT CHECK (activity_type IN (
    'task_completed', 'budget_updated', 'vendor_contacted',
    'guest_added', 'rsvp_received', 'timeline_updated',
    'checklist_viewed', 'budget_viewed', 'vendors_searched',
    'login', 'photo_uploaded', 'message_sent', 'review_posted'
  )),

  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Snapshots - Historical tracking
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT CHECK (entity_type IN ('wedding', 'vendor')),
  entity_id UUID NOT NULL,

  snapshot_date DATE DEFAULT CURRENT_DATE,
  metrics JSONB NOT NULL, -- Store all metrics as JSON

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(entity_type, entity_id, snapshot_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wedding_analytics_wedding ON wedding_analytics(wedding_id);
CREATE INDEX IF NOT EXISTS idx_vendor_analytics_vendor ON vendor_analytics(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_analytics_period ON vendor_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_wedding ON activity_log(wedding_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_entity ON analytics_snapshots(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date);

-- Enable Row Level Security
ALTER TABLE wedding_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wedding_analytics
CREATE POLICY wedding_analytics_user_policy ON wedding_analytics
  FOR ALL
  USING (wedding_id IN (
    SELECT id FROM weddings WHERE bride_user_id = auth.uid() OR groom_user_id = auth.uid()
  ));

-- RLS Policies for vendor_analytics
CREATE POLICY vendor_analytics_vendor_policy ON vendor_analytics
  FOR ALL
  USING (vendor_id = auth.uid());

-- RLS Policies for activity_log
CREATE POLICY activity_log_user_policy ON activity_log
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for analytics_snapshots
CREATE POLICY analytics_snapshots_wedding_policy ON analytics_snapshots
  FOR SELECT
  USING (
    entity_type = 'wedding' AND
    entity_id IN (
      SELECT id FROM weddings WHERE bride_user_id = auth.uid() OR groom_user_id = auth.uid()
    )
  );

CREATE POLICY analytics_snapshots_vendor_policy ON analytics_snapshots
  FOR SELECT
  USING (
    entity_type = 'vendor' AND
    entity_id = auth.uid()
  );

-- Function to calculate wedding analytics
CREATE OR REPLACE FUNCTION calculate_wedding_analytics(p_wedding_id UUID)
RETURNS void AS $$
DECLARE
  v_total_tasks INTEGER;
  v_completed_tasks INTEGER;
  v_overdue_tasks INTEGER;
  v_total_budget DECIMAL(10, 2);
  v_total_spent DECIMAL(10, 2);
  v_largest_expense_category TEXT;
  v_vendors_contacted INTEGER;
  v_vendors_booked INTEGER;
  v_total_guests INTEGER;
  v_rsvp_yes INTEGER;
  v_rsvp_no INTEGER;
  v_wedding_date DATE;
  v_days_until INTEGER;
BEGIN
  -- Get task metrics
  SELECT COUNT(*), COUNT(*) FILTER (WHERE completed = true), COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND completed = false)
  INTO v_total_tasks, v_completed_tasks, v_overdue_tasks
  FROM checklist_items
  WHERE wedding_id = p_wedding_id;

  -- Get budget metrics
  SELECT
    COALESCE(SUM(budgeted_amount), 0),
    COALESCE(SUM(actual_amount), 0)
  INTO v_total_budget, v_total_spent
  FROM budget_items
  WHERE wedding_id = p_wedding_id;

  -- Get largest expense category
  SELECT category INTO v_largest_expense_category
  FROM budget_items
  WHERE wedding_id = p_wedding_id
  GROUP BY category
  ORDER BY SUM(actual_amount) DESC
  LIMIT 1;

  -- Get vendor metrics
  SELECT
    COUNT(DISTINCT vendor_id),
    COUNT(DISTINCT vendor_id) FILTER (WHERE status = 'accepted')
  INTO v_vendors_contacted, v_vendors_booked
  FROM booking_requests
  WHERE wedding_id = p_wedding_id;

  -- Get guest metrics
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE rsvp_status = 'yes'),
    COUNT(*) FILTER (WHERE rsvp_status = 'no')
  INTO v_total_guests, v_rsvp_yes, v_rsvp_no
  FROM guests
  WHERE wedding_id = p_wedding_id;

  -- Get wedding date
  SELECT wedding_date INTO v_wedding_date FROM weddings WHERE id = p_wedding_id;
  v_days_until := v_wedding_date - CURRENT_DATE;

  -- Upsert analytics
  INSERT INTO wedding_analytics (
    wedding_id,
    total_tasks,
    completed_tasks,
    overdue_tasks,
    completion_rate,
    total_budget,
    total_spent,
    budget_utilization,
    largest_expense_category,
    vendors_contacted,
    vendors_booked,
    total_guests,
    rsvp_yes,
    rsvp_no,
    rsvp_pending,
    rsvp_rate,
    days_until_wedding,
    weeks_until_wedding,
    months_until_wedding,
    calculated_at
  ) VALUES (
    p_wedding_id,
    v_total_tasks,
    v_completed_tasks,
    v_overdue_tasks,
    CASE WHEN v_total_tasks > 0 THEN (v_completed_tasks::DECIMAL / v_total_tasks * 100) ELSE 0 END,
    v_total_budget,
    v_total_spent,
    CASE WHEN v_total_budget > 0 THEN (v_total_spent / v_total_budget * 100) ELSE 0 END,
    v_largest_expense_category,
    v_vendors_contacted,
    v_vendors_booked,
    v_total_guests,
    v_rsvp_yes,
    v_rsvp_no,
    v_total_guests - v_rsvp_yes - v_rsvp_no,
    CASE WHEN v_total_guests > 0 THEN ((v_rsvp_yes + v_rsvp_no)::DECIMAL / v_total_guests * 100) ELSE 0 END,
    v_days_until,
    CEIL(v_days_until::DECIMAL / 7),
    CEIL(v_days_until::DECIMAL / 30),
    NOW()
  )
  ON CONFLICT (wedding_id) DO UPDATE SET
    total_tasks = EXCLUDED.total_tasks,
    completed_tasks = EXCLUDED.completed_tasks,
    overdue_tasks = EXCLUDED.overdue_tasks,
    completion_rate = EXCLUDED.completion_rate,
    total_budget = EXCLUDED.total_budget,
    total_spent = EXCLUDED.total_spent,
    budget_utilization = EXCLUDED.budget_utilization,
    largest_expense_category = EXCLUDED.largest_expense_category,
    vendors_contacted = EXCLUDED.vendors_contacted,
    vendors_booked = EXCLUDED.vendors_booked,
    total_guests = EXCLUDED.total_guests,
    rsvp_yes = EXCLUDED.rsvp_yes,
    rsvp_no = EXCLUDED.rsvp_no,
    rsvp_pending = EXCLUDED.rsvp_pending,
    rsvp_rate = EXCLUDED.rsvp_rate,
    days_until_wedding = EXCLUDED.days_until_wedding,
    weeks_until_wedding = EXCLUDED.weeks_until_wedding,
    months_until_wedding = EXCLUDED.months_until_wedding,
    calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_wedding_id UUID,
  p_activity_type TEXT,
  p_activity_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_log (user_id, wedding_id, activity_type, activity_data)
  VALUES (p_user_id, p_wedding_id, p_activity_type, p_activity_data);
END;
$$ LANGUAGE plpgsql;
