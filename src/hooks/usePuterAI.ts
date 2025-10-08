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
    console.log('🔍 generateResponse - window.puter exists?', !!window.puter);
    console.log('🔍 generateResponse - window.puter.ai exists?', !!(window.puter?.ai));
    
    if (!window.puter) {
      throw new Error('Puter.js not loaded. Please refresh the page.');
    }

    try {
      console.log('🚀 Calling window.puter.ai.chat with model:', selectedModel);
      const response = await window.puter.ai.chat(userMessage, {
        model: selectedModel,
      });
      console.log('📦 Raw AI response:', response);

      // Handle different response formats
      if (response.message?.content?.[0]?.text) {
        console.log('✅ Using response.message.content[0].text');
        return response.message.content[0].text;
      } else if (response.text) {
        console.log('✅ Using response.text');
        return response.text;
      } else if (typeof response === 'string') {
        console.log('✅ Response is string');
        return response;
      } else {
        console.log('⚠️ Using JSON.stringify fallback');
        return JSON.stringify(response);
      }
    } catch (error) {
      console.error('❌ Error generating response:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }, [selectedModel]);

  const sendMessage = useCallback(async (content: string) => {
    console.log('📤 sendMessage called with:', content);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => {
      console.log('📝 Adding user message to state');
      return [...prev, userMessage];
    });
    setIsLoading(true);

    try {
      console.log('🤖 Calling generateResponse...');
      const response = await generateResponse(content);
      console.log('✅ AI Response received:', response);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => {
        console.log('📝 Adding AI message to state:', aiMessage);
        return [...prev, aiMessage];
      });
    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
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
