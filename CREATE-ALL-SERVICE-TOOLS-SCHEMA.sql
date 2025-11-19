-- =====================================================
-- COMPREHENSIVE SERVICE TOOLS FOR ALL VENDOR TYPES
-- =====================================================
-- Tools for every wedding vendor category
-- Each vendor gets tools relevant to their service
-- =====================================================

-- CATERER/FOOD SERVICE TOOLS
CREATE TABLE IF NOT EXISTS catering_menu_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  meal_type VARCHAR(100), -- cocktail_hour, dinner, dessert, late_night
  service_style VARCHAR(100), -- buffet, plated, family_style, stations

  menu_items JSONB NOT NULL, -- [{item_name, description, dietary_notes, quantity, cost}]
  dietary_restrictions JSONB, -- [{restriction, guest_count, special_menu}]

  guest_count INTEGER,
  final_guest_count INTEGER,
  guest_count_deadline DATE,

  approved_by_bride BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FLORIST TOOLS
CREATE TABLE IF NOT EXISTS floral_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  arrangement_type VARCHAR(100), -- bouquet, centerpiece, ceremony_arch, boutonniere
  location VARCHAR(255), -- Where it will be placed

  flowers JSONB NOT NULL, -- [{flower_type, color, quantity, season, cost}]
  design_notes TEXT,
  mood_board_url TEXT,

  delivery_time TIME,
  setup_time TIME,
  removal_needed BOOLEAN DEFAULT false,

  approved_by_bride BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENUE COORDINATOR TOOLS
CREATE TABLE IF NOT EXISTS venue_logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  setup_type VARCHAR(100), -- ceremony, reception, cocktail_area
  layout_type VARCHAR(100), -- rounds, long_tables, theater, etc.

  room_setup JSONB, -- [{item: 'tables', quantity: 20, notes: 'round 60-inch'}]
  equipment_needed JSONB, -- [{item: 'microphone', quantity: 2, provided_by: 'venue'}]
  power_requirements JSONB, -- [{vendor: 'DJ', outlets: 2, amps: 20}]

  load_in_time TIME,
  setup_duration_minutes INTEGER,
  breakdown_start TIME,

  restrictions TEXT, -- Noise curfew, no candles, etc.
  parking_info TEXT,
  vendor_access_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CAKE/DESSERT VENDOR TOOLS
CREATE TABLE IF NOT EXISTS cake_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  cake_type VARCHAR(100), -- wedding_cake, grooms_cake, dessert_table
  tiers INTEGER,
  servings INTEGER,

  flavors JSONB, -- [{tier: 1, flavor: 'vanilla', filling: 'raspberry'}]
  design_details JSONB, -- [{element: 'flowers', color: 'blush', placement: 'top'}]
  dietary_options JSONB, -- gluten_free, vegan, etc.

  delivery_time TIME,
  setup_requirements TEXT,
  refrigeration_needed BOOLEAN DEFAULT false,

  tasting_scheduled BOOLEAN DEFAULT false,
  tasting_date DATE,

  approved_by_bride BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HAIR & MAKEUP ARTIST TOOLS
CREATE TABLE IF NOT EXISTS beauty_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  client_type VARCHAR(100), -- bride, bridesmaid, mother, flower_girl

  services JSONB NOT NULL, -- [{service: 'hair', style: 'updo', duration: 60, price: 150}]

  appointment_time TIME,
  duration_minutes INTEGER,
  location VARCHAR(255), -- Venue, hotel, salon

  trial_scheduled BOOLEAN DEFAULT false,
  trial_date DATE,
  trial_approved BOOLEAN DEFAULT false,

  products_to_use JSONB, -- [{product: 'hairspray', brand: 'requested by bride'}]
  inspiration_photos JSONB, -- [{url, notes}]

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSPORTATION TOOLS
CREATE TABLE IF NOT EXISTS transportation_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  vehicle_type VARCHAR(100), -- limo, shuttle, classic_car, etc.
  passenger_capacity INTEGER,

  routes JSONB NOT NULL, -- [{from, to, distance, duration, pickup_time}]

  special_requests TEXT,
  decorations_needed BOOLEAN DEFAULT false,

  driver_name VARCHAR(255),
  driver_phone VARCHAR(50),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OFFICIANT TOOLS
CREATE TABLE IF NOT EXISTS ceremony_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  ceremony_type VARCHAR(100), -- religious, secular, interfaith, custom
  ceremony_length_minutes INTEGER,

  script_sections JSONB, -- [{section: 'opening', content: '...', duration: 5}]
  vows_type VARCHAR(100), -- traditional, personal, silent
  readings JSONB, -- [{title, reader_name, text}]

  special_rituals JSONB, -- [{ritual: 'unity_candle', timing: 'after_vows'}]

  rehearsal_date DATE,
  rehearsal_time TIME,
  rehearsal_location VARCHAR(255),

  approved_by_couple BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENTERTAINMENT (BEYOND DJ) TOOLS
