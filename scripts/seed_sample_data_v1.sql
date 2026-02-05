-- Seed sample venues
INSERT INTO venues (name, description, address, city, category, image_url, rating, price_range, features, promo_text, is_partner)
VALUES
  ('The Ivy Chelsea Garden', 'An elegant dining destination with beautiful garden views and contemporary British cuisine', '197 King''s Road, Chelsea', 'London', 'Fine Dining', '/images/restaurant-elegant-dining-ambiance-warm-lighting.jpg', 4.8, '$$$', 'Outdoor Seating;Private Dining;Weekend Brunch;Cocktail Bar', '30% off mains this week', true),
  ('Nightjar', 'Award-winning cocktail bar with live jazz in a 1920s speakeasy setting', '129 City Road, Shoreditch', 'London', 'Cocktail Bar', '/images/cocktail-bar-moody-lighting-craft-drinks-vintage.jpg', 4.7, '$$', 'Live Music;Craft Cocktails;Late Night;Reservations Required', '2-for-1 cocktails on Fridays', true),
  ('Sketch Gallery', 'Instagrammable restaurant with pink velvet interiors and modern European cuisine', '9 Conduit Street, Mayfair', 'London', 'Restaurant & Bar', '/images/restaurant-pink-interior-modern-design-elegant.jpg', 4.6, '$$$', 'Afternoon Tea;Photo Worthy;Champagne Bar;Fine Dining', 'Complimentary dessert with dinner', true),
  ('Four Quarters', 'Arcade bar with vintage games, craft beer, and American street food', '187 Rye Lane, Peckham', 'London', 'Arcade Bar', '/images/arcade-bar-neon-lights-gaming-machines-casual.jpg', 4.5, '$', 'Arcade Games;Craft Beer;Late Night;Groups Welcome', 'Free game tokens with first drink', true),
  ('Aqua Shard', 'Contemporary British restaurant on the 31st floor with panoramic London views', 'Level 31, The Shard', 'London', 'Fine Dining', '/images/restaurant-panoramic-views-modern-interior-upscale.jpg', 4.9, '$$$$', 'Skyline Views;Private Events;Tasting Menu;Wine Pairing', 'Sunday brunch special', true),
  ('BLISS Spa London', 'Luxury wellness retreat offering holistic treatments and relaxation therapies', '60 Sloane Avenue, Chelsea', 'London', 'Spa & Wellness', '/images/luxurious-spa-wellness-center-tranquil-atmosphere-s-vevzs.jpg', 4.8, '$$$', 'Couples Massage;Sauna;Hot Tub;Aromatherapy', 'Book a couples package', true)
ON CONFLICT (name) DO NOTHING;

-- Seed sample deals  
INSERT INTO deals (venue_id, title, description, type, discount_amount, promo_code, valid_from, valid_until, cta_text, cta_url)
SELECT 
  v.id,
  'Weekend Brunch Special',
  'Enjoy 30% off all brunch mains every Saturday and Sunday. Book your table now!',
  'limited_time',
  30,
  'BRUNCH30',
  NOW(),
  NOW() + INTERVAL '30 days',
  'Book Now',
  '/app/spots'
FROM venues v WHERE v.name = 'The Ivy Chelsea Garden'
ON CONFLICT DO NOTHING;

INSERT INTO deals (venue_id, title, description, type, discount_amount, promo_code, valid_from, valid_until, cta_text, cta_url)
SELECT 
  v.id,
  'Happy Hour Cocktails',
  'Get 2-for-1 on all cocktails every Friday from 6-8pm. No reservation needed.',
  'new_arrival',
  50,
  'HAPPY2FOR1',
  NOW(),
  NOW() + INTERVAL '60 days',
  'View Menu',
  '/app/spots'
FROM venues v WHERE v.name = 'Nightjar'
ON CONFLICT DO NOTHING;

INSERT INTO deals (venue_id, title, description, type, discount_amount, promo_code, valid_from, valid_until, cta_text, cta_url)
SELECT 
  v.id,
  'Couples Spa Package',
  'Luxury spa day for two including massage, sauna access, and champagne. Perfect for date day.',
  'amenity',
  20,
  'COUPLES20',
  NOW(),
  NOW() + INTERVAL '90 days',
  'Book Package',
  '/app/spots'
FROM venues v WHERE v.name = 'BLISS Spa London'
ON CONFLICT DO NOTHING;

-- Seed sample quiz questions (for profiles to use)
-- Note: These would normally be created by individual users, this is just sample data
INSERT INTO quiz_questions (user_id, question, category, correct_answer, points, display_order, is_active)
SELECT 
  id,
  'What type of date would you most enjoy?',
  'preferences',
  'A romantic dinner at a cozy restaurant',
  10,
  1,
  true
FROM profiles LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (user_id, question, category, correct_answer, points, display_order, is_active)
SELECT 
  id,
  'Which describes your ideal weekend?',
  'lifestyle',
  'Trying new restaurants and exploring the city',
  10,
  2,
  true
FROM profiles LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (user_id, question, category, correct_answer, points, display_order, is_active)
SELECT 
  id,
  'Coffee or tea?',
  'preferences',
  'Coffee',
  5,
  3,
  true
FROM profiles LIMIT 1
ON CONFLICT DO NOTHING;
