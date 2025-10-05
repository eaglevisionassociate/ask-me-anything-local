import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, Send, Trash2, Fraction } from "lucide-react";

interface MathStep {
  id: number;
  input: string;
  fractions: Array<{
    id: number;
    numerator: string;
    denominator: string;
  }>;
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
  const [steps, setSteps] = useState<MathStep[]>([{ id: 0, input: "", fractions: [] }]);
  const [stepCounter, setStepCounter] = useState(1);
  const [fractionCounter, setFractionCounter] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise([containerRef.current!]).catch((err) => 
        console.error('MathJax typesetting failed:', err)
      );
    }
  }, [steps]);

  const convertToLatex = (step: MathStep): string => {
    if (!step.input && step.fractions.length === 0) {
      return '\\text{...}';
    }

    let latex = step.input;

    // Replace fraction placeholders with actual fractions
    step.fractions.forEach((fraction, index) => {
      const fractionLatex = `\\frac{${fraction.numerator || '?'}}{${fraction.denominator || '?'}}`;
      const placeholder = `[fraction${fraction.id}]`;
      
      if (latex.includes(placeholder)) {
        latex = latex.replace(placeholder, fractionLatex);
      } else {
        // If no placeholder found, append the fraction
        latex += (latex ? ' + ' : '') + fractionLatex;
      }
    });

    // Handle other conversions
    latex = latex.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
    latex = latex.replace(/(\d+|[a-zA-Z]|\([^)]+\))\s*\^\s*(\d+|[a-zA-Z]|\([^)]+\))/g, '$1^{$2}');
    latex = latex.replace(/\*/g, '\\times ');
    latex = latex.replace(/([\+\-\*])(?=\S)/g, '$1 ');
    latex = latex.replace(/(?<=\S)([\+\-\*])/g, ' $1');

    return latex || '\\text{...}';
  };

  const addStep = () => {
    setSteps([...steps, { id: stepCounter, input: "", fractions: [] }]);
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

  const addFraction = (stepId: number) => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        const newFractionId = fractionCounter;
        setFractionCounter(fractionCounter + 1);
        
        // Add placeholder in the main input
        const placeholder = `[fraction${newFractionId}]`;
        const newInput = step.input ? step.input + ' + ' + placeholder : placeholder;
        
        return {
          ...step,
          input: newInput,
          fractions: [...step.fractions, { 
            id: newFractionId, 
            numerator: '', 
            denominator: '' 
          }]
        };
      }
      return step;
    }));
  };

  const updateFraction = (stepId: number, fractionId: number, field: 'numerator' | 'denominator', value: string) => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          fractions: step.fractions.map(fraction =>
            fraction.id === fractionId ? { ...fraction, [field]: value } : fraction
          )
        };
      }
      return step;
    }));
  };

  const deleteFraction = (stepId: number, fractionId: number) => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        // Remove the fraction placeholder from input
        const placeholder = `[fraction${fractionId}]`;
        let newInput = step.input.replace(new RegExp(`\\s*\\+\\s*${placeholder}|${placeholder}\\s*\\+\\s*|${placeholder}`, 'g'), '');
        newInput = newInput.replace(/\+\s*\+/g, '+').replace(/^\s*\+\s*|\s*\+\s*$/g, '');
        
        return {
          ...step,
          input: newInput,
          fractions: step.fractions.filter(f => f.id !== fractionId)
        };
      }
      return step;
    }));
  };

  const clearAll = () => {
    setSteps([{ id: stepCounter, input: "", fractions: [] }]);
    setStepCounter(stepCounter + 1);
  };

  const handleSubmit = () => {
    const filledSteps = steps
      .map(step => {
        if (step.input.trim() || step.fractions.some(f => f.numerator || f.denominator)) {
          return convertToLatex(step).replace(/\\text\{\.\.\.\}/g, '').trim();
        }
        return '';
      })
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
            <strong className="text-blue-600">How to use fractions:</strong> 
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap items-center gap-1">
                <span>1. Click "Add Fraction" to create a fraction</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span>2. Enter numerator (top) and denominator (bottom)</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span>3. Use the main input for other operations: </span>
                <code className="bg-white px-2 py-1 rounded border text-sm">sqrt(16)</code>
                <code className="bg-white px-2 py-1 rounded border text-sm">2^4</code>
                <code className="bg-white px-2 py-1 rounded border text-sm">2*3</code>
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
                        placeholder="e.g., 2 + sqrt(16) + [fractions will appear here]"
                        value={step.input}
                        onChange={(e) => updateStep(step.id, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, step.id)}
                        autoFocus={index === steps.length - 1}
                      />
                    </div>

                    {/* Fractions section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Fractions
                        </label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addFraction(step.id)}
                          className="h-8"
                        >
                          <Fraction className="h-3 w-3 mr-1" />
                          Add Fraction
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {step.fractions.map((fraction) => (
                          <div key={fraction.id} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Numerator</label>
                                <input
                                  type="text"
                                  className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Top number"
                                  value={fraction.numerator}
                                  onChange={(e) => updateFraction(step.id, fraction.id, 'numerator', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Denominator</label>
                                <input
                                  type="text"
                                  className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Bottom number"
                                  value={fraction.denominator}
                                  onChange={(e) => updateFraction(step.id, fraction.id, 'denominator', e.target.value)}
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteFraction(step.id, fraction.id)}
                              className="h-6 w-6 flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    {(step.input || step.fractions.length > 0) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preview
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
                      className="h-8 w-8 rounded-full flex-shrink-0 border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addStep}
            className="w-full mb-4 border-dashed border-gray-300 hover:border-solid"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>

          <div className="flex gap-3">
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
              disabled={steps.every(step => !step.input.trim() && step.fractions.length === 0)}
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
