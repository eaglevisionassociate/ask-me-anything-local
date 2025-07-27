-- Fix the handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert user stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Initialize subject progress for available subjects
  INSERT INTO public.subject_progress (user_id, subject_name, progress_percentage)
  VALUES 
    (NEW.id, 'Mathematics', 0),
    (NEW.id, 'Science', 0),
    (NEW.id, 'English', 0),
    (NEW.id, 'Social Studies', 0)
  ON CONFLICT (user_id, subject_name) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Fix the update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;