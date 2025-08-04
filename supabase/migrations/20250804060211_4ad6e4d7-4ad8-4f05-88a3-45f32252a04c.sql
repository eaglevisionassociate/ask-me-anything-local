-- Add exercises for Geometry and Number Theory lessons
INSERT INTO exercises (lesson_id, question, answer, explanation, difficulty, order_index) VALUES
-- Geometry - Angles and Lines exercises
(
  (SELECT id FROM lessons WHERE title = 'Angles and Lines'),
  'Two parallel lines are cut by a transversal. If one angle measures 65°, what is the measure of its corresponding angle?',
  '65°',
  'Corresponding angles are equal when parallel lines are cut by a transversal. Since the given angle is 65°, its corresponding angle is also 65°.',
  'medium',
  1
),
(
  (SELECT id FROM lessons WHERE title = 'Angles and Lines'),
  'In a triangle, two angles measure 45° and 60°. What is the measure of the third angle?',
  '75°',
  'The sum of angles in a triangle is 180°. So the third angle = 180° - 45° - 60° = 75°.',
  'easy',
  2
),
(
  (SELECT id FROM lessons WHERE title = 'Angles and Lines'),
  'Find the value of x if two supplementary angles measure (3x + 20)° and (2x + 10)°.',
  '30°',
  'Supplementary angles add up to 180°. So: (3x + 20) + (2x + 10) = 180. Simplifying: 5x + 30 = 180, 5x = 150, x = 30°.',
  'hard',
  3
),

-- Number Theory - Fractions and Decimals exercises  
(
  (SELECT id FROM lessons WHERE title = 'Fractions and Decimals'),
  'Convert 3/8 to a decimal.',
  '0.375',
  'To convert a fraction to decimal, divide the numerator by the denominator: 3 ÷ 8 = 0.375.',
  'easy',
  1
),
(
  (SELECT id FROM lessons WHERE title = 'Fractions and Decimals'),
  'Simplify: 2/3 + 1/4',
  '11/12',
  'Find common denominator: 2/3 = 8/12 and 1/4 = 3/12. Then add: 8/12 + 3/12 = 11/12.',
  'medium',
  2
),
(
  (SELECT id FROM lessons WHERE title = 'Fractions and Decimals'),
  'Calculate: 0.75 × 2.4',
  '1.8',
  'Multiply: 0.75 × 2.4 = 1.8. You can also think of it as 75/100 × 24/10 = 1800/1000 = 1.8.',
  'medium',
  3
),

-- Number Theory - Percentage Calculations exercises
(
  (SELECT id FROM lessons WHERE title = 'Percentage Calculations'),
  'A phone costs R2400 including 15% VAT. What was the price before VAT?',
  'R2087.00',
  'Let x be the price before VAT. Then x + 15% of x = R2400, so 1.15x = R2400. Therefore x = R2400 ÷ 1.15 = R2087.00 (rounded to nearest cent).',
  'hard',
  1
),
(
  (SELECT id FROM lessons WHERE title = 'Percentage Calculations'),
  'If a shirt originally costs R150 and is on sale for 20% off, what is the sale price?',
  'R120.00',
  'Discount = 20% of R150 = 0.20 × R150 = R30. Sale price = R150 - R30 = R120.',
  'medium',
  2
),
(
  (SELECT id FROM lessons WHERE title = 'Percentage Calculations'),
  'A bank account earns 8% simple interest per year. If you deposit R500, how much interest will you earn in 2 years?',
  'R80.00',
  'Simple interest = Principal × Rate × Time = R500 × 0.08 × 2 = R80.',
  'medium',
  3
),
(
  (SELECT id FROM lessons WHERE title = 'Percentage Calculations'),
  'In a class of 25 students, 15 are girls. What percentage of the class are girls?',
  '60%',
  'Percentage = (Number of girls / Total students) × 100% = (15/25) × 100% = 0.6 × 100% = 60%.',
  'easy',
  4
);