CREATE TABLE IF NOT EXISTS entertainment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  entertainment_type VARCHAR(100), -- band, magician, photo_booth, dancers, etc.

  performance_times JSONB, -- [{start_time, duration, location, song_count}]
  equipment_needs JSONB, -- [{item, quantity, provided_by, power_needed}]
  space_requirements TEXT, -- Stage size, ceiling height, etc.

  song_list JSONB, -- If applicable
  special_requests TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STATIONERY/INVITATIONS TOOLS
CREATE TABLE IF NOT EXISTS stationery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  item_type VARCHAR(100), -- save_the_date, invitation, program, menu, thank_you
  quantity INTEGER,

  design_details JSONB, -- [{element: 'color_scheme', value: 'blush_gold'}]
  wording TEXT,

  proofs_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,

  print_deadline DATE,
  delivery_date DATE,

  guest_list_final BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RENTAL COMPANY TOOLS
CREATE TABLE IF NOT EXISTS rental_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES wedding_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,

  items JSONB NOT NULL, -- [{item, category, quantity, price, delivery_fee}]
  -- Categories: linens, chairs, tables, tents, lighting, decor

  delivery_time TIME,
  setup_included BOOLEAN DEFAULT false,
  pickup_time TIME,

  special_instructions TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMIZABLE CHECKLIST TEMPLATES
CREATE TABLE IF NOT EXISTS checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_category VARCHAR(100) NOT NULL, -- DJ, Photographer, Planner, etc.

  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false, -- Platform default templates

  items JSONB NOT NULL, -- [{item_name, category, default_priority, typical_deadline}]

  created_by_vendor_id UUID REFERENCES vendors(id),
  is_public BOOLEAN DEFAULT false, -- Can other vendors use this?

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default templates
INSERT INTO checklist_templates (vendor_category, template_name, is_default, items) VALUES

-- DJ Template
('DJ', 'Standard DJ Wedding Checklist', true, '[
  {"item_name": "Final song list from bride", "category": "music", "priority": "high", "deadline_days_before": 30},
  {"item_name": "Special dance songs (first dance, parent dances)", "category": "music", "priority": "urgent", "deadline_days_before": 45},
  {"item_name": "Do not play list", "category": "music", "priority": "medium", "deadline_days_before": 30},
  {"item_name": "Venue power/outlet locations", "category": "logistics", "priority": "high", "deadline_days_before": 14},
  {"item_name": "Load-in time confirmation", "category": "schedule", "priority": "high", "deadline_days_before": 7},
  {"item_name": "Ceremony music selections", "category": "music", "priority": "high", "deadline_days_before": 30},
  {"item_name": "Reception timeline from planner", "category": "schedule", "priority": "high", "deadline_days_before": 14},
  {"item_name": "Microphone needs for toasts", "category": "equipment", "priority": "medium", "deadline_days_before": 14}
]'::jsonb),

-- Photographer Template
('Photographer', 'Essential Photography Info Checklist', true, '[
  {"item_name": "Must-have family photo list", "category": "photos", "priority": "urgent", "deadline_days_before": 14},
  {"item_name": "Timeline for couple/bridal party photos", "category": "schedule", "priority": "high", "deadline_days_before": 21},
  {"item_name": "Venue restrictions (flash, locations)", "category": "venue_details", "priority": "high", "deadline_days_before": 30},
  {"item_name": "Special moments to capture", "category": "photos", "priority": "medium", "deadline_days_before": 21},
  {"item_name": "Engagement photos decision", "category": "photos", "priority": "medium", "deadline_days_before": 90},
  {"item_name": "Album preferences", "category": "deliverables", "priority": "low", "deadline_days_before": 60},
  {"item_name": "Second photographer needed?", "category": "logistics", "priority": "high", "deadline_days_before": 60}
]'::jsonb),

-- Planner Template
('Wedding Planner', 'Full Service Planning Checklist', true, '[
  {"item_name": "Final guest count", "category": "guest_info", "priority": "urgent", "deadline_days_before": 14},
  {"item_name": "Dietary restrictions list", "category": "catering", "priority": "high", "deadline_days_before": 21},
  {"item_name": "Seating chart approval", "category": "guest_info", "priority": "high", "deadline_days_before": 7},
  {"item_name": "Ceremony rehearsal attendance", "category": "schedule", "priority": "high", "deadline_days_before": 3},
  {"item_name": "Vendor contact list", "category": "logistics", "priority": "high", "deadline_days_before": 14},
  {"item_name": "Day-of emergency contacts", "category": "logistics", "priority": "urgent", "deadline_days_before": 7},
  {"item_name": "Wedding party arrival times", "category": "schedule", "priority": "high", "deadline_days_before": 7},
  {"item_name": "Payment schedule completion", "category": "contracts", "priority": "urgent", "deadline_days_before": 30}
]'::jsonb),

