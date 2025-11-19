-- Seating Chart Tables
-- Tables for managing wedding seating arrangements

CREATE TABLE seating_tables (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  table_name TEXT NOT NULL,
  capacity INTEGER DEFAULT 8,
  shape TEXT CHECK (shape IN ('round', 'rectangle')) DEFAULT 'round',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seating_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  table_id INTEGER REFERENCES seating_tables(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  seat_number INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own seating tables" ON seating_tables FOR ALL USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));
CREATE POLICY "Users can manage own seating assignments" ON seating_assignments FOR ALL USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));
