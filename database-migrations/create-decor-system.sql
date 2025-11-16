-- =====================================================
-- BELLA WEDDING AI - DÉCOR SYSTEM DATABASE SCHEMA
-- =====================================================
-- This creates tables for comprehensive décor management
-- including zones, items, packing lists, and setup tracking

-- =====================================================
-- 1. DECOR STYLES TABLE
-- =====================================================
-- Stores wedding style themes (Modern, Rustic, Boho, etc.)
CREATE TABLE IF NOT EXISTS decor_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color_palette TEXT[], -- Array of hex colors
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default styles
INSERT INTO decor_styles (name, description, color_palette) VALUES
('Modern or Minimalist', 'Clean lines, neutral palette, simple florals', ARRAY['#FFFFFF', '#000000', '#F5F5F5', '#C0C0C0']),
('Rustic or Barn', 'Wood signs, barrels, lanterns, mason jars, lace', ARRAY['#8B4513', '#DEB887', '#F5DEB3', '#FFFAF0']),
('Boho', 'Pampas grass, macrame, rattan, layered textures', ARRAY['#D4A373', '#E9C46A', '#F4E1D2', '#FFFFFF']),
('Glam or Luxury', 'Sequins, crystal, mirrors, dramatic florals, neon', ARRAY['#FFD700', '#C0C0C0', '#000000', '#FFFFFF']),
('Garden or Romantic', 'Floral arches, petals, fairy lights, soft draping', ARRAY['#FFB6C1', '#FFF0F5', '#98FB98', '#FFFACD']),
('Vintage', 'Antique frames, lace, candelabras, heirloom style', ARRAY['#F5E6D3', '#D4AF37', '#8B7355', '#FFFAF0']),
('Industrial', 'Edison bulbs, metal frames, concrete, minimal greenery', ARRAY['#2F4F4F', '#696969', '#A9A9A9', '#FFFFFF']),
('Beach or Coastal', 'Driftwood, bamboo, tropical greenery, linen', ARRAY['#87CEEB', '#F0E68C', '#F5F5DC', '#FFFFFF']),
('Fairytale or Enchanted', 'Twinkle lights, hanging florals, soft tones, whimsy', ARRAY['#E6E6FA', '#FFB6C1', '#FFFACD', '#FFFFFF'])
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. DECOR ZONES TABLE
-- =====================================================
-- Wedding event zones/areas (Entrance, Ceremony, Reception, etc.)
CREATE TABLE IF NOT EXISTS decor_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_id UUID REFERENCES users(id) ON DELETE CASCADE,
  zone_name VARCHAR(200) NOT NULL,
  zone_type VARCHAR(100), -- entrance, ceremony, reception, cocktail, etc.
  is_applicable BOOLEAN DEFAULT true, -- Can mark as "not applicable"
  is_custom BOOLEAN DEFAULT false, -- User-added custom zone
  display_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decor_zones_bride ON decor_zones(bride_id);
CREATE INDEX IF NOT EXISTS idx_decor_zones_applicable ON decor_zones(is_applicable);

-- =====================================================
-- 3. DECOR ITEMS TABLE
-- =====================================================
-- Individual décor items with zone assignment, packing, and setup info
CREATE TABLE IF NOT EXISTS decor_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_id UUID REFERENCES users(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES decor_zones(id) ON DELETE CASCADE,
  item_name VARCHAR(200) NOT NULL,
  item_category VARCHAR(100), -- table_linen, centerpiece, signage, lighting, etc.
  quantity INTEGER DEFAULT 1,

  -- Packing Information
  packed_in_box VARCHAR(100), -- "Box 1: Entrance Décor"
  packing_priority INTEGER DEFAULT 0, -- Higher = pack first
  packing_notes TEXT,

  -- Setup Information
  assigned_to VARCHAR(200), -- Person responsible for setup
  setup_time VARCHAR(50), -- "1:00 PM" or "2 hours before ceremony"
  setup_notes TEXT,
  setup_location TEXT, -- Specific placement instructions

  -- Item Details
  is_rental BOOLEAN DEFAULT false,
  rental_vendor VARCHAR(200),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),

  -- Status
  is_completed BOOLEAN DEFAULT false,
  is_packed BOOLEAN DEFAULT false,
  is_setup BOOLEAN DEFAULT false,

  -- Style
  style_tags TEXT[], -- Array: ['rustic', 'diy', 'floral']

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decor_items_bride ON decor_items(bride_id);
CREATE INDEX IF NOT EXISTS idx_decor_items_zone ON decor_items(zone_id);
CREATE INDEX IF NOT EXISTS idx_decor_items_box ON decor_items(packed_in_box);
CREATE INDEX IF NOT EXISTS idx_decor_items_completed ON decor_items(is_completed);

