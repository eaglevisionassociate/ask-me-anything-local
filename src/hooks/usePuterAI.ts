import { useState, useCallback } from 'react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatResponse {
  message?: {
    content?: Array<{
      text?: string;
    }>;
  };
  text?: string;
  [key: string]: any; // For other potential response properties
}

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (message: string, options?: { model?: string; stream?: boolean }) => Promise<AIChatResponse | string>;
      };
    };
  }
}

export const usePuterAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<'claude-sonnet-4' | 'claude-opus-4'>('claude-sonnet-4');

  const generateResponse = useCallback(async (userMessage: string) => {
    if (!window.puter) {
      throw new Error('AI not loaded. Please refresh the page.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await window.puter.ai.chat(userMessage, {
        model: selectedModel,
      });

      // Handle different response formats more robustly
      if (typeof response === 'string') {
        return response;
      } else if (response?.message?.content?.[0]?.text) {
        return response.message.content[0].text;
      } else if (response?.text) {
        return response.text;
      } else if (response?.choices?.[0]?.message?.content) {
        // Handle another possible response format
        return response.choices[0].message.content;
      } else {
        // Fallback - stringify the response if it's an object
        return typeof response === 'object' ? JSON.stringify(response) : String(response);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setError('Failed to generate response. Please try again.');
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
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error while processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  }, [generateResponse]);

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
    clearChat,
    isLoading,
    error,
    selectedModel,
    changeModel,
    isPuterReady,
  };
};
