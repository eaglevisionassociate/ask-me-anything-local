import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonId, topic, difficulty = 'medium', count = 1 } = await req.json();

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role key for inserting
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get lesson details for context
    let lessonContext = '';
    if (lessonId) {
      const { data: lesson } = await supabase
        .from('lessons')
        .select('title, description, topic, content')
        .eq('id', lessonId)
        .single();
      
      if (lesson) {
        lessonContext = `Lesson: ${lesson.title}\nTopic: ${lesson.topic}\nDescription: ${lesson.description || ''}\n`;
      }
    }

    const prompt = `Generate ${count} Grade 8 mathematics exercise(s) for the topic: ${topic || 'general mathematics'}.

${lessonContext}

Difficulty level: ${difficulty}

For each exercise, provide:
1. A clear, age-appropriate question suitable for Grade 8 students
2. The correct answer
3. A detailed step-by-step explanation

Format your response as a JSON array with objects containing:
{
  "question": "The question text",
  "answer": "The correct answer",
  "explanation": "Step-by-step explanation of how to solve it",
  "difficulty": "${difficulty}"
}

Make sure the questions are educational, engaging, and appropriate for Grade 8 mathematics level.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a Grade 8 mathematics teacher creating practice exercises. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse the generated exercises
    let exercises;
    try {
      exercises = JSON.parse(generatedContent);
      if (!Array.isArray(exercises)) {
        exercises = [exercises];
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedContent);
      return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert exercises into database
    const exercisesToInsert = exercises.map(exercise => ({
      question: exercise.question,
      answer: exercise.answer,
      explanation: exercise.explanation,
      difficulty: exercise.difficulty || difficulty,
      lesson_id: lessonId || null,
    }));

    const { data: insertedExercises, error: insertError } = await supabase
      .from('exercises')
      .insert(exercisesToInsert)
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save exercises to database' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      exercises: insertedExercises,
      count: insertedExercises.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-exercise function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});