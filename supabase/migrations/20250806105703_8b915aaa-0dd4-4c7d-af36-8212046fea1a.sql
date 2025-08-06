-- Add exercises for Physical Sciences lessons
INSERT INTO public.exercises (lesson_id, question, answer, explanation, difficulty, order_index) VALUES
-- For "Introduction to Matter and Materials" lesson
((SELECT id FROM public.lessons WHERE title = 'Introduction to Matter and Materials' AND topic = 'Physical Sciences' LIMIT 1), 
 'What are the three main states of matter?', 
 'Solid, liquid, and gas', 
 'Matter exists in three main states: solids have fixed shape and volume, liquids have fixed volume but take the shape of their container, and gases have neither fixed shape nor volume.', 
 'easy', 1),

((SELECT id FROM public.lessons WHERE title = 'Introduction to Matter and Materials' AND topic = 'Physical Sciences' LIMIT 1), 
 'Give an example of a physical change and explain why it is physical.', 
 'Melting ice is a physical change because the water molecules remain the same, only their arrangement changes from solid to liquid state.', 
 'Physical changes alter the form or state of matter without changing its chemical composition. Examples include melting, freezing, boiling, and cutting.', 
 'medium', 2),

-- For "Chemical Reactions and Equations" lesson
((SELECT id FROM public.lessons WHERE title = 'Chemical Reactions and Equations' AND topic = 'Physical Sciences' LIMIT 1), 
 'Balance the chemical equation: H₂ + O₂ → H₂O', 
 '2H₂ + O₂ → 2H₂O', 
 'To balance this equation, we need 2 hydrogen molecules to provide 4 hydrogen atoms and 1 oxygen molecule to provide 2 oxygen atoms, forming 2 water molecules.', 
 'medium', 1),

((SELECT id FROM public.lessons WHERE title = 'Chemical Reactions and Equations' AND topic = 'Physical Sciences' LIMIT 1), 
 'What are the signs that indicate a chemical reaction has occurred?', 
 'Color change, gas production, heat or light emission, precipitate formation, and odor change.', 
 'Chemical reactions involve breaking and forming chemical bonds, which often produce observable changes in the materials involved.', 
 'easy', 2),

-- For "Forces and Motion" lesson
((SELECT id FROM public.lessons WHERE title = 'Forces and Motion' AND topic = 'Physical Sciences' LIMIT 1), 
 'Calculate the acceleration of an object if a 20N force is applied to a 5kg mass.', 
 'a = F/m = 20N/5kg = 4 m/s²', 
 'Using Newton''s second law (F = ma), we can find acceleration by dividing force by mass. The unit for acceleration is meters per second squared.', 
 'medium', 1),

((SELECT id FROM public.lessons WHERE title = 'Forces and Motion' AND topic = 'Physical Sciences' LIMIT 1), 
 'What is the difference between speed and velocity?', 
 'Speed is the rate of change of distance (scalar), while velocity is the rate of change of displacement and includes direction (vector).', 
 'Speed only tells us how fast something is moving, while velocity tells us both how fast and in what direction it is moving.', 
 'easy', 2);

-- Add exercises for Life Sciences lessons
INSERT INTO public.exercises (lesson_id, question, answer, explanation, difficulty, order_index) VALUES
-- For "Cell Structure and Function" lesson
((SELECT id FROM public.lessons WHERE title = 'Cell Structure and Function' AND topic = 'Life Sciences' LIMIT 1), 
 'Name three organelles found in plant cells but not in animal cells.', 
 'Cell wall, chloroplasts, and large central vacuole.', 
 'Plant cells have unique structures for photosynthesis (chloroplasts), structural support (cell wall), and water storage (large vacuole).', 
 'medium', 1),

((SELECT id FROM public.lessons WHERE title = 'Cell Structure and Function' AND topic = 'Life Sciences' LIMIT 1), 
 'What is the function of mitochondria in cells?', 
 'Mitochondria are the powerhouses of the cell, producing ATP through cellular respiration.', 
 'Mitochondria convert glucose and oxygen into ATP (adenosine triphosphate), which is the energy currency used by cells for all their activities.', 
 'easy', 2),

