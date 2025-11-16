-- Vendor Premium Features and Monetization

-- Add premium fields to vendors table
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_tier VARCHAR(20) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS premium_starts_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS featured_priority INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_leads_limit INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS total_leads_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified_badge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_video_url TEXT,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[],
ADD COLUMN IF NOT EXISTS business_hours JSONB,
ADD COLUMN IF NOT EXISTS social_media JSONB,
ADD COLUMN IF NOT EXISTS awards_certifications TEXT[],
ADD COLUMN IF NOT EXISTS response_time_hours INTEGER;

-- Create vendor subscriptions table
CREATE TABLE IF NOT EXISTS vendor_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  plan_name VARCHAR(50) NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  starts_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  payment_method VARCHAR(50),
  last_payment_date TIMESTAMP,
  next_payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vendor leads table (track inquiries from brides)
CREATE TABLE IF NOT EXISTS vendor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  bride_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lead_source VARCHAR(50) DEFAULT 'search',
  message TEXT,
  bride_wedding_date DATE,
  bride_location VARCHAR(300),
  estimated_budget DECIMAL(10,2),
  guest_count INTEGER,
  status VARCHAR(20) DEFAULT 'new',
  vendor_responded BOOLEAN DEFAULT false,
  vendor_response_time_hours INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vendor reviews table
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  bride_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(200),
  review_text TEXT,
  would_recommend BOOLEAN DEFAULT true,
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  verified_client BOOLEAN DEFAULT false,
  wedding_date DATE,
  photos TEXT[],
  vendor_response TEXT,
  vendor_responded_at TIMESTAMP,
  helpful_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vendor analytics table
CREATE TABLE IF NOT EXISTS vendor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  profile_views INTEGER DEFAULT 0,
  search_impressions INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0,
  leads_received INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  average_response_time_hours DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(vendor_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendors_premium ON vendors(is_premium, is_featured);
CREATE INDEX IF NOT EXISTS idx_vendors_featured_priority ON vendors(featured_priority DESC) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_vendor ON vendor_subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_status ON vendor_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_vendor_leads_vendor ON vendor_leads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_leads_bride ON vendor_leads(bride_id);
CREATE INDEX IF NOT EXISTS idx_vendor_leads_status ON vendor_leads(status);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor ON vendor_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_rating ON vendor_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_vendor_analytics_vendor_date ON vendor_analytics(vendor_id, date);

-- Disable RLS for vendor tables
ALTER TABLE vendor_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_analytics DISABLE ROW LEVEL SECURITY;

-- Add vendor pricing tiers data
COMMENT ON COLUMN vendors.premium_tier IS 'Pricing tiers: basic (free), silver ($49/mo), gold ($99/mo), platinum ($199/mo)';
COMMENT ON COLUMN vendors.monthly_leads_limit IS 'Max leads per month based on plan: basic=10, silver=50, gold=150, platinum=unlimited(999)';
COMMENT ON COLUMN vendors.featured_priority IS 'Higher number = higher in featured listings. Platinum=100, Gold=75, Silver=50';
