import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityData {
  activityType: 'exercise' | 'lesson' | 'chat';
  activityTitle: string;
  score?: number;
  subject?: string;
}

export const useActivityTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const trackActivity = async (activityData: ActivityData) => {
    if (!user?.id) return;

    try {
      // Add to recent activities
      const { error: activityError } = await supabase
        .from('recent_activities')
        .insert({
          user_id: user.id,
          activity_type: activityData.activityType,
          activity_title: activityData.activityTitle,
          score: activityData.score,
          subject: activityData.subject,
        });

      if (activityError) throw activityError;

      // Update user stats based on activity type
      await updateUserStats(activityData.activityType);

      // Update subject progress if applicable
      if (activityData.subject) {
        await updateSubjectProgress(activityData.subject, activityData.score);
      }

    } catch (error) {
      console.error('Error tracking activity:', error);
      toast({
        title: "Warning",
        description: "Activity tracking failed, but your progress is saved locally.",
        variant: "destructive",
      });
    }
  };

  const updateUserStats = async (activityType: string) => {
    if (!user?.id) return;

    try {
      // Get current stats
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const updates: any = {
        user_id: user.id,
        last_activity_date: new Date().toISOString().split('T')[0],
      };

      if (activityType === 'lesson') {
        updates.total_lessons_completed = (currentStats?.total_lessons_completed || 0) + 1;
        updates.weekly_lessons = (currentStats?.weekly_lessons || 0) + 1;
      } else if (activityType === 'exercise') {
        updates.total_exercises_completed = (currentStats?.total_exercises_completed || 0) + 1;
      } else if (activityType === 'chat') {
        updates.ai_sessions_count = (currentStats?.ai_sessions_count || 0) + 1;
        updates.weekly_ai_sessions = (currentStats?.weekly_ai_sessions || 0) + 1;
      }

      const { error } = await supabase
        .from('user_stats')
        .upsert(updates);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const updateSubjectProgress = async (subjectName: string, score?: number) => {
    if (!user?.id) return;

    try {
      // Get current progress
      const { data: currentProgress } = await supabase
        .from('subject_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('subject_name', subjectName)
        .single();

      // Calculate new progress (simple increment for now, can be made more sophisticated)
      let newProgress = currentProgress?.progress_percentage || 0;
      
      if (score && score >= 70) {
        // Award progress for good scores
        newProgress = Math.min(100, newProgress + 5);
      } else if (score) {
        // Small progress for attempts
        newProgress = Math.min(100, newProgress + 2);
      } else {
        // General activity progress
        newProgress = Math.min(100, newProgress + 1);
      }

      const { error } = await supabase
        .from('subject_progress')
        .upsert({
          user_id: user.id,
          subject_name: subjectName,
          progress_percentage: newProgress,
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error updating subject progress:', error);
    }
  };

  const completeLesson = async (lessonTitle: string, subject: string) => {
    await trackActivity({
      activityType: 'lesson',
      activityTitle: `Completed: ${lessonTitle}`,
      subject,
    });

    // Update user progress for this lesson
    if (user?.id) {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: 'placeholder', // We'd need the actual lesson ID
          progress_percentage: 100,
          completed_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating lesson progress:', error);
      }
    }
  };

  const completeExercise = async (exerciseTitle: string, score: number, subject: string) => {
    await trackActivity({
      activityType: 'exercise',
      activityTitle: `Exercise: ${exerciseTitle}`,
      score,
      subject,
    });
  };

  const startAISession = async (topic: string) => {
    await trackActivity({
      activityType: 'chat',
      activityTitle: `AI Help: ${topic}`,
      subject: 'Mathematics', // Default to Math for now
    });
  };

  return {
    trackActivity,
    completeLesson,
    completeExercise,
    startAISession,
  };
};