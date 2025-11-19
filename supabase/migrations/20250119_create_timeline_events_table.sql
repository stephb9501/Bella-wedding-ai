-- Create timeline_events table for customizable wedding timelines
CREATE TABLE IF NOT EXISTS timeline_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('pre-wedding', 'wedding-day', 'post-wedding', 'ceremony', 'reception', 'vendor', 'coordinator', 'prep', 'transport')),
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  music_cue TEXT,
  assigned_to TEXT[],
  completed BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_timeline_events_user_id ON timeline_events(user_id);
CREATE INDEX idx_timeline_events_event_date ON timeline_events(event_date);
CREATE INDEX idx_timeline_events_order_index ON timeline_events(order_index);
CREATE INDEX idx_timeline_events_category ON timeline_events(category);

-- Enable Row Level Security
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own timeline events"
  ON timeline_events FOR SELECT
  USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can create their own timeline events"
  ON timeline_events FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can update their own timeline events"
  ON timeline_events FOR UPDATE
  USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can delete their own timeline events"
  ON timeline_events FOR DELETE
  USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timeline_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER timeline_events_updated_at
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION update_timeline_events_updated_at();
