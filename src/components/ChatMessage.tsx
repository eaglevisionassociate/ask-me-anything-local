import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
  };
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 mb-6 message-animate ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className={`w-10 h-10 ${message.isUser ? 'bg-primary' : 'bg-secondary'} shadow-glow`}>
        <AvatarFallback className={message.isUser ? 'text-primary-foreground' : 'text-foreground'}>
          {message.isUser ? <User size={20} /> : <Bot size={20} />}
        </AvatarFallback>
      </Avatar>
      
      <div className={`max-w-[80%] ${message.isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
        <div 
          className={`
            px-4 py-3 rounded-2xl shadow-message
            ${message.isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-ai-message text-ai-message-foreground border border-border'
            }
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};