-- =====================================================
-- 4. DECOR CHECKLISTS TABLE
-- =====================================================
-- Predefined checklist items by zone (templates)
CREATE TABLE IF NOT EXISTS decor_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_type VARCHAR(100) NOT NULL, -- entrance, ceremony, reception, etc.
  item_name VARCHAR(200) NOT NULL,
  item_category VARCHAR(100),
  is_universal BOOLEAN DEFAULT false, -- Universal items appear in all zones
  style_preference VARCHAR(100), -- Which style this item is best for
  display_order INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_zone_type ON decor_checklist_templates(zone_type);
CREATE INDEX IF NOT EXISTS idx_checklist_universal ON decor_checklist_templates(is_universal);

-- =====================================================
-- 5. PACKING BOXES TABLE
-- =====================================================
-- Track packing boxes for organized setup
CREATE TABLE IF NOT EXISTS packing_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_id UUID REFERENCES users(id) ON DELETE CASCADE,
  box_name VARCHAR(200) NOT NULL, -- "Box 1: Entrance Décor"
  zone_id UUID REFERENCES decor_zones(id) ON DELETE SET NULL,
  box_color VARCHAR(50), -- For color-coded organization
  assigned_to VARCHAR(200), -- Who carries this box
  load_in_priority INTEGER DEFAULT 0, -- Load in order
  setup_priority INTEGER DEFAULT 0, -- Unpack/setup order
  notes TEXT,
  is_packed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packing_boxes_bride ON packing_boxes(bride_id);
CREATE INDEX IF NOT EXISTS idx_packing_boxes_zone ON packing_boxes(zone_id);

-- =====================================================
-- 6. EMERGENCY ITEMS CHECKLIST TABLE
-- =====================================================
-- Most forgotten items + emergency supplies
CREATE TABLE IF NOT EXISTS emergency_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_name VARCHAR(200) NOT NULL,
  item_type VARCHAR(100), -- battery, tool, cleaning, backup, safety
  quantity INTEGER DEFAULT 1,
  packed_in_box VARCHAR(100),
  is_packed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_items_bride ON emergency_items(bride_id);

-- =====================================================
-- 7. RENTAL INVENTORY (FOR VENDORS)
-- =====================================================
-- Topbreed Productions rental catalog
CREATE TABLE IF NOT EXISTS rental_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  item_name VARCHAR(200) NOT NULL,
  item_category VARCHAR(100), -- backdrop, arch, table, lighting, signage, etc.
  description TEXT,
  price_per_day DECIMAL(10,2),
  quantity_available INTEGER DEFAULT 1,

  -- Visual
  image_url TEXT,
  model_3d_url TEXT, -- For AR preview (GLB/GLTF file)

  -- Details
  dimensions VARCHAR(100), -- "8ft x 8ft"
  weight VARCHAR(50),
  setup_notes TEXT,

  -- Style compatibility
  style_tags TEXT[], -- ['rustic', 'modern', 'boho']

  -- Availability
  is_available BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rental_inventory_vendor ON rental_inventory(vendor_id);
CREATE INDEX IF NOT EXISTS idx_rental_inventory_category ON rental_inventory(item_category);
CREATE INDEX IF NOT EXISTS idx_rental_inventory_available ON rental_inventory(is_available);

-- =====================================================
-- 8. BRIDE STYLE PREFERENCES TABLE
-- =====================================================
-- Store each bride's selected style + color palette
CREATE TABLE IF NOT EXISTS bride_decor_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  selected_style_id UUID REFERENCES decor_styles(id),
  custom_style_name VARCHAR(200),
  custom_color_palette TEXT[], -- Array of hex colors
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bride_preferences_bride ON bride_decor_preferences(bride_id);

