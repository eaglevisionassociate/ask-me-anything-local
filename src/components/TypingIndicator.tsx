import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 mb-6 message-animate">
      <Avatar className="w-10 h-10 bg-secondary shadow-glow">
        <AvatarFallback className="text-foreground">
          <Bot size={20} />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col items-start">
        <div className="px-4 py-3 rounded-2xl shadow-message bg-ai-message text-ai-message-foreground border border-border">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator"></div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-2">AI is thinking...</span>
      </div>
    </div>
  );
};