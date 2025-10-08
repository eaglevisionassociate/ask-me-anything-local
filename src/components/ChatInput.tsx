import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSendMessage, isLoading, disabled, placeholder = "Ask me anything..." }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const quickQuestions = [
    "Can you explain this step?",
    "How do I solve this problem?",
    "What is the formula for this?",
    "Can you give me a hint?",
    "Show me a similar example",
    "What did I do wrong?",
  ];

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
    setIsPopoverOpen(false);
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[50px] max-h-32 resize-none bg-input border-border focus:ring-2 focus:ring-accent focus:border-transparent transition-smooth pr-12"
            disabled={isLoading || disabled}
          />
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                disabled={isLoading || disabled}
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="end">
              <div className="space-y-1">
                <p className="text-sm font-medium px-2 py-1">Quick Questions</p>
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-left text-sm h-auto py-2 px-2"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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