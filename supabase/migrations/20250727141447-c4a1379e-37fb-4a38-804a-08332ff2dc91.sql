-- Create user_stats table for tracking real progress data
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_lessons_completed INTEGER DEFAULT 0,
  total_exercises_completed INTEGER DEFAULT 0,
  ai_sessions_count INTEGER DEFAULT 0,
  last_activity_date DATE,
  weekly_lessons INTEGER DEFAULT 0,
  weekly_ai_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create subject_progress table for tracking progress by subject
CREATE TABLE public.subject_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject_name)
);

-- Create recent_activities table for dashboard activity feed
CREATE TABLE public.recent_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'exercise', 'lesson', 'chat'
  activity_title TEXT NOT NULL,
  score INTEGER,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS study_streak INTEGER DEFAULT 0;

-- Enable Row Level Security
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_stats
CREATE POLICY "Users can view their own stats" 
ON public.user_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.user_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON public.user_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for subject_progress
CREATE POLICY "Users can view their own subject progress" 
ON public.subject_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subject progress" 
ON public.subject_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subject progress" 
ON public.subject_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for recent_activities
CREATE POLICY "Users can view their own activities" 
ON public.recent_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" 
ON public.recent_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update the existing handle_new_user function to include new tables
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at triggers for new tables
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subject_progress_updated_at
  BEFORE UPDATE ON public.subject_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();