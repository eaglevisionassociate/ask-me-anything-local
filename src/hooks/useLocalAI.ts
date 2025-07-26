import { useState, useCallback, useRef } from 'react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const useLocalAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const pipelineRef = useRef<any>(null);

  const initializeModel = useCallback(async () => {
    if (pipelineRef.current) return;
    
    setIsModelLoading(true);
    setModelError(null);
    
    try {
      // Dynamic import to avoid issues with SSR
      const { pipeline } = await import('@huggingface/transformers');
      
      // Initialize a lightweight text generation model
      pipelineRef.current = await pipeline(
        'text-generation',
        'onnx-community/Qwen2.5-0.5B-Instruct',
        { 
          device: 'webgpu',
          dtype: 'fp16',
        }
      );
      
      console.log('AI model loaded successfully!');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      try {
        const { pipeline } = await import('@huggingface/transformers');
        pipelineRef.current = await pipeline(
          'text-generation',
          'onnx-community/Qwen2.5-0.5B-Instruct',
          { device: 'cpu' }
        );
        console.log('AI model loaded on CPU!');
      } catch (cpuError) {
        console.error('Failed to load model:', cpuError);
        setModelError('Failed to load AI model. Please refresh the page to try again.');
      }
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const generateResponse = useCallback(async (userMessage: string) => {
    if (!pipelineRef.current) {
      await initializeModel();
      if (!pipelineRef.current) {
        throw new Error('AI model not available');
      }
    }

    const prompt = `<|im_start|>system
You are a helpful AI assistant. Provide clear, concise, and helpful responses to user questions.
<|im_end|>
<|im_start|>user
${userMessage}
<|im_end|>
<|im_start|>assistant
`;

    try {
      const result = await pipelineRef.current(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true,
        return_full_text: false,
      });

      return result[0].generated_text.trim();
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    }
  }, [initializeModel]);

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

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    isModelLoading,
    modelError,
    initializeModel,
  };
};