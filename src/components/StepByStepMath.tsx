import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, Send, Trash2 } from "lucide-react";

interface MathStep {
  id: number;
  input: string;
  numerator: string;
  denominator: string;
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
  const [steps, setSteps] = useState<MathStep[]>([{ id: 0, input: "", numerator: "", denominator: "" }]);
  const [stepCounter, setStepCounter] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise([containerRef.current!]).catch((err) => 
        console.error('MathJax typesetting failed:', err)
      );
    }
  }, [steps]);

  const convertToLatex = (step: MathStep): string => {
    const hasFraction = step.numerator || step.denominator;
    const hasInput = step.input.trim();
    
    if (!hasInput && !hasFraction) {
      return '\\text{...}';
    }

    let latex = step.input.trim();
    
    // Add fraction if numerator or denominator exists
    if (hasFraction) {
      const numerator = step.numerator || '?';
      const denominator = step.denominator || '?';
      const fraction = `\\frac{${numerator}}{${denominator}}`;
      
      if (latex) {
        latex += ` + ${fraction}`;
      } else {
        latex = fraction;
      }
    }

    // Handle other conversions in the main input
    latex = latex.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
    latex = latex.replace(/(\d+|[a-zA-Z]|\([^)]+\))\s*\^\s*(\d+|[a-zA-Z]|\([^)]+\))/g, '$1^{$2}');
    latex = latex.replace(/\*/g, '\\times ');
    latex = latex.replace(/([\+\-\*])(?=\S)/g, '$1 ');
    latex = latex.replace(/(?<=\S)([\+\-\*])/g, ' $1');

    return latex;
  };

  const addStep = () => {
    setSteps([...steps, { id: stepCounter, input: "", numerator: "", denominator: "" }]);
    setStepCounter(stepCounter + 1);
  };

  const deleteStep = (id: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter(step => step.id !== id));
    }
  };

  const updateStep = (id: number, field: 'input' | 'numerator' | 'denominator', value: string) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const clearAll = () => {
    setSteps([{ id: stepCounter, input: "", numerator: "", denominator: "" }]);
    setStepCounter(stepCounter + 1);
  };

  const handleSubmit = () => {
    const filledSteps = steps
      .map(step => convertToLatex(step).replace(/\\text\{\.\.\.\}/g, '').trim())
      .filter(step => step.length > 0);
    
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
    <div className="w-full max-w-4xl mx-auto" ref={containerRef}>
      <Card className="p-6 bg-card border shadow-sm">
        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-700 mb-2">Question</div>
          <div 
            className="text-lg text-gray-900 min-h-[2rem]"
            dangerouslySetInnerHTML={{ __html: `\\(${question}\\)` }}
          />
        </div>

        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">
            Show your work (step by step):
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-600 border">
            <strong className="text-blue-600">How to use:</strong> 
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span>• Use the main input for expressions like:</span>
                <code className="bg-white px-2 py-1 rounded border text-sm">2 + sqrt(16)</code>
                <code className="bg-white px-2 py-1 rounded border text-sm">3 * 5</code>
              </div>
              <div className="flex items-center gap-2">
                <span>• Use numerator/denominator inputs for fractions</span>
              </div>
              <div className="flex items-center gap-2">
                <span>• Both will be combined in the final expression</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col gap-3 p-4 border rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {/* Main input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Step Expression
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 2 + sqrt(16) * 3"
                        value={step.input}
                        onChange={(e) => updateStep(step.id, 'input', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, step.id)}
                        autoFocus={index === steps.length - 1}
                      />
                    </div>

                    {/* Fraction inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Numerator (Top)
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 12+2"
                          value={step.numerator}
                          onChange={(e) => updateStep(step.id, 'numerator', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Denominator (Bottom)
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 26-2"
                          value={step.denominator}
                          onChange={(e) => updateStep(step.id, 'denominator', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Individual fraction preview */}
                    {(step.numerator || step.denominator) && (
                      <div className="p-2 bg-gray-50 rounded border">
                        <div className="text-xs text-gray-500 mb-1">Fraction Preview:</div>
                        <div 
                          className="text-center text-lg"
                          dangerouslySetInnerHTML={{ 
                            __html: `\\(\\frac{${step.numerator || '?'}}{${step.denominator || '?'}}\\)` 
                          }}
                        />
                      </div>
                    )}

                    {/* Combined preview */}
                    {(step.input || step.numerator || step.denominator) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Step Preview
                        </label>
                        <div 
                          className="p-3 bg-gray-50 rounded border min-h-[3rem] text-gray-700 flex items-center justify-center text-lg"
                          dangerouslySetInnerHTML={{ 
                            __html: `\\(${convertToLatex(step)}\\)` 
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {steps.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => deleteStep(step.id)}
                      className="h-8 w-8 rounded-full flex-shrink-0 border-red-200 hover:bg-red-50 hover:text-red-600 mt-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={addStep}
              className="flex-1 border-dashed border-gray-300 hover:border-solid"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={clearAll}
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={steps.every(step => !step.input.trim() && !step.numerator && !step.denominator)}
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
