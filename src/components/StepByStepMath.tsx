import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, Send, Trash2 } from "lucide-react";

interface MathStep {
  id: number;
  input: string;
  element?: HTMLDivElement;
}

interface StepByStepMathProps {
  question?: string;
  onSubmit?: (steps: string[]) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    MathJax?: {
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
    };
  }
}

export const StepByStepMath = ({ 
  question = "Type your math problem and show your work step by step",
  onSubmit,
  placeholder = "Type your step..."
}: StepByStepMathProps) => {
  const [steps, setSteps] = useState<MathStep[]>([{ id: 0, input: "" }]);
  const [stepCounter, setStepCounter] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Typeset math when component mounts or steps change
    if (window.MathJax) {
      window.MathJax.typesetPromise([containerRef.current!]).catch((err) => 
        console.error('MathJax typesetting failed:', err)
      );
    }
  }, [steps]);

  const convertToLatex = (input: string): string => {
    if (!input || input.trim() === '') {
      return '\\text{...}';
    }

    let latex = input;
    
    // Handle fractions - both (num)/(den) and num/den
    latex = latex.replace(/(\d+\.?\d*|\([^)]+\))\/(\d+\.?\d*|\([^)]+\))/g, '\\frac{$1}{$2}');
    
    // Handle square root
    latex = latex.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
    
    // Handle powers
    latex = latex.replace(/(\d+|\w+)\^(\d+|\w+|\([^)]+\))/g, '$1^{$2}');
    
    // Replace * with times
    latex = latex.replace(/\*/g, '\\times');
    
    return latex;
  };

  const addStep = () => {
    setSteps([...steps, { id: stepCounter, input: "" }]);
    setStepCounter(stepCounter + 1);
  };

  const deleteStep = (id: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter(step => step.id !== id));
    }
  };

  const updateStep = (id: number, value: string) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, input: value } : step
    ));
  };

  const clearAll = () => {
    setSteps([{ id: stepCounter, input: "" }]);
    setStepCounter(stepCounter + 1);
  };

  const handleSubmit = () => {
    const filledSteps = steps
      .map(s => s.input.trim())
      .filter(s => s.length > 0);
    
    if (filledSteps.length > 0 && onSubmit) {
      onSubmit(filledSteps);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, stepId: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentIndex = steps.findIndex(s => s.id === stepId);
      if (currentIndex === steps.length - 1) {
        addStep();
      }
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      <Card className="p-6 bg-card border-primary/20">
        <div className="mb-6">
          <div className="text-sm font-semibold text-primary mb-2">Question</div>
          <div 
            className="text-lg text-foreground"
            dangerouslySetInnerHTML={{ __html: `\\(${question}\\)` }}
          />
        </div>

        <div className="mb-4">
          <div className="text-sm font-semibold text-primary mb-3">
            Show your work (step by step):
          </div>
          <div className="bg-muted/50 rounded-lg p-4 mb-3 text-xs text-muted-foreground">
            <strong className="text-primary">Quick tips:</strong> 
            <span className="ml-2">
              Use <code className="bg-background px-1.5 py-0.5 rounded">23/12</code> for fractions,
              <code className="bg-background px-1.5 py-0.5 rounded mx-1">2^4</code> for powers,
              <code className="bg-background px-1.5 py-0.5 rounded mx-1">sqrt(16)</code> for square roots
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="step-row">
                <div className="step-number">{index + 1}</div>
                <input
                  type="text"
                  className="step-input"
                  placeholder={placeholder}
                  value={step.input}
                  onChange={(e) => updateStep(step.id, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, step.id)}
                  autoFocus={index === steps.length - 1}
                />
                <div 
                  className="step-preview"
                  dangerouslySetInnerHTML={{ 
                    __html: `\\(${convertToLatex(step.input)}\\)` 
                  }}
                />
                {steps.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => deleteStep(step.id)}
                    className="h-9 w-9 rounded-full flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addStep}
            className="w-full mb-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={clearAll}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1"
              disabled={steps.every(s => !s.input.trim())}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Work
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