-- =====================================================
-- INSERT DEFAULT CHECKLIST TEMPLATES
-- =====================================================

-- UNIVERSAL ITEMS (appear in all zones)
INSERT INTO decor_checklist_templates (zone_type, item_name, item_category, is_universal, display_order) VALUES
('universal', 'Table linens', 'table_linen', true, 1),
('universal', 'Table runners', 'table_linen', true, 2),
('universal', 'Centerpieces', 'centerpiece', true, 3),
('universal', 'Lanterns', 'lighting', true, 4),
('universal', 'Florals (real or faux)', 'floral', true, 5),
('universal', 'Greenery garlands', 'floral', true, 6),
('universal', 'Vases (short, medium, tall)', 'centerpiece', true, 7),
('universal', 'Candles (real or LED)', 'lighting', true, 8),
('universal', 'Command hooks or clips', 'tool', true, 9),
('universal', 'Easels', 'display', true, 10),
('universal', 'Scissors, zip ties, tape, clips', 'tool', true, 11);

-- ENTRANCE / WELCOME AREA
INSERT INTO decor_checklist_templates (zone_type, item_name, item_category, is_universal, display_order) VALUES
('entrance', 'Welcome sign (acrylic, wood, mirror)', 'signage', false, 1),
('entrance', 'Sign stand or easel or hanging hardware', 'display', false, 2),
('entrance', 'Greenery or floral accents', 'floral', false, 3),
('entrance', 'Lanterns or candles', 'lighting', false, 4),
('entrance', 'Directional signage', 'signage', false, 5),
('entrance', 'Entry rug or draping', 'decor', false, 6);

-- GUESTBOOK / MEMORY TABLE
INSERT INTO decor_checklist_templates (zone_type, item_name, item_category, is_universal, display_order) VALUES
('guestbook', 'Guestbook (written, audio, or video)', 'guestbook', false, 1),
('guestbook', 'Guestbook sign', 'signage', false, 2),
('guestbook', 'Pens or markers (extras)', 'supply', false, 3),
('guestbook', 'Memory photos or frames', 'decor', false, 4),
('guestbook', 'Seating chart or escort cards', 'seating', false, 5),
('guestbook', 'Card box', 'decor', false, 6),
('guestbook', 'Small florals or greenery', 'floral', false, 7);

-- CEREMONY AREA
INSERT INTO decor_checklist_templates (zone_type, item_name, item_category, is_universal, display_order) VALUES
('ceremony', 'Arch (circle, hexagon, wood, hoop, metal)', 'arch', false, 1),
('ceremony', 'Arch florals or draping', 'floral', false, 2),
('ceremony', 'Aisle decor (lanterns, petals, rugs)', 'aisle', false, 3),
('ceremony', 'Reserved seating signs', 'signage', false, 4),
('ceremony', 'Unity table items (optional)', 'decor', false, 5),
('ceremony', 'Microphone or stand if needed', 'audio', false, 6);

-- COCKTAIL AREA
INSERT INTO decor_checklist_templates (zone_type, item_name, item_category, is_universal, display_order) VALUES
('cocktail', 'Cocktail tables with linens', 'table', false, 1),
('cocktail', 'Bar signage or menu', 'signage', false, 2),
('cocktail', 'High-top centerpieces', 'centerpiece', false, 3),
('cocktail', 'Lounge furniture (if applicable)', 'furniture', false, 4),
('cocktail', 'Lighting or string lights', 'lighting', false, 5);

-- RECEPTION GUEST TABLES
INSERT INTO decor_checklist_templates (zone_type, item_name, item_category, is_universal, display_order) VALUES
('reception_tables', 'Guest table linens', 'table_linen', false, 1),
('reception_tables', 'Table runners', 'table_linen', false, 2),
('reception_tables', 'Centerpieces', 'centerpiece', false, 3),
('reception_tables', 'Table numbers', 'signage', false, 4),
('reception_tables', 'Place cards or escort cards', 'seating', false, 5),
('reception_tables', 'Napkins and napkin rings', 'table_setting', false, 6),
('reception_tables', 'Charger plates (if applicable)', 'table_setting', false, 7),
('reception_tables', 'Candles or votives', 'lighting', false, 8);

