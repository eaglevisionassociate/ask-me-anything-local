import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = "https://yejsacotkqcatdfrqksn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllanNhY290a3FjYXRkZnJxa3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTgxMjUsImV4cCI6MjA2OTEzNDEyNX0.WE4EsZmSJ4Qn-4Cy1boAjnfpg76sQePBLD-OkjYDE4A";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

interface GenerateExerciseParams {
  lessonId?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
}

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (message: string, options?: { model?: string; stream?: boolean }) => Promise<any>;
      };
    };
  }
}

export const useGenerateExercise = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateExercise = async (params: GenerateExerciseParams) => {
    if (!window.puter) {
      toast({
        title: "Error",
        description: "Puter.js not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    
    try {
      // Get lesson context if lessonId is provided
      let lessonContext = '';
      if (params.lessonId) {
        const { data: lesson } = await supabaseClient
          .from('lessons')
          .select('title, description, topic, content')
          .eq('id', params.lessonId)
          .single();
        
        if (lesson) {
          lessonContext = `Lesson: ${lesson.title}\nTopic: ${lesson.topic}\nDescription: ${lesson.description || ''}\n`;
        }
      }

      const prompt = `Generate ${params.count || 1} Grade 8 mathematics exercise(s) for the topic: ${params.topic || 'general mathematics'}.

${lessonContext}

Difficulty level: ${params.difficulty || 'medium'}

For each exercise, provide:
1. A clear, age-appropriate question suitable for Grade 8 students
2. The correct answer
3. A detailed step-by-step explanation

Format your response as a JSON array with objects containing:
{
  "question": "The question text",
  "answer": "The correct answer",
  "explanation": "Step-by-step explanation of how to solve it",
  "difficulty": "${params.difficulty || 'medium'}"
}

Make sure the questions are educational, engaging, and appropriate for Grade 8 mathematics level. ONLY respond with valid JSON.`;

      const response = await window.puter.ai.chat(prompt, {
        model: 'claude-sonnet-4',
      });

      // Handle different response formats
      let aiResponse;
      if (response.message?.content?.[0]?.text) {
        aiResponse = response.message.content[0].text;
      } else if (response.text) {
        aiResponse = response.text;
      } else if (typeof response === 'string') {
        aiResponse = response;
      } else {
        aiResponse = JSON.stringify(response);
      }

      // Parse the generated exercises
      let exercises;
      try {
        exercises = JSON.parse(aiResponse);
        if (!Array.isArray(exercises)) {
          exercises = [exercises];
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiResponse);
        toast({
          title: "Error",
          description: "Failed to parse AI response. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      // Insert exercises into database
      const exercisesToInsert = exercises.map(exercise => ({
        question: exercise.question,
        answer: exercise.answer,
        explanation: exercise.explanation,
        difficulty: exercise.difficulty || params.difficulty || 'medium',
        lesson_id: params.lessonId || null,
      }));

      const { data: insertedExercises, error } = await supabaseClient
        .from('exercises')
        .insert(exercisesToInsert)
        .select();

      if (error) {
        console.error('Database insert error:', error);
        toast({
          title: "Error",
          description: "Failed to save exercises to database. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Success!",
        description: `Generated ${insertedExercises.length} new practice exercise${insertedExercises.length > 1 ? 's' : ''}!`,
      });
      
      return insertedExercises;
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