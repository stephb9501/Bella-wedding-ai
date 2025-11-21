-- Add Arkansas Wedding Photographers to Vendors Table
-- Comprehensive list of photographers

INSERT INTO public.users (
  email,
  role,
  business_name,
  business_type,
  phone,
  address,
  city,
  state,
  zip,
  website,
  subscription_tier,
  is_active
) VALUES
-- 1. The Linns - Arkansas Wedding & Elopement Photographers
(
  'contact@thelinns.co',
  'vendor',
  'The Linns',
  'photographer',
  NULL,
  '1818 N Taylor St #325',
  'Little Rock',
  'AR',
  '72207',
  'https://thelinns.co',
  'free',
  true
),

-- 2. Boston Mountain Photo
(
  'hello@bostonmountainphoto.com',
  'vendor',
  'Boston Mountain Photo',
  'photographer',
  '(479) 354-2824',
  '1556A E Emma Ave',
  'Springdale',
  'AR',
  '72758',
  'https://bostonmountainphoto.com',
  'free',
  true
),

-- 3. Arkansas Wedding Collection
(
  'info@arkansasweddingcollection.com',
  'vendor',
  'Arkansas Wedding Collection',
  'photographer',
  NULL,
  '9000 Commerce Cv Ste 3',
  'North Little Rock',
  'AR',
  '72113',
  NULL,
  'free',
  true
),

-- 4. Heather Jenkins Photography
(
  'info@heatherjenkins.com',
  'vendor',
  'Heather Jenkins Photography',
  'photographer',
  NULL,
  '10310 W Markham St #222',
  'Little Rock',
  'AR',
  '72205',
  'https://heatherjenkins.com',
  'free',
  true
),

-- 5. Caroline M. Holt Photographer LLC
(
  'info@carolinemholt.com',
  'vendor',
  'Caroline M. Holt Photographer LLC',
  'photographer',
  NULL,
  NULL,
  'Little Rock',
  'AR',
  NULL,
  NULL,
  'free',
  true
),

-- 6. Chelsea Duff Photography
(
  'info@chelseaduffphotography.com',
  'vendor',
  'Chelsea Duff Photography',
  'photographer',
  NULL,
  NULL,
  'Jonesboro',
  'AR',
  NULL,
  'https://chelseaduffphotography.com',
  'free',
  true
),

-- 7. Avis Rubra Photography
(
  'info@avisrubraphotography.com',
  'vendor',
  'Avis Rubra Photography',
  'photographer',
  NULL,
  NULL,
  'Central Arkansas',
  'AR',
  NULL,
  'https://avisrubraphotography.com',
  'free',
  true
),

-- 8. Taryn Lynn Photography
(
  'info@tarynlynnphotography.com',
  'vendor',
  'Taryn Lynn Photography',
  'photographer',
  NULL,
  NULL,
  'Springdale',
  'AR',
  NULL,
  NULL,
  'free',
  true
),

-- 9. Allie Atkisson Imaging
(
  'allieatkissonimaging@gmail.com',
  'vendor',
  'Allie Atkisson Imaging',
  'photographer',
  NULL,
  NULL,
  'Little Rock',
  'AR',
  NULL,
  'https://allieatkissonimaging.com',
  'free',
  true
),

-- 10. Miles Witt Boyer Photography
(
  'info@mileswittboyer.com',
  'vendor',
  'Miles Witt Boyer Photography',
  'photographer',
  NULL,
  NULL,
  'Northwest Arkansas',
  'AR',
  NULL,
  'https://mileswittboyer.com',
  'free',
  true
),

-- 11. Around The Rock Photography
(
  'info@aroundtherock.com',
  'vendor',
  'Around The Rock Photography',
  'photographer',
  NULL,
  NULL,
  'Central Arkansas',
  'AR',
  NULL,
  'https://aroundtherock.com',
  'free',
  true
),

-- 12. Kati Mallory Photo & Design
(
  'info@katimallory.com',
  'vendor',
  'Kati Mallory Photo & Design',
  'photographer',
  NULL,
  NULL,
  'Arkansas',
  'AR',
  NULL,
  'https://katimallory.com',
  'free',
  true
),

-- 13. Kayleigh Ross Photography
(
  'info@kayleighross.com',
  'vendor',
  'Kayleigh Ross Photography',
  'photographer',
  NULL,
  NULL,
  'Arkansas',
  'AR',
  NULL,
  'https://kayleighross.com',
  'free',
  true
),

-- 14. Tony Baker Photography
(
  'info@tonybakerphotography.com',
  'vendor',
  'Tony Baker Photography',
  'photographer',
  NULL,
  NULL,
  'Little Rock',
  'AR',
  NULL,
  NULL,
  'free',
  true
),

-- 15. Taylor Howard Photography
(
  'info@taylorhowardphotography.com',
  'vendor',
  'Taylor Howard Photography',
  'photographer',
  NULL,
  NULL,
  'Searcy',
  'AR',
  NULL,
  NULL,
  'free',
  true
),

-- 16. Kylee Grace Photography
(
  'info@kyleegracephotography.com',
  'vendor',
  'Kylee Grace Photography',
  'photographer',
  NULL,
  NULL,
  'Bentonville',
  'AR',
  NULL,
  NULL,
  'free',
  true
),

-- 17. Hope Mulanax Photography
(
  'info@hopemulanax.com',
  'vendor',
  'Hope Mulanax Photography',
  'photographer',
  NULL,
  NULL,
  'Northwest Arkansas',
  'AR',
  NULL,
  'https://hopemulanax.com',
  'free',
  true
),

-- 18. Beaty Creative Photo
(
  'info@beatycreativephoto.com',
  'vendor',
  'Beaty Creative Photo',
  'photographer',
  NULL,
  NULL,
  'Arkansas',
  'AR',
  NULL,
  'https://beatycreativephoto.com',
  'free',
  true
),

-- 19. Count In Threes Photo
(
  'info@countinthreesphoto.com',
  'vendor',
  'Count In Threes Photo',
  'photographer',
  NULL,
  NULL,
  'Arkansas',
  'AR',
  NULL,
  'https://countinthreesphoto.com',
  'free',
  true
),

-- 20. Eternal Memories Photography
(
  'info@eternalmemoriesphotography.com',
  'vendor',
  'Eternal Memories Photography',
  'photographer',
  NULL,
  NULL,
  'Searcy',
  'AR',
  NULL,
  NULL,
  'free',
  true
),

-- 21. Alice McLain Photography
(
  'info@alicemclainphotography.com',
  'vendor',
  'Alice McLain Photography',
  'photographer',
  NULL,
  NULL,
  'Northeast Arkansas',
  'AR',
  NULL,
  'https://alicemclainphotography.com',
  'free',
  true
),

-- 22. Megan Thackston Photo & Film
(
  'info@meganthackston.com',
  'vendor',
  'Megan Thackston Photo & Film',
  'photographer',
  NULL,
  NULL,
  'Arkansas',
  'AR',
  NULL,
  NULL,
  'free',
  true
)

ON CONFLICT (email) DO NOTHING;

-- Display the newly added photographers
SELECT
  id,
  email,
  business_name,
  city,
  state,
  phone,
  website,
  created_at
FROM public.users
WHERE business_type = 'photographer'
  AND state = 'AR'
ORDER BY business_name;
