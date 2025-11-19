-- =====================================================
-- CREATE INCREMENT_BOOKING_REQUESTS FUNCTION
-- =====================================================
-- This function increments the booking_requests counter
-- for vendors when they receive a new booking request
-- =====================================================

CREATE OR REPLACE FUNCTION increment_booking_requests(vendor_id_input UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE vendors
  SET booking_requests = COALESCE(booking_requests, 0) + 1
  WHERE id = vendor_id_input;
END;
$$;

-- =====================================================
-- SUCCESS! Function created!
-- =====================================================
-- This will be called automatically when brides send
-- booking requests to vendors
-- =====================================================
