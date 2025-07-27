import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url?: string | null;
  grade: number;
  total_xp: number;
  study_streak: number;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  id: string;
  user_id: string;
  total_lessons_completed: number;
  total_exercises_completed: number;
  ai_sessions_count: number;
  last_activity_date: string | null;
  weekly_lessons: number;
  weekly_ai_sessions: number;
}

interface SubjectProgress {
  id: string;
  user_id: string;
  subject_name: string;
  progress_percentage: number;
}

interface RecentActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_title: string;
  score: number | null;
  subject: string | null;
  created_at: string;
}

export const useDashboardData = (userId: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [profileRes, statsRes, progressRes, activitiesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('subject_progress')
          .select('*')
          .eq('user_id', userId)
          .order('subject_name'),
        supabase
          .from('recent_activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (profileRes.error && profileRes.status !== 406) {
        throw profileRes.error;
      }
      if (statsRes.error && statsRes.status !== 406) {
        throw statsRes.error;
      }
      if (progressRes.error) {
        throw progressRes.error;
      }
      if (activitiesRes.error) {
        throw activitiesRes.error;
      }

      setProfile(profileRes.data);
      setUserStats(statsRes.data);
      setSubjectProgress(progressRes.data || []);
      setRecentActivities(activitiesRes.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStats = async (updates: Partial<UserStats>) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          ...updates,
        });

      if (error) throw error;

      // Refresh stats
      fetchDashboardData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stats';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const addActivity = async (activity: {
    activity_type: string;
    activity_title: string;
    score?: number;
    subject?: string;
  }) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('recent_activities')
        .insert({
          user_id: userId,
          ...activity,
        });

      if (error) throw error;

      // Refresh activities
      fetchDashboardData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add activity';
      console.error('Error adding activity:', errorMessage);
    }
  };

  const updateSubjectProgress = async (subjectName: string, progressPercentage: number) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('subject_progress')
        .upsert({
          user_id: userId,
          subject_name: subjectName,
          progress_percentage: progressPercentage,
        });

      if (error) throw error;

      // Refresh progress
      fetchDashboardData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update progress';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return {
    profile,
    userStats,
    subjectProgress,
    recentActivities,
    loading,
    error,
    refetch: fetchDashboardData,
    updateUserStats,
    addActivity,
    updateSubjectProgress,
  };
};