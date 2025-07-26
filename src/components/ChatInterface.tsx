import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { useLocalAI } from "@/hooks/useLocalAI";
import { Button } from "@/components/ui/button";
import { Trash2, Brain } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ChatInterface = () => {
  const {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    isModelLoading,
    modelError,
    initializeModel,
  } = useLocalAI();
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-gradient-background">
      {/* Header */}
      <div className="flex-shrink-0 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Local AI Chat</h1>
              <p className="text-sm text-muted-foreground">
                {isModelLoading ? "Loading AI model..." : "Ask me anything - powered by local AI"}
              </p>
            </div>
          </div>
          
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

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea 
          className="h-full" 
          ref={scrollAreaRef}
        >
          <div className="max-w-4xl mx-auto p-4">
            {messages.length === 0 && !isModelLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Welcome to Local AI Chat
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Start a conversation with your local AI assistant. Everything runs in your browser - no data sent to the cloud!
                </p>
                <Button 
                  onClick={initializeModel} 
                  className="mt-6 bg-gradient-primary hover:opacity-90 transition-smooth shadow-glow"
                  disabled={isModelLoading}
                >
                  {isModelLoading ? "Loading AI Model..." : "Initialize AI"}
                </Button>
              </div>
            )}

            {isModelLoading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow mb-4 animate-pulse">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Loading AI Model...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we initialize your local AI assistant.
                </p>
              </div>
            )}

            {modelError && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-destructive/20 rounded-2xl flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-destructive mb-2">
                  Model Loading Error
                </h2>
                <p className="text-muted-foreground max-w-md mb-4">
                  {modelError}
                </p>
                <Button 
                  onClick={initializeModel} 
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  Try Again
                </Button>
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
            onSendMessage={sendMessage}
            isLoading={isLoading}
            disabled={isModelLoading || !!modelError}
          />
        </div>
      </div>
    </div>
  );
};