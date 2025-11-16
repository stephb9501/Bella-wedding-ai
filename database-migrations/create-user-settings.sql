-- User Settings and Profile Management

-- Wedding Profile table
CREATE TABLE IF NOT EXISTS wedding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  partner_one_name VARCHAR(200),
  partner_two_name VARCHAR(200),
  wedding_date DATE,
  wedding_location VARCHAR(300),
  venue_name VARCHAR(300),
  guest_count INTEGER,
  budget_total DECIMAL(10,2),
  wedding_theme VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  task_reminders BOOLEAN DEFAULT true,
  vendor_messages BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  reminder_days_before INTEGER DEFAULT 7,
  theme_preference VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wedding_profiles_user ON wedding_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- Disable RLS for settings tables
ALTER TABLE wedding_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
