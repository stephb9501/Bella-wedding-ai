-- Disable RLS on décor tables since we're using service role key
-- This allows the API routes with service role key to bypass RLS

ALTER TABLE decor_styles DISABLE ROW LEVEL SECURITY;
ALTER TABLE decor_zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE decor_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE decor_checklist_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE packing_boxes DISABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_items_template DISABLE ROW LEVEL SECURITY;
ALTER TABLE bride_decor_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE rental_inventory DISABLE ROW LEVEL SECURITY;