-- HEAD / SWEETHEART TABLE
INSERT INTO decor_checklist_templates (zone_type, item_name, item_category, is_universal, display_order) VALUES
('head_table', 'Table linen and runner', 'table_linen', false, 1),
('head_table', 'Couple sign (Mr and Mrs or custom)', 'signage', false, 2),
('head_table', 'Main floral arrangement', 'floral', false, 3),
('head_table', 'Backdrop draping or lights', 'backdrop', false, 4),
('head_table', 'Chair decor', 'chair', false, 5);

-- CAKE / DESSERT STATION
INSERT INTO decor_checklist_templates (zone_type, item_name, item_category, is_universal, display_order) VALUES
('cake_station', 'Cake table with linen', 'table', false, 1),
('cake_station', 'Cake stand', 'display', false, 2),
('cake_station', 'Dessert trays or risers', 'display', false, 3),
('cake_station', 'Cake topper', 'decor', false, 4),
('cake_station', 'Cake cutting set', 'supply', false, 5),
('cake_station', 'Floral accents', 'floral', false, 6),
('cake_station', 'Lighting or spotlight', 'lighting', false, 7),
('cake_station', 'Plates, napkins, forks (if DIY service)', 'supply', false, 8);

-- PHOTO / SELFIE AREA
INSERT INTO decor_checklist_templates (zone_type, item_name, item_category, is_universal, display_order) VALUES
('photo_area', 'Photo booth backdrop', 'backdrop', false, 1),
('photo_area', 'Props (signs, hats, glasses)', 'prop', false, 2),
('photo_area', 'Lighting (ring light or string lights)', 'lighting', false, 3),
('photo_area', 'Instagram frame or custom sign', 'signage', false, 4),
('photo_area', 'Polaroid camera or guest book alternative', 'photo', false, 5);

-- KIDS / COMFORT AREA
INSERT INTO decor_checklist_templates (zone_type, item_name, item_category, is_universal, display_order) VALUES
('kids_area', 'Kids table with activities', 'table', false, 1),
('kids_area', 'Coloring books and crayons', 'activity', false, 2),
('kids_area', 'Comfort items (blankets, fans)', 'comfort', false, 3),
('kids_area', 'Signage for kids area', 'signage', false, 4);

-- EXIT / SEND-OFF
INSERT INTO decor_checklist_templates (zone_type, item_name, item_category, is_universal, display_order) VALUES
('exit', 'Send-off items (sparklers, confetti, bubbles)', 'sendoff', false, 1),
('exit', 'Baskets or containers for send-off items', 'container', false, 2),
('exit', 'Exit sign or instructions', 'signage', false, 3),
('exit', 'Lighting for exit path', 'lighting', false, 4);

-- =====================================================
-- EMERGENCY ITEMS TEMPLATE
-- =====================================================
CREATE TABLE IF NOT EXISTS emergency_items_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name VARCHAR(200) NOT NULL,
  item_type VARCHAR(100), -- battery, tool, cleaning, backup, safety
  description TEXT,
  display_order INTEGER DEFAULT 0
);

INSERT INTO emergency_items_template (item_name, item_type, description, display_order) VALUES
('Extra batteries (AAA, AA)', 'battery', 'For fairy lights, lanterns, candles', 1),
('Lighters or matches', 'tool', 'For lighting candles', 2),
('Zip ties', 'tool', 'Secure draping, signs, florals', 3),
('Scissors or cutting tools', 'tool', 'Emergency trimming, ribbon cutting', 4),
('Rain plan or towels', 'backup', 'Outdoor wedding backup', 5),
('Wipes or cleaning cloths', 'cleaning', 'Quick cleanup spills', 6),
('Backup tablecloth or runner', 'backup', 'In case of stains or damage', 7),
('Extra extension cords or power strips', 'power', 'For lighting, DJ, caterer', 8),
('Command hooks', 'tool', 'Hang signs, draping without nails', 9),
('Wind weights or clips', 'tool', 'Secure outdoor items', 10),
('Safety pins', 'safety', 'Emergency dress repairs', 11),
('Duct tape', 'tool', 'Temporary fixes', 12),
('Stain remover pen', 'cleaning', 'Emergency stain treatment', 13);

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- Run this migration in Supabase SQL Editor to create all décor tables
