-- Allow anyone to insert exercises (since this is for educational content)
CREATE POLICY "Anyone can create exercises" 
ON public.exercises 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update exercises (for future editing capabilities)
CREATE POLICY "Anyone can update exercises" 
ON public.exercises 
FOR UPDATE 
USING (true);