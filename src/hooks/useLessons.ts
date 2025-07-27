import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = "https://yejsacotkqcatdfrqksn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllanNhY290a3FjYXRkZnJxa3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTgxMjUsImV4cCI6MjA2OTEzNDEyNX0.WE4EsZmSJ4Qn-4Cy1boAjnfpg76sQePBLD-OkjYDE4A";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  topic: string;
  content?: string;
  youtube_url?: string;
  grade: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const useLessons = (topic?: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabaseClient
        .from('lessons')
        .select('*')
        .order('order_index', { ascending: true });

      if (topic) {
        query = query.eq('topic', topic);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setLessons(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lessons';
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
    fetchLessons();
  }, [topic]);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons
  };
};