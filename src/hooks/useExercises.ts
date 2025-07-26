import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = "https://yejsacotkqcatdfrqksn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllanNhY290a3FjYXRkZnJxa3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTgxMjUsImV4cCI6MjA2OTEzNDEyNX0.WE4EsZmSJ4Qn-4Cy1boAjnfpg76sQePBLD-OkjYDE4A";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export interface Exercise {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  difficulty?: string;
  order_index: number;
  lesson_id?: string;
  created_at: string;
}

export const useExercises = (lessonId?: string) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabaseClient
        .from('exercises')
        .select('*')
        .order('order_index', { ascending: true });

      if (lessonId) {
        query = query.eq('lesson_id', lessonId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setExercises(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exercises';
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

  useEffect(() => {
    fetchExercises();
  }, [lessonId]);

  return {
    exercises,
    loading,
    error,
    refetch: fetchExercises
  };
};