-- For "Photosynthesis and Respiration" lesson
((SELECT id FROM public.lessons WHERE title = 'Photosynthesis and Respiration' AND topic = 'Life Sciences' LIMIT 1), 
 'Write the word equation for photosynthesis.', 
 'Carbon dioxide + Water + Light energy → Glucose + Oxygen', 
 'Photosynthesis is the process by which plants convert carbon dioxide and water into glucose using light energy, releasing oxygen as a byproduct.', 
 'medium', 1),

((SELECT id FROM public.lessons WHERE title = 'Photosynthesis and Respiration' AND topic = 'Life Sciences' LIMIT 1), 
 'Why do plants carry out both photosynthesis and respiration?', 
 'Plants use photosynthesis to make glucose and respiration to break down glucose for energy, just like animals.', 
 'While photosynthesis produces glucose during daylight, plants need energy 24/7 for growth and cellular processes, so they respire continuously.', 
 'medium', 2);

-- Add exercises for Earth Sciences lessons
INSERT INTO public.exercises (lesson_id, question, answer, explanation, difficulty, order_index) VALUES
-- For "Rock Cycle and Minerals" lesson
((SELECT id FROM public.lessons WHERE title = 'Rock Cycle and Minerals' AND topic = 'Earth Sciences' LIMIT 1), 
 'Name the three main types of rocks and give one example of each.', 
 'Igneous (granite), Sedimentary (sandstone), Metamorphic (marble).', 
 'Igneous rocks form from cooled magma, sedimentary rocks form from compressed sediments, and metamorphic rocks form from existing rocks under heat and pressure.', 
 'easy', 1),

((SELECT id FROM public.lessons WHERE title = 'Rock Cycle and Minerals' AND topic = 'Earth Sciences' LIMIT 1), 
 'Describe how sedimentary rocks are formed.', 
 'Sedimentary rocks form when sediments are deposited in layers, compacted, and cemented together over time.', 
 'Weathering breaks down rocks into sediments, which are transported and deposited. Over time, pressure and chemical processes bind these sediments into solid rock.', 
 'medium', 2),

-- For "Weather and Climate" lesson
((SELECT id FROM public.lessons WHERE title = 'Weather and Climate' AND topic = 'Earth Sciences' LIMIT 1), 
 'What is the difference between weather and climate?', 
 'Weather is short-term atmospheric conditions, while climate is long-term average weather patterns over many years.', 
 'Weather changes daily and includes temperature, precipitation, and wind for a specific time and place. Climate describes typical weather patterns over decades.', 
 'easy', 1),

((SELECT id FROM public.lessons WHERE title = 'Weather and Climate' AND topic = 'Earth Sciences' LIMIT 1), 
 'Explain how the water cycle affects weather patterns.', 
 'The water cycle drives weather through evaporation, condensation, and precipitation, creating clouds, rain, and humidity changes.', 
 'Solar energy evaporates water, which rises and condenses into clouds. When clouds become saturated, precipitation occurs, affecting local weather conditions.', 
 'medium', 2),

-- For "Solar System and Earth" lesson
((SELECT id FROM public.lessons WHERE title = 'Solar System and Earth' AND topic = 'Earth Sciences' LIMIT 1), 
 'Why do we have seasons on Earth?', 
 'Earth''s tilted axis (23.5°) causes different parts to receive varying amounts of sunlight throughout the year as Earth orbits the Sun.', 
 'When Earth''s northern hemisphere tilts toward the Sun, it receives more direct sunlight (summer), while the southern hemisphere receives less (winter).', 
 'medium', 1),

((SELECT id FROM public.lessons WHERE title = 'Solar System and Earth' AND topic = 'Earth Sciences' LIMIT 1), 
 'List the planets in order from the Sun.', 
 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.', 
 'The eight planets can be remembered using mnemonics like "My Very Educated Mother Just Served Us Nachos" or by grouping them into inner (rocky) and outer (gas giant) planets.', 
 'easy', 2);