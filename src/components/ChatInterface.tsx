import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { usePuterAI } from "@/hooks/usePuterAI";
import { Button } from "@/components/ui/button";
import { Trash2, Brain, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Subject {
  id: string;
  name: string;
  topics: string[];
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  topic: string;
  content?: string;
  youtube_url?: string;
}

interface Exercise {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  difficulty?: string;
  lesson_id?: string;
}

interface ChatInterfaceProps {
  tutorContext?: Subject | null;
  lessonContext?: Lesson;
  exercises?: Exercise[];
}

export const ChatInterface = ({ tutorContext, lessonContext, exercises }: ChatInterfaceProps) => {
  const {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    selectedModel,
    changeModel,
    isPuterReady,
  } = usePuterAI();
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = (content: string) => {
    let contextualMessage = content;
    
    if (tutorContext && tutorContext.id === "math") {
      let mathContext = `As a Grade 8 Mathematics AI tutor, please help with this: ${content}

Context: I'm a Grade 8 student studying Mathematics topics including ${tutorContext.topics.join(', ')}.`;

      if (lessonContext) {
        mathContext += `

Current lesson: ${lessonContext.title}
Topic: ${lessonContext.topic}
Description: ${lessonContext.description || 'No description'}`;
      }

      if (exercises && exercises.length > 0) {
        mathContext += `

Available practice exercises:`;
        exercises.forEach((exercise, index) => {
          mathContext += `
${index + 1}. ${exercise.question}
   Correct answer: ${exercise.answer}`;
          if (exercise.explanation) {
            mathContext += `
   Explanation: ${exercise.explanation}`;
          }
        });
      }

      mathContext += `

Your capabilities include:
1. Correcting student exercises and providing detailed explanations
2. Creating new practice exercises when requested
3. Explaining mathematical concepts step-by-step
4. Providing hints and guidance for problem-solving
5. Helping with specific exercises from the lesson

Please provide educational, age-appropriate explanations that would help a Grade 8 student understand mathematical concepts better. If the student is asking about a specific exercise, provide detailed corrections and step-by-step explanations.`;

      contextualMessage = mathContext;
    } else if (tutorContext) {
      contextualMessage = `As a Grade 8 ${tutorContext.name} tutor, please help with this question: ${content}. 
      
      Context: I'm studying ${tutorContext.name} topics including ${tutorContext.topics.join(', ')}. 
      Please provide educational, age-appropriate explanations that would help a Grade 8 student understand the concept better.`;
    }
    
    sendMessage(contextualMessage);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex-shrink-0 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {tutorContext ? `${tutorContext.name} AI Tutor` : 'Puter AI Chat'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {tutorContext 
                  ? `Ask questions about ${tutorContext.name} - powered by ${selectedModel.replace('-', ' ').toUpperCase()}`
                  : `Ask me anything - powered by ${selectedModel.replace('-', ' ').toUpperCase()}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedModel} onValueChange={changeModel}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-sonnet-4">Claude Sonnet 4</SelectItem>
                <SelectItem value="claude-opus-4">Claude Opus 4</SelectItem>
              </SelectContent>
            </Select>
            
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="gap-2"
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4" />
                Clear Chat
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea 
          className="h-full" 
          ref={scrollAreaRef}
        >
          <div className="max-w-4xl mx-auto p-4">
            {messages.length === 0 && !isPuterReady() && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-destructive/20 rounded-2xl flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-destructive mb-2">
                  Puter.js Not Available
                </h2>
                <p className="text-muted-foreground max-w-md mb-4">
                  Puter.js failed to load. Please refresh the page to try again.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  Refresh Page
                </Button>
              </div>
            )}

            {messages.length === 0 && isPuterReady() && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-glow mb-4">
                  <Brain className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {tutorContext ? `Welcome to ${tutorContext.name} Tutoring` : 'Welcome to Puter AI Chat'}
                </h2>
                <p className="text-muted-foreground max-w-md mb-4">
                  {tutorContext && tutorContext.id === "math"
                    ? `I'm your Grade 8 Mathematics tutor! I can help you with ${tutorContext.topics.join(', ')}, correct your exercises, and create new practice problems. Just ask!`
                    : tutorContext 
                    ? `I'm here to help you learn ${tutorContext.name}! Ask me about ${tutorContext.topics.join(', ')}, or any other questions you have.`
                    : 'Start a conversation with Claude Sonnet 4 or Claude Opus 4. Completely free with no API keys required!'
                  }
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Connected to Puter.js • Ready to chat
                </div>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && <TypingIndicator />}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-card border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={!isPuterReady()}
            placeholder={tutorContext && tutorContext.id === "math" ? "Ask for help, correction, or new exercises..." : tutorContext ? `Ask me about ${tutorContext.name}...` : "Ask me anything..."}
          />
        </div>
      </div>
    </div>
  );
};