import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface MathStep {
  id: string;
  beforeFraction: string;
  addFraction: boolean;
  numerator: string;
  denominator: string;
  afterFraction: string;
}

interface MathExpressionBuilderProps {
  onSubmit: (expression: string) => void;
  onCancel: () => void;
}

export const MathExpressionBuilder = ({ onSubmit, onCancel }: MathExpressionBuilderProps) => {
  const [steps, setSteps] = useState<MathStep[]>([
    {
      id: "1",
      beforeFraction: "",
      addFraction: false,
      numerator: "",
      denominator: "",
      afterFraction: "",
    },
  ]);

  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: Date.now().toString(),
        beforeFraction: "",
        addFraction: false,
        numerator: "",
        denominator: "",
        afterFraction: "",
      },
    ]);
  };

  const updateStep = (id: string, field: keyof MathStep, value: string | boolean) => {
    setSteps(steps.map((step) => (step.id === id ? { ...step, [field]: value } : step)));
  };

  const clearAll = () => {
    setSteps([
      {
        id: "1",
        beforeFraction: "",
        addFraction: false,
        numerator: "",
        denominator: "",
        afterFraction: "",
      },
    ]);
  };

  const buildExpression = (step: MathStep): string => {
    let expr = step.beforeFraction;
    if (step.addFraction && step.numerator && step.denominator) {
      expr += ` (${step.numerator})/(${step.denominator})`;
    }
    if (step.afterFraction) {
      expr += ` ${step.afterFraction}`;
    }
    return expr.trim();
  };

  const handleSubmit = () => {
    const fullExpression = steps.map(buildExpression).join("\n");
    if (fullExpression.trim()) {
      onSubmit(fullExpression);
    }
  };

  return (
    <Card className="p-4 space-y-4 bg-card border-border">
      <div className="bg-muted p-3 rounded-md">
        <h3 className="text-sm font-semibold text-foreground mb-2">How to build your expression:</h3>
        <ol className="text-xs text-muted-foreground space-y-1">
          <li>1. Type what comes <strong>before</strong> the fraction</li>
          <li>2. Check "Add Fraction" and fill numerator/denominator</li>
          <li>3. Type what comes <strong>after</strong> the fraction</li>
        </ol>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {steps.map((step, index) => (
          <Card key={step.id} className="p-4 bg-background border-border space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {index + 1}
              </span>
              <h4 className="text-sm font-medium text-foreground">Step {index + 1}</h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Before Fraction</label>
                <Input
                  value={step.beforeFraction}
                  onChange={(e) => updateStep(step.id, "beforeFraction", e.target.value)}
                  placeholder="e.g., x + "
                  className="bg-input border-border"
                />
              </div>

              <div className="flex items-center gap-2 pl-4 border-l-2 border-accent">
                <Checkbox
                  checked={step.addFraction}
                  onCheckedChange={(checked) => updateStep(step.id, "addFraction", !!checked)}
                  id={`fraction-${step.id}`}
                />
                <label htmlFor={`fraction-${step.id}`} className="text-sm text-foreground cursor-pointer">
                  Add Fraction Here
                </label>
              </div>

              {step.addFraction && (
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <Input
                    value={step.numerator}
                    onChange={(e) => updateStep(step.id, "numerator", e.target.value)}
                    placeholder="Numerator"
                    className="bg-input border-border"
                  />
                  <Input
                    value={step.denominator}
                    onChange={(e) => updateStep(step.id, "denominator", e.target.value)}
                    placeholder="Denominator"
                    className="bg-input border-border"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">After Fraction</label>
                <Input
                  value={step.afterFraction}
                  onChange={(e) => updateStep(step.id, "afterFraction", e.target.value)}
                  placeholder="e.g., + 3"
                  className="bg-input border-border"
                />
              </div>

              {buildExpression(step) && (
                <div className="bg-muted p-3 rounded border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Step Preview:</p>
                  <p className="text-sm font-mono text-foreground italic">{buildExpression(step)}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={addStep}
          className="flex-1"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Step
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={clearAll}
          className="flex-1"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-primary hover:opacity-90"
        >
          Submit Work
        </Button>
      </div>
    </Card>
  );
};
