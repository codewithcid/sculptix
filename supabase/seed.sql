-- ============================================================================
-- Seed data: a small set of global foods (user_id NULL) so search works
-- immediately. Values are per 100 g unless the unit says otherwise. Extend
-- freely or import a full USDA dataset later.
-- ============================================================================
insert into public.foods (name, brand, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, source) values
  ('Chicken Breast, cooked',  null, 100, 'g',   165, 31.0, 0.0,  3.6, 'seed'),
  ('Whole Egg, large',        null, 50,  'g',    72,  6.3, 0.4,  4.8, 'seed'),
  ('Egg White',               null, 100, 'g',    52, 10.9, 0.7,  0.2, 'seed'),
  ('White Rice, cooked',      null, 100, 'g',   130,  2.7, 28.0, 0.3, 'seed'),
  ('Brown Rice, cooked',      null, 100, 'g',   123,  2.7, 25.6, 1.0, 'seed'),
  ('Rolled Oats, dry',        null, 100, 'g',   389, 16.9, 66.3, 6.9, 'seed'),
  ('Banana',                  null, 118, 'g',   105,  1.3, 27.0, 0.4, 'seed'),
  ('Apple',                   null, 182, 'g',    95,  0.5, 25.0, 0.3, 'seed'),
  ('Whole Milk',              null, 240, 'ml',  149,  7.7, 11.7, 8.0, 'seed'),
  ('Greek Yogurt, nonfat',    null, 170, 'g',   100, 17.0,  6.0, 0.7, 'seed'),
  ('Whey Protein',            null, 30,  'g',   120, 24.0,  3.0, 1.5, 'seed'),
  ('Peanut Butter',           null, 32,  'g',   188,  8.0,  6.0, 16.0,'seed'),
  ('Almonds',                 null, 28,  'g',   164,  6.0,  6.0, 14.0,'seed'),
  ('Sweet Potato, cooked',    null, 100, 'g',    90,  2.0, 21.0, 0.2, 'seed'),
  ('Broccoli, cooked',        null, 100, 'g',    35,  2.4,  7.2, 0.4, 'seed'),
  ('Salmon, cooked',          null, 100, 'g',   206, 22.0, 0.0, 13.0, 'seed'),
  ('Ground Beef 90/10, cooked',null,100, 'g',   217, 26.0, 0.0, 11.8, 'seed'),
  ('Tuna, canned in water',   null, 100, 'g',   116, 25.5, 0.0,  0.8, 'seed'),
  ('Olive Oil',               null, 14,  'ml',  119,  0.0,  0.0, 14.0,'seed'),
  ('Whole Wheat Bread',       null, 28,  'g',    69,  3.6, 12.0, 0.9, 'seed')
on conflict do nothing;
