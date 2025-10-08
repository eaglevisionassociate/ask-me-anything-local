import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSendMessage, isLoading, disabled, placeholder = "Ask me anything..." }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showQuestions, setShowQuestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Can you explain this step?",
    "How do I solve this problem?",
    "What is the formula for this?",
    "Can you give me a hint?",
    "Show me a similar example",
    "What did I do wrong?",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowQuestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
    setShowQuestions(false);
  };

  const toggleQuestions = () => {
    setShowQuestions(!showQuestions);
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative" ref={dropdownRef}>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[50px] max-h-32 resize-none bg-input border-border focus:ring-2 focus:ring-accent focus:border-transparent transition-smooth pr-12"
            disabled={isLoading || disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleQuestions}
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={isLoading || disabled}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
          
          {showQuestions && (
            <Card className="absolute bottom-full mb-2 right-0 w-80 p-2 shadow-lg z-50">
              <div className="space-y-1">
                <p className="text-sm font-medium px-2 py-1">Quick Questions</p>
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-left text-sm h-auto py-2 px-2 hover:bg-accent"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className="h-[50px] px-4 bg-primary hover:opacity-90 transition-smooth shadow-glow"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>
    </div>
  );
};