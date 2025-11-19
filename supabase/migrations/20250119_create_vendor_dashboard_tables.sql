-- Vendor Leads Table
CREATE TABLE IF NOT EXISTS vendor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  bride_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bride_name VARCHAR(255) NOT NULL,
  bride_email VARCHAR(255) NOT NULL,
  bride_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'booked', 'declined')),
  message TEXT NOT NULL,
  response TEXT,
  conversation_history JSONB DEFAULT '[]'::jsonb,
  converted BOOLEAN DEFAULT false,
  lost_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor Bookings Table (enhanced)
CREATE TABLE IF NOT EXISTS vendor_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  bride_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bride_name VARCHAR(255) NOT NULL,
  bride_email VARCHAR(255) NOT NULL,
  bride_phone VARCHAR(50),
  event_date DATE NOT NULL,
  event_time TIME,
  service_type VARCHAR(255),
  price DECIMAL(10, 2),
  deposit_paid DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  venue VARCHAR(255),
  guest_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor Portfolio Table
CREATE TABLE IF NOT EXISTS vendor_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  tags TEXT[],
  featured BOOLEAN DEFAULT false,
  album VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor Analytics Table
CREATE TABLE IF NOT EXISTS vendor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  profile_views INTEGER DEFAULT 0,
  leads_received INTEGER DEFAULT 0,
  bookings_made INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, date)
);

-- Vendor Reviews Table (enhanced)
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  bride_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bride_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT NOT NULL,
  response TEXT,
  wedding_date DATE,
  verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_leads_vendor_id ON vendor_leads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_leads_status ON vendor_leads(status);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_vendor_id ON vendor_bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_event_date ON vendor_bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_vendor_portfolio_vendor_id ON vendor_portfolio(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_portfolio_featured ON vendor_portfolio(featured);
CREATE INDEX IF NOT EXISTS idx_vendor_analytics_vendor_date ON vendor_analytics(vendor_id, date);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON vendor_reviews(vendor_id);

-- Enable RLS
ALTER TABLE vendor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_leads
CREATE POLICY "Vendors can view their own leads" ON vendor_leads
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own leads" ON vendor_leads
  FOR UPDATE USING (vendor_id = auth.uid());

CREATE POLICY "Anyone can create leads" ON vendor_leads
  FOR INSERT WITH CHECK (true);

-- RLS Policies for vendor_bookings
CREATE POLICY "Vendors can view their own bookings" ON vendor_bookings
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own bookings" ON vendor_bookings
  FOR UPDATE USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert their own bookings" ON vendor_bookings
  FOR INSERT WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Anyone can create bookings" ON vendor_bookings
  FOR INSERT WITH CHECK (true);

-- RLS Policies for vendor_portfolio
CREATE POLICY "Anyone can view portfolio" ON vendor_portfolio
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own portfolio" ON vendor_portfolio
  FOR ALL USING (vendor_id = auth.uid());

-- RLS Policies for vendor_analytics
CREATE POLICY "Vendors can view their own analytics" ON vendor_analytics
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert their own analytics" ON vendor_analytics
  FOR INSERT WITH CHECK (vendor_id = auth.uid());

-- RLS Policies for vendor_reviews
CREATE POLICY "Anyone can view reviews" ON vendor_reviews
  FOR SELECT USING (true);

CREATE POLICY "Vendors can update their own review responses" ON vendor_reviews
  FOR UPDATE USING (vendor_id = auth.uid());

CREATE POLICY "Authenticated users can create reviews" ON vendor_reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_vendor_leads_updated_at BEFORE UPDATE ON vendor_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_bookings_updated_at BEFORE UPDATE ON vendor_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_reviews_updated_at BEFORE UPDATE ON vendor_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
