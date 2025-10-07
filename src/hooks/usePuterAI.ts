import { useState, useCallback } from 'react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface UsePuterAIReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  isLoading: boolean;
  selectedModel: 'claude-sonnet-4' | 'claude-opus-4';
  changeModel: (model: 'claude-sonnet-4' | 'claude-opus-4') => void;
  isPuterReady: () => boolean;
  generateResponse: (userMessage: string) => Promise<string>;
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

export const usePuterAI = (): UsePuterAIReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'claude-sonnet-4' | 'claude-opus-4'>('claude-sonnet-4');

  const generateResponse = useCallback(async (userMessage: string): Promise<string> => {
    console.log('generateResponse called, checking window.puter...');
    console.log('window.puter exists:', !!window.puter);
    console.log('window.puter.ai exists:', !!(window.puter && window.puter.ai));
    
    if (!window.puter) {
      console.error('Puter.js not loaded');
      throw new Error('Puter.js not loaded. Please refresh the page.');
    }

    if (!window.puter.ai) {
      console.error('Puter.ai not available');
      throw new Error('Puter AI not available. Please refresh the page.');
    }

    try {
      console.log('Calling window.puter.ai.chat with model:', selectedModel);
      const response = await window.puter.ai.chat(userMessage, {
        model: selectedModel,
      });
      console.log('Raw response from puter.ai:', response);

      // Handle different response formats
      if (response.message?.content?.[0]?.text) {
        return response.message.content[0].text;
      } else if (response.text) {
        return response.text;
      } else if (typeof response === 'string') {
        return response;
      } else {
        console.warn('Unexpected response format:', response);
        // Fallback - stringify the response
        return JSON.stringify(response);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [selectedModel]);

  const sendMessage = useCallback(async (content: string) => {
    console.log('sendMessage called with content:', content);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('Calling generateResponse...');
      const response = await generateResponse(content);
      console.log('Got response:', response);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please refresh the page and try again.`,
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

  const isPuterReady = useCallback((): boolean => {
    return !!(typeof window !== 'undefined' && window.puter && window.puter.ai);
  }, []);

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    selectedModel,
    changeModel,
    isPuterReady,
    generateResponse,
  };
};
