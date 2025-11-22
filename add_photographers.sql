-- Add Arkansas Wedding Photographers to Vendors Table
-- Using only verified contact information provided

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
-- 1. The Linns - VERIFIED EMAIL
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

-- 2. Boston Mountain Photo - VERIFIED EMAIL & PHONE
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

-- 3. Allie Atkisson Imaging - VERIFIED EMAIL
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

-- 4. Arkansas Wedding Collection - Address only, no contact info
(
  'vendor+arkansasweddingcollection@bellawedding.ai',
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

-- 5. Heather Jenkins Photography - Website only
(
  'vendor+heatherjenkins@bellawedding.ai',
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

-- 6. Caroline M. Holt Photographer LLC - Little Rock only
(
  'vendor+carolinemholt@bellawedding.ai',
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

-- 7. Chelsea Duff Photography - Website only
(
  'vendor+chelseaduff@bellawedding.ai',
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

-- 8. Avis Rubra Photography - Website only
(
  'vendor+avisrubra@bellawedding.ai',
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

-- 9. Taryn Lynn Photography - Location only
(
  'vendor+tarynlynn@bellawedding.ai',
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

-- 10. Miles Witt Boyer Photography - Name only
(
  'vendor+mileswittboyer@bellawedding.ai',
  'vendor',
  'Miles Witt Boyer Photography',
  'photographer',
  NULL,
  NULL,
  'Northwest Arkansas',
  'AR',
  NULL,
  NULL,
  'free',
  true
),

-- 11. Around The Rock Photography - Name only
(
  'vendor+aroundtherock@bellawedding.ai',
  'vendor',
  'Around The Rock Photography',
  'photographer',
  NULL,
  NULL,
  'Central Arkansas',
  'AR',
  NULL,
  NULL,
  'free',
  true
),

-- 12. Kati Mallory Photo & Design - Name only
(
  'vendor+katimallory@bellawedding.ai',
  'vendor',
  'Kati Mallory Photo & Design',
  'photographer',
  NULL,
  NULL,
  'Arkansas',
  'AR',
  NULL,
  NULL,
  'free',
  true
),

-- 13. Kayleigh Ross Photography - Name only
(
  'vendor+kayleighross@bellawedding.ai',
  'vendor',
  'Kayleigh Ross Photography',
  'photographer',
  NULL,
  NULL,
  'Arkansas',
  'AR',
  NULL,
  NULL,
  'free',
  true
),

-- 14. Tony Baker Photography - Little Rock only
(
  'vendor+tonybaker@bellawedding.ai',
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

-- 15. Taylor Howard Photography - Searcy only
(
  'vendor+taylorhoward@bellawedding.ai',
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

-- 16. Kylee Grace Photography - Bentonville only
(
  'vendor+kyleegrace@bellawedding.ai',
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

-- 17. Hope Mulanax Photography - Website only
(
  'vendor+hopemulanax@bellawedding.ai',
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

-- 18. Beaty Creative Photo - Website only
(
  'vendor+beatycreative@bellawedding.ai',
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

-- 19. Count In Threes Photo - Website only
(
  'vendor+countinthrees@bellawedding.ai',
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

-- 20. Eternal Memories Photography - Searcy only
(
  'vendor+eternalmemories@bellawedding.ai',
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

-- 21. Alice McLain Photography - Website only
(
  'vendor+alicemclain@bellawedding.ai',
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

-- 22. Megan Thackston Photo & Film - Name only
(
  'vendor+meganthackston@bellawedding.ai',
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
