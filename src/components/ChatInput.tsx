import * as React from "react";
const { useState, useRef, useEffect } = React;
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, HelpCircle, Calculator, X, Type, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MathCalculatorKeyboard } from "./MathCalculatorKeyboard";
import { AlphabetKeyboard } from "./AlphabetKeyboard";
import { KidDrawingPad } from "./KidDrawingPad";
import { InputMethodSelector, InputMethod } from "./InputMethodSelector";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  subjectId?: string;
}

export const ChatInput = ({ onSendMessage, isLoading, disabled, placeholder = "Ask me anything...", subjectId = 'math' }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showQuestions, setShowQuestions] = useState(false);
  const [activeInputMethod, setActiveInputMethod] = useState<InputMethod>(null);
  const [alphabetValue, setAlphabetValue] = useState("");
  const [mathExpression, setMathExpression] = useState("");
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

  const handleAlphabetSubmit = () => {
    if (alphabetValue.trim()) {
      onSendMessage(alphabetValue.trim());
      setAlphabetValue("");
      setActiveInputMethod(null);
    }
  };

  const handleMathSubmit = () => {
    if (mathExpression.trim()) {
      onSendMessage(mathExpression.trim());
      setMathExpression("");
      setActiveInputMethod(null);
    }
  };

  const handleDrawingSave = (dataURL: string) => {
    onSendMessage(`[Drawing submitted] I drew my answer. Here is my drawing: ${dataURL}`);
    setActiveInputMethod(null);
  };

  const isMathSubject = subjectId === 'math' || subjectId === 'science';

  return (
    <div className="space-y-3">
      {/* Input Method Selector */}
      <InputMethodSelector
        activeMethod={activeInputMethod}
        onMethodChange={setActiveInputMethod}
        showCalculator={isMathSubject}
        showAlphabet={true}
        showDrawing={true}
      />

      {/* Calculator Panel */}
      {activeInputMethod === 'calculator' && isMathSubject && (
        <Card className="p-4 border-border bg-card animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-card-foreground">
              <Calculator className="w-4 h-4 text-primary" />
              Math Calculator
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setActiveInputMethod(null)}
              className="h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <MathCalculatorKeyboard
            value={mathExpression}
            onChange={setMathExpression}
            onSubmit={handleMathSubmit}
            disabled={isLoading || disabled}
          />
        </Card>
      )}

      {/* Alphabet Keyboard Panel */}
      {activeInputMethod === 'alphabet' && (
        <Card className="p-4 border-border bg-card animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-card-foreground">
              <Type className="w-4 h-4 text-primary" />
              Write Your Answer
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setActiveInputMethod(null)}
              className="h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <AlphabetKeyboard
            value={alphabetValue}
            onChange={setAlphabetValue}
            onSubmit={handleAlphabetSubmit}
            disabled={isLoading || disabled}
          />
        </Card>
      )}

      {/* Drawing Pad Panel */}
      {activeInputMethod === 'drawing' && (
        <Card className="p-4 border-border bg-card animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-card-foreground">
              <Pencil className="w-4 h-4 text-primary" />
              Draw Your Answer
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setActiveInputMethod(null)}
              className="h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <KidDrawingPad
            onSave={handleDrawingSave}
            height={300}
            subject={subjectId}
          />
        </Card>
      )}

      {/* Text input + send */}
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
          <div className="absolute right-2 top-2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowQuestions(!showQuestions)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              disabled={isLoading || disabled}
              title="Quick Questions"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
          
          {showQuestions && (
            <Card className="absolute bottom-full mb-2 right-0 w-80 p-2 shadow-lg z-[100] bg-card border-border">
              <div className="space-y-1">
                <p className="text-sm font-medium px-2 py-1 text-card-foreground">Quick Questions</p>
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
