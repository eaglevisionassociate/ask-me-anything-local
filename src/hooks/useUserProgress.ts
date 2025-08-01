import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ProgressStep = 'video' | 'exercises' | 'ai-help';

interface UserProgress {
  lesson_id: string;
  progress_percentage: number;
  completed_at?: string;
  video_watched: boolean;
  exercises_completed: number;
  ai_help_used: boolean;
}

export const useUserProgress = (lessonId?: string) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProgress = async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProgress({
          lesson_id: data.lesson_id,
          progress_percentage: data.progress_percentage || 0,
          completed_at: data.completed_at || undefined,
          video_watched: data.progress_percentage >= 33, // Video is 1/3 of progress
          exercises_completed: Math.floor((data.progress_percentage || 0) / 33),
          ai_help_used: data.progress_percentage >= 100
        });
      } else {
        setProgress({
          lesson_id: lessonId,
          progress_percentage: 0,
          video_watched: false,
          exercises_completed: 0,
          ai_help_used: false
        });
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
      toast({
        title: "Error",
        description: "Failed to load your progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (step: ProgressStep, value?: number) => {
    if (!lessonId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let newProgressPercentage = progress?.progress_percentage || 0;
      
      switch (step) {
        case 'video':
          newProgressPercentage = Math.max(newProgressPercentage, 33);
          break;
        case 'exercises':
          newProgressPercentage = Math.max(newProgressPercentage, 66);
          break;
        case 'ai-help':
          newProgressPercentage = 100;
          break;
      }

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          progress_percentage: newProgressPercentage,
          completed_at: newProgressPercentage === 100 ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      // Update local state
      setProgress(prev => prev ? {
        ...prev,
        progress_percentage: newProgressPercentage,
        video_watched: newProgressPercentage >= 33,
        exercises_completed: Math.floor(newProgressPercentage / 33),
        ai_help_used: newProgressPercentage >= 100,
        completed_at: newProgressPercentage === 100 ? new Date().toISOString() : prev.completed_at
      } : null);

    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to save your progress",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [lessonId]);

  return {
    progress,
    loading,
    updateProgress,
    refetch: fetchProgress
  };
};