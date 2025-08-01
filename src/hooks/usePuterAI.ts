import { useState, useCallback } from 'react';

interface Exercise {
  question: string;
  answer: string;
  explanation?: string;
}

interface Message {
  id: string;
  content: string | Exercise[];
  isUser: boolean;
  timestamp: Date;
  isExercise?: boolean;
}

interface AIChatResponse {
  message?: {
    content?: Array<{
      text?: string;
      exercises?: Exercise[];
    }>;
  };
  text?: string;
  exercises?: Exercise[];
  [key: string]: any;
}

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (message: string, options?: { 
          model?: string; 
          stream?: boolean;
          format?: 'exercises' | 'text';
        }) => Promise<AIChatResponse | string>;
      };
    };
  }
}

export const usePuterAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<'claude-sonnet-4' | 'claude-opus-4'>('claude-sonnet-4');

  const parseAIResponse = (response: AIChatResponse | string): string | Exercise[] => {
    try {
      // If the response is a string, try to parse it as JSON
      if (typeof response === 'string') {
        try {
          const parsed = JSON.parse(response);
          if (Array.isArray(parsed) && parsed.every(ex => ex.question && ex.answer)) {
            return parsed as Exercise[];
          }
          return response;
        } catch {
          return response;
        }
      }

      // Check for exercises in different response formats
      if (Array.isArray(response.exercises)) {
        return response.exercises;
      }

      if (response.message?.content?.[0]?.exercises) {
        return response.message.content[0].exercises;
      }

      if (response.message?.content?.[0]?.text) {
        const text = response.message.content[0].text;
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.every(ex => ex.question && ex.answer)) {
            return parsed as Exercise[];
          }
        } catch {
          return text;
        }
        return text;
      }

      if (response.text) {
        return response.text;
      }

      return "Sorry, I couldn't generate the requested content. Please try again.";
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return "An error occurred while processing the response.";
    }
  };

  const generateExercises = useCallback(async (subject: string, difficulty: string, count: number = 5): Promise<Exercise[] | string> => {
    if (!window.puter) {
      throw new Error('Puter.js not loaded. Please refresh the page.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Generate ${count} ${difficulty}-level ${subject} exercises. 
      Format each exercise as JSON with "question", "answer", and optional "explanation" fields.
      Return only the JSON array, no additional text or markdown.`;

      const response = await window.puter.ai.chat(prompt, {
        model: selectedModel,
        format: 'exercises'
      });

      const result = parseAIResponse(response);
      
      if (Array.isArray(result)) {
        return result;
      } else {
        throw new Error('Failed to generate exercises in the correct format');
      }
    } catch (error) {
      console.error('Error generating exercises:', error);
      setError('Failed to generate exercises. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await generateResponse(content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      return aiMessage;
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      throw error;
    }
  }, [generateResponse]);

  const generateResponse = useCallback(async (userMessage: string): Promise<string | Exercise[]> => {
    if (!window.puter) {
      throw new Error('Puter.js not loaded. Please refresh the page.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await window.puter.ai.chat(userMessage, {
        model: selectedModel,
      });

      return parseAIResponse(response);
    } catch (error) {
      console.error('Error generating response:', error);
      setError('Failed to generate response. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const changeModel = useCallback((model: 'claude-sonnet-4' | 'claude-opus-4') => {
    setSelectedModel(model);
  }, []);

  const isPuterReady = useCallback(() => {
    return typeof window !== 'undefined' && window.puter && window.puter.ai;
  }, []);

  return {
    messages,
    sendMessage,
    generateExercises,
    clearChat,
    isLoading,
    error,
    selectedModel,
    changeModel,
    isPuterReady,
  };
};
