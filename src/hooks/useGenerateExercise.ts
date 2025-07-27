import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
        const { data: lesson } = await (supabase as any)
          .from('lessons')
          .select('title, description, topic, content')
          .eq('id', params.lessonId)
          .single();
        
        if (lesson) {
          lessonContext = `Lesson: ${lesson.title}\nTopic: ${lesson.topic}\nDescription: ${lesson.description || ''}\n`;
        }
      }

      // Math subjects for Grade 8
      const mathSubjects = [
        'Algebra (linear equations, inequalities, graphing)',
        'Geometry (angles, triangles, area, perimeter)',
        'Fractions and Decimals (operations, conversions)',
        'Integers (positive and negative numbers)',
        'Ratios and Proportions',
        'Percentages and Interest',
        'Statistics and Probability',
        'Exponents and Scientific Notation',
        'Coordinate Geometry',
        'Functions and Relations'
      ];
      
      // Randomly select a subject if no specific topic is provided
      const selectedTopic = params.topic || mathSubjects[Math.floor(Math.random() * mathSubjects.length)];

      const prompt = `Generate ${params.count || 1} Grade 8 mathematics exercise(s) for the topic: ${selectedTopic}.

${lessonContext}

Difficulty level: ${params.difficulty || 'medium'}

For each exercise, provide:
1. A clear, age-appropriate question suitable for Grade 8 students
2. The correct answer
3. A detailed step-by-step explanation
4. Make the questions diverse and engaging within the selected topic

Format your response as a JSON array with objects containing:
{
  "question": "The question text",
  "answer": "The correct answer",
  "explanation": "Step-by-step explanation of how to solve it",
  "difficulty": "${params.difficulty || 'medium'}"
}

Make sure the questions are educational, engaging, and appropriate for Grade 8 mathematics level. Vary the question types (word problems, calculations, conceptual questions) within the topic. ONLY respond with valid JSON.`;

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

      // Clean markdown code blocks and parse the generated exercises
      let exercises;
      try {
        // Remove markdown code blocks if present
        let cleanResponse = aiResponse.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        exercises = JSON.parse(cleanResponse);
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

      const { data: insertedExercises, error } = await (supabase as any)
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