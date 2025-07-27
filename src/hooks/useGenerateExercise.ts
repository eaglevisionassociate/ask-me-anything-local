import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GenerateExerciseParams {
  lessonId?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
}

export const useGenerateExercise = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateExercise = async (params: GenerateExerciseParams) => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-exercise', {
        body: {
          lessonId: params.lessonId,
          topic: params.topic,
          difficulty: params.difficulty || 'medium',
          count: params.count || 1,
        },
      });

      if (error) {
        console.error('Error generating exercise:', error);
        toast({
          title: "Error",
          description: "Failed to generate new exercises. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (data.success) {
        toast({
          title: "Success!",
          description: `Generated ${data.count} new practice exercise${data.count > 1 ? 's' : ''}!`,
        });
        return data.exercises;
      }

      return null;
    } catch (error) {
      console.error('Error generating exercise:', error);
      toast({
        title: "Error",
        description: "Failed to generate new exercises. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateExercise,
    isGenerating,
  };
};