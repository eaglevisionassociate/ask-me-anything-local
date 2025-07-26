import { useState, useCallback } from 'react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
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

export const usePuterAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'claude-sonnet-4' | 'claude-opus-4'>('claude-sonnet-4');

  const generateResponse = useCallback(async (userMessage: string) => {
    if (!window.puter) {
      throw new Error('Puter.js not loaded. Please refresh the page.');
    }

    try {
      const response = await window.puter.ai.chat(userMessage, {
        model: selectedModel,
      });

      // Handle different response formats
      if (response.message?.content?.[0]?.text) {
        return response.message.content[0].text;
      } else if (response.text) {
        return response.text;
      } else if (typeof response === 'string') {
        return response;
      } else {
        // Fallback - stringify the response
        return JSON.stringify(response);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }, [selectedModel]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

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
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [generateResponse]);

  const clearChat = useCallback(() => {
    setMessages([]);
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
    selectedModel,
    changeModel,
    isPuterReady,
  };
};