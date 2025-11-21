-- =====================================================
-- BELLA WEDDING AI - COMPLETE DATABASE SCHEMA
-- =====================================================
-- This script creates all tables needed for the application
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: users
-- Main user/couple table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  partner_name TEXT,
  wedding_date DATE,
  wedding_location TEXT,
  subscription_tier TEXT DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 2: brides
-- Separate bride profiles (legacy support)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.brides (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  tier TEXT DEFAULT 'standard',
  subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 3: vendors
-- Vendor business profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  category TEXT NOT NULL,
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip TEXT,
  description TEXT DEFAULT '',
  tier TEXT DEFAULT 'free',
  message_count_this_month INTEGER DEFAULT 0,
  photo_count INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 4: galleries
-- Photo galleries for weddings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL,
  gallery_name TEXT NOT NULL,
  gallery_description TEXT,
  is_public BOOLEAN DEFAULT true,
  allow_guest_uploads BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 5: gallery_photos
-- Photos within galleries
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID REFERENCES public.galleries(id) ON DELETE CASCADE,
  wedding_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by TEXT DEFAULT 'bride',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 6: checklist_items
-- Wedding planning checklist tasks
-- =====================================================
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  task TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 7: guests
-- Guest list with RSVP tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL,
  guest_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  rsvp_status TEXT DEFAULT 'pending',
  has_plus_one BOOLEAN DEFAULT false,
  plus_one_name TEXT,
  dietary_restrictions TEXT,
  link_clicked BOOLEAN DEFAULT false,
  response_submitted BOOLEAN DEFAULT false,
  table_number INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 8: timeline_events
-- Wedding day timeline
-- =====================================================
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 9: messages
-- User-vendor messaging system
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID,
  conversation_id UUID,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL,
  message_text TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 10: bookings
-- Service booking requests (newer table)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME,
  service_type TEXT,
  message TEXT,
  budget_range TEXT,
  status TEXT DEFAULT 'pending',
  vendor_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 11: vendor_bookings
-- Vendor booking requests (legacy table)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vendor_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bride_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  vendor_category TEXT NOT NULL,
  wedding_date DATE,
  venue_location TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 12: favorites
-- User saved/favorite vendors
-- =====================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

-- =====================================================
-- TABLE 13: reviews
-- Vendor reviews and ratings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  service_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

-- =====================================================
-- TABLE 14: vendor_photos
-- Vendor portfolio photos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vendor_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 15: registry_links
-- Wedding registry links
-- =====================================================
CREATE TABLE IF NOT EXISTS public.registry_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  link_title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 16: files
-- File uploads and documents
-- =====================================================
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 17: couples
-- Couple information (used in healthz check)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bride_id UUID,
  groom_id UUID,
  wedding_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 18: notifications
-- User notifications system
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 19: budget_items
-- Budget tracking items
-- =====================================================
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 20: emergency_items_template
-- Emergency kit checklist template
-- =====================================================
CREATE TABLE IF NOT EXISTS public.emergency_items_template (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE 21: admin_images
-- Admin-managed brand images
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  image_type TEXT NOT NULL CHECK (image_type IN (
    'landing_hero',
    'dashboard_banner',
    'marketing_block',
    'testimonial',
    'vendor_showcase',
    'other'
  )),
  is_active BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  description TEXT,
  alt_text TEXT
);

-- =====================================================
-- TABLE 22: conversations
-- Message conversation threads
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_guests_wedding_id ON public.guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guests_token ON public.guests(guest_token);
CREATE INDEX IF NOT EXISTS idx_checklist_user_id ON public.checklist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_user_id ON public.timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON public.bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_vendor_id ON public.vendor_bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON public.reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_photos_vendor_id ON public.vendor_photos(vendor_id);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_gallery_id ON public.gallery_photos(gallery_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON public.budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_images_type_active ON public.admin_images(image_type, is_active) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_conversations_user_vendor ON public.conversations(user_id, vendor_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brides_updated_at ON public.brides;
CREATE TRIGGER update_brides_updated_at BEFORE UPDATE ON public.brides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendors_updated_at ON public.vendors;
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_checklist_updated_at ON public.checklist_items;
CREATE TRIGGER update_checklist_updated_at BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timeline_updated_at ON public.timeline_events;
CREATE TRIGGER update_timeline_updated_at BEFORE UPDATE ON public.timeline_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guests_updated_at ON public.guests;
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to enforce single active image per type
CREATE OR REPLACE FUNCTION public.enforce_single_active_image()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.admin_images
    SET is_active = false, updated_at = NOW()
    WHERE image_type = NEW.image_type
      AND id != NEW.id
      AND is_active = true
      AND is_archived = false;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_single_active_image ON public.admin_images;
CREATE TRIGGER trigger_enforce_single_active_image
  BEFORE INSERT OR UPDATE ON public.admin_images
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_active_image();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Note: Run the RLS migration file separately after this
-- File: 20250116_enable_rls_security.sql
-- =====================================================

COMMENT ON TABLE public.users IS 'Main user/couple profiles';
COMMENT ON TABLE public.brides IS 'Legacy bride profiles (for backward compatibility)';
COMMENT ON TABLE public.vendors IS 'Vendor business profiles';
COMMENT ON TABLE public.galleries IS 'Photo galleries for weddings';
COMMENT ON TABLE public.gallery_photos IS 'Photos within galleries';
COMMENT ON TABLE public.checklist_items IS 'Wedding planning checklist tasks';
COMMENT ON TABLE public.guests IS 'Guest list with RSVP tracking';
COMMENT ON TABLE public.timeline_events IS 'Wedding day timeline';
COMMENT ON TABLE public.messages IS 'User-vendor messaging system';
COMMENT ON TABLE public.bookings IS 'Service booking requests';
COMMENT ON TABLE public.vendor_bookings IS 'Legacy vendor booking requests';
COMMENT ON TABLE public.favorites IS 'User saved/favorite vendors';
COMMENT ON TABLE public.reviews IS 'Vendor reviews and ratings';
COMMENT ON TABLE public.vendor_photos IS 'Vendor portfolio photos';
COMMENT ON TABLE public.registry_links IS 'Wedding registry links';
COMMENT ON TABLE public.files IS 'File uploads and documents';
COMMENT ON TABLE public.couples IS 'Couple information';
COMMENT ON TABLE public.notifications IS 'User notifications';
COMMENT ON TABLE public.budget_items IS 'Budget tracking items';
COMMENT ON TABLE public.emergency_items_template IS 'Emergency kit checklist template';
COMMENT ON TABLE public.admin_images IS 'Admin-managed brand images';
COMMENT ON TABLE public.conversations IS 'Message conversation threads';

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to verify tables were created:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
--
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
-- =====================================================
