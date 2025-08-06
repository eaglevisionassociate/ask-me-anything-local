-- Add exercises for Physical Sciences lessons
INSERT INTO public.exercises (lesson_id, question, answer, explanation, difficulty, order_index) VALUES
-- For "Matter and Materials: States of Matter" lesson
('b9f07bb9-6418-42b6-a399-d2118d0aeb74', 
 'What are the three main states of matter?', 
 'Solid, liquid, and gas', 
 'Matter exists in three main states: solids have fixed shape and volume, liquids have fixed volume but take the shape of their container, and gases have neither fixed shape nor volume.', 
 'easy', 1),

('b9f07bb9-6418-42b6-a399-d2118d0aeb74', 
 'Give an example of a physical change and explain why it is physical.', 
 'Melting ice is a physical change because the water molecules remain the same, only their arrangement changes from solid to liquid state.', 
 'Physical changes alter the form or state of matter without changing its chemical composition. Examples include melting, freezing, boiling, and cutting.', 
 'medium', 2),

-- For "Forces and Motion: Contact and Non-contact Forces" lesson
('ccff14c9-8822-42ea-989a-cb556e589987', 
 'What is the difference between contact and non-contact forces?', 
 'Contact forces require physical contact between objects (like friction), while non-contact forces act at a distance (like gravity and magnetism).', 
 'Contact forces include friction, normal force, and tension. Non-contact forces include gravitational, magnetic, and electrical forces.', 
 'medium', 1),

('ccff14c9-8822-42ea-989a-cb556e589987', 
 'Calculate the acceleration of an object if a 20N force is applied to a 5kg mass.', 
 'a = F/m = 20N/5kg = 4 m/s²', 
 'Using Newton''s second law (F = ma), we can find acceleration by dividing force by mass. The unit for acceleration is meters per second squared.', 
 'medium', 2),

-- For "Energy and Change: Heat Transfer" lesson
('ed8d9388-d9b7-4d02-8c04-57a824cf5344', 
 'Name the three methods of heat transfer.', 
 'Conduction, convection, and radiation.', 
 'Conduction occurs through direct contact, convection through fluid movement, and radiation through electromagnetic waves.', 
 'easy', 1),

('ed8d9388-d9b7-4d02-8c04-57a824cf5344', 
 'Why do metals feel colder than wood at room temperature?', 
 'Metals are better conductors of heat, so they conduct heat away from your hand faster, making them feel colder.', 
 'Good thermal conductors like metals quickly transfer heat from your warm hand, while poor conductors like wood transfer heat slowly.', 
 'medium', 2);

-- Add exercises for Life Sciences lessons
INSERT INTO public.exercises (lesson_id, question, answer, explanation, difficulty, order_index) VALUES
-- For "Life and Living: Cells as Basic Units of Life" lesson
('bddb50f6-3940-49e4-ac65-8d9abc26e645', 
 'Name three organelles found in plant cells but not in animal cells.', 
 'Cell wall, chloroplasts, and large central vacuole.', 
 'Plant cells have unique structures for photosynthesis (chloroplasts), structural support (cell wall), and water storage (large vacuole).', 
 'medium', 1),

('bddb50f6-3940-49e4-ac65-8d9abc26e645', 
 'What is the function of mitochondria in cells?', 
 'Mitochondria are the powerhouses of the cell, producing ATP through cellular respiration.', 
 'Mitochondria convert glucose and oxygen into ATP (adenosine triphosphate), which is the energy currency used by cells for all their activities.', 
 'easy', 2),

-- For "Life and Living: Photosynthesis" lesson
('4c7bb3dd-4f34-4e6f-b83d-cd11b5e769cd', 
 'Write the word equation for photosynthesis.', 
 'Carbon dioxide + Water + Light energy → Glucose + Oxygen', 
 'Photosynthesis is the process by which plants convert carbon dioxide and water into glucose using light energy, releasing oxygen as a byproduct.', 
 'medium', 1),

('4c7bb3dd-4f34-4e6f-b83d-cd11b5e769cd', 
 'Why do plants carry out both photosynthesis and respiration?', 
 'Plants use photosynthesis to make glucose and respiration to break down glucose for energy, just like animals.', 
 'While photosynthesis produces glucose during daylight, plants need energy 24/7 for growth and cellular processes, so they respire continuously.', 
 'medium', 2);

-- Add exercises for Earth Sciences lessons
INSERT INTO public.exercises (lesson_id, question, answer, explanation, difficulty, order_index) VALUES
-- For "Earth and Beyond: The Solar System" lesson
('bcd46e25-b90b-4ad0-9f9a-7f61e2da50b3', 
 'List the planets in order from the Sun.', 
 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.', 
 'The eight planets can be remembered using mnemonics like "My Very Educated Mother Just Served Us Nachos" or by grouping them into inner (rocky) and outer (gas giant) planets.', 
 'easy', 1),

('bcd46e25-b90b-4ad0-9f9a-7f61e2da50b3', 
 'What is the difference between the inner and outer planets?', 
 'Inner planets (Mercury, Venus, Earth, Mars) are small, rocky, and close to the Sun. Outer planets (Jupiter, Saturn, Uranus, Neptune) are large gas giants farther from the Sun.', 
 'Inner planets are terrestrial with solid surfaces, while outer planets are mostly gas and liquid with no solid surface to land on.', 
 'medium', 2),

-- For "Earth and Beyond: Day and Night, Seasons" lesson
('51b1ecdd-4a45-4058-a247-790ffc7e681d', 
 'Why do we have seasons on Earth?', 
 'Earth''s tilted axis (23.5°) causes different parts to receive varying amounts of sunlight throughout the year as Earth orbits the Sun.', 
 'When Earth''s northern hemisphere tilts toward the Sun, it receives more direct sunlight (summer), while the southern hemisphere receives less (winter).', 
 'medium', 1),

('51b1ecdd-4a45-4058-a247-790ffc7e681d', 
 'What causes day and night on Earth?', 
 'Earth''s rotation on its axis causes day and night. The side facing the Sun experiences day while the opposite side experiences night.', 
 'Earth completes one full rotation every 24 hours, which is why we have a 24-hour day-night cycle.', 
 'easy', 2);