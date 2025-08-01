-- Remove duplicate exercises (keep the older ones, delete newer duplicates)

-- Delete the newer duplicate of "Sarah has 3 times as many stickers..."
DELETE FROM exercises 
WHERE id = '17393352-4c39-45c0-950e-cbee519dec38';

-- Delete the newer duplicate of "Simplify the algebraic expression: 5a + 3b - 2a + 7b - 4a + b"
DELETE FROM exercises 
WHERE id = '93b74b6f-30e3-4084-86f1-548cc4bcefb4';

-- Create a unique constraint to prevent future duplicates on the same lesson
-- This will prevent adding exercises with the same question to the same lesson
ALTER TABLE exercises 
ADD CONSTRAINT unique_question_per_lesson 
UNIQUE (lesson_id, question);