-- Caterer Template
('Caterer', 'Catering Service Checklist', true, '[
  {"item_name": "Final menu selection", "category": "menu", "priority": "urgent", "deadline_days_before": 45},
  {"item_name": "Final guest count", "category": "guest_info", "priority": "urgent", "deadline_days_before": 7},
  {"item_name": "Dietary restrictions/allergies", "category": "dietary", "priority": "urgent", "deadline_days_before": 14},
  {"item_name": "Bar package preferences", "category": "beverages", "priority": "high", "deadline_days_before": 30},
  {"item_name": "Cake cutting service needed?", "category": "service", "priority": "medium", "deadline_days_before": 21},
  {"item_name": "Vendor meal count", "category": "logistics", "priority": "medium", "deadline_days_before": 7},
  {"item_name": "Kitchen/prep area walkthrough", "category": "venue_details", "priority": "high", "deadline_days_before": 30}
]'::jsonb),

-- Florist Template
('Florist', 'Floral Design Checklist', true, '[
  {"item_name": "Bouquet design approval", "category": "flowers", "priority": "high", "deadline_days_before": 45},
  {"item_name": "Centerpiece design/quantity", "category": "flowers", "priority": "high", "deadline_days_before": 30},
  {"item_name": "Ceremony flowers (arch, aisle, etc)", "category": "flowers", "priority": "high", "deadline_days_before": 30},
  {"item_name": "Boutonniere/corsage count", "category": "flowers", "priority": "medium", "deadline_days_before": 21},
  {"item_name": "Color scheme confirmation", "category": "design", "priority": "high", "deadline_days_before": 60},
  {"item_name": "Delivery/setup time coordination", "category": "logistics", "priority": "high", "deadline_days_before": 14},
  {"item_name": "Flower allergies check", "category": "special_requests", "priority": "medium", "deadline_days_before": 30}
]'::jsonb);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_catering_menu_plans_project ON catering_menu_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_floral_designs_project ON floral_designs(project_id);
CREATE INDEX IF NOT EXISTS idx_venue_logistics_project ON venue_logistics(project_id);
CREATE INDEX IF NOT EXISTS idx_cake_designs_project ON cake_designs(project_id);
CREATE INDEX IF NOT EXISTS idx_beauty_schedules_project ON beauty_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_transportation_plans_project ON transportation_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_ceremony_scripts_project ON ceremony_scripts(project_id);
CREATE INDEX IF NOT EXISTS idx_entertainment_plans_project ON entertainment_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_stationery_orders_project ON stationery_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_rental_orders_project ON rental_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_checklist_templates_category ON checklist_templates(vendor_category, is_default);

-- RLS Policies (vendors can only see their own)
ALTER TABLE catering_menu_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE floral_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cake_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE beauty_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceremony_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE entertainment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE stationery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors manage their catering plans"
  ON catering_menu_plans FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors manage their floral designs"
  ON floral_designs FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors manage venue logistics"
  ON venue_logistics FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors manage cake designs"
  ON cake_designs FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors manage beauty schedules"
  ON beauty_schedules FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors manage transportation"
  ON transportation_plans FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors manage ceremony scripts"
  ON ceremony_scripts FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors manage entertainment plans"
  ON entertainment_plans FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors manage stationery orders"
  ON stationery_orders FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors manage rental orders"
  ON rental_orders FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- Anyone can view public templates, vendors can create their own
CREATE POLICY "View templates"
  ON checklist_templates FOR SELECT
  USING (is_public = true OR created_by_vendor_id = auth.uid());

CREATE POLICY "Vendors create templates"
  ON checklist_templates FOR INSERT
  WITH CHECK (created_by_vendor_id = auth.uid());

-- Triggers for timestamps
CREATE TRIGGER update_catering_updated_at
  BEFORE UPDATE ON catering_menu_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_floral_updated_at
  BEFORE UPDATE ON floral_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_updated_at
  BEFORE UPDATE ON venue_logistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cake_updated_at
  BEFORE UPDATE ON cake_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beauty_updated_at
  BEFORE UPDATE ON beauty_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transportation_updated_at
  BEFORE UPDATE ON transportation_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ceremony_updated_at
  BEFORE UPDATE ON ceremony_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entertainment_updated_at
  BEFORE UPDATE ON entertainment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stationery_updated_at
  BEFORE UPDATE ON stationery_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_updated_at
  BEFORE UPDATE ON rental_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_updated_at
  BEFORE UPDATE ON checklist_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS! All vendor service tools created!
-- =====================================================
-- Every wedding vendor category now has:
-- - Specialized tools for their service
-- - Customizable checklist templates
-- - Bride approval tracking
-- - All with version control (when integrated)
-- =====================================================
