-- Update video links to match Grade 8 South African CAPS curriculum

-- Update Algebra/Linear Equations lessons with SA curriculum-aligned videos
UPDATE lessons 
SET youtube_url = 'https://www.youtube.com/watch?v=f_0jhtrH9dw'
WHERE title = 'Linear Equations' AND topic = 'Algebra';

UPDATE lessons 
SET youtube_url = 'https://www.youtube.com/watch?v=rMn9asSiQ3Y'
WHERE title = 'Introduction to Algebra' AND topic = 'Algebra';

-- Update Geometry lesson with SA curriculum-aligned video
UPDATE lessons 
SET youtube_url = 'https://www.youtube.com/watch?v=mrpcjIrb05M'
WHERE title = 'Geometry: Angles and Lines' AND topic = 'Geometry';

-- Update Number Theory lessons with SA curriculum-aligned videos
UPDATE lessons 
SET youtube_url = 'https://www.youtube.com/watch?v=2vjbNZaFz3c'
WHERE title = 'Fractions and Decimals' AND topic = 'Number Theory';

UPDATE lessons 
SET youtube_url = 'https://www.youtube.com/watch?v=8C2oPQ1IE8I'
WHERE title = 'Percentage Calculations' AND topic = 'Number Theory';