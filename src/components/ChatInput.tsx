import { Button } from "@/components/ui/button";
import { StepByStepMath } from "@/components/StepByStepMath";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSendMessage, isLoading, disabled, placeholder = "Ask me anything..." }: ChatInputProps) => {
  const handleStepsSubmit = (steps: string[]) => {
    if (!isLoading && !disabled) {
      const formattedWork = steps.map((step, i) => `Step ${i + 1}: ${step}`).join('\n');
      onSendMessage(formattedWork);
    }
  };

  return (
    <div className="w-full">
      <StepByStepMath 
        onSubmit={handleStepsSubmit}
        placeholder={placeholder}
      />
    </div>
  );
};