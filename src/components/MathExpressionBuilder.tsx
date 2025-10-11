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

export const MathExpressionBuilder = ({
  onSubmit,
  onCancel,
}: MathExpressionBuilderProps) => {
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

  const updateStep = (
    id: string,
    field: keyof MathStep,
    value: string | boolean
  ) => {
    setSteps(
      steps.map((step) =>
        step.id === id ? { ...step, [field]: value } : step
      )
    );
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

  const formatMathPreview = (step: MathStep): JSX.Element => {
    const parts: JSX.Element[] = [];

    if (step.beforeFraction.trim()) {
      parts.push(
        <span key="before" className="mr-1">
          {formatMathText(step.beforeFraction)}
        </span>
      );
    }

    if (
      step.addFraction &&
      step.numerator.trim() !== "" &&
      step.denominator.trim() !== ""
    ) {
      parts.push(
        <span
          key="fraction"
          className="inline-flex flex-col items-center mx-1 leading-none"
        >
          <span className="border-b border-black dark:border-white px-1">
            {formatMathText(step.numerator)}
          </span>
          <span className="pt-0.5 px-1">{formatMathText(step.denominator)}</span>
        </span>
      );
    }

    if (step.afterFraction.trim()) {
      parts.push(
        <span key="after" className="ml-1">
          {formatMathText(step.afterFraction)}
        </span>
      );
    }

    if (parts.length === 0) {
      return <span className="text-muted-foreground">No expression to display</span>;
    }

    return <div className="inline-flex items-center">{parts}</div>;
  };

  const formatMathText = (text: string): string => {
    return text
      .replace(/\*/g, "×")
      .replace(/\//g, "÷")
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³")
      .replace(/\^(\d+)/g, (match, p1) => {
        const superscripts = "⁰¹²³⁴⁵⁶⁷⁸⁹";
        return p1
          .split("")
          .map((d) => superscripts[parseInt(d)] || `^${d}`)
          .join("");
      })
      .replace(/sqrt\(([^)]+)\)/g, "√$1")
      .replace(/sqrt/g, "√")
      .replace(/pi/g, "π")
      .replace(/theta/g, "θ")
      .replace(/alpha/g, "α")
      .replace(/beta/g, "β")
      .replace(/gamma/g, "γ")
      .replace(/delta/g, "δ")
      .replace(/infinity/g, "∞");
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
        <h3 className="text-sm font-semibold text-foreground mb-2">
          How to build your expression:
        </h3>
        <ol className="text-xs text-muted-foreground space-y-1">
          <li>
            1. Type what comes <strong>before</strong> the fraction
          </li>
          <li>
            2. Check "Add Fraction" and fill numerator/denominator
          </li>
          <li>
            3. Type what comes <strong>after</strong> the fraction
          </li>
          <li>4. Use: * for ×, / for ÷, ^2 for ², sqrt for √, pi for π</li>
        </ol>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {steps.map((step, index) => {
          const expressionStr = buildExpression(step);

          // NEW: fixed preview visibility logic
          const hasContent =
            step.beforeFraction.trim() !== "" ||
            (step.addFraction &&
              step.numerator.trim() !== "" &&
              step.denominator.trim() !== "") ||
            step.afterFraction.trim() !== "";

          const formattedPreview = formatMathPreview(step);

          return (
            <Card
              key={step.id}
              className="p-4 bg-background border-border space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {index + 1}
                </span>
                <h4 className="text-sm font-medium text-foreground">
                  Step {index + 1}
                </h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">
                    Before Fraction
                  </label>
                  <Input
                    value={step.beforeFraction}
                    onChange={(e) =>
                      updateStep(step.id, "beforeFraction", e.target.value)
                    }
                    placeholder="e.g., 12+45"
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex items-center gap-2 pl-4 border-l-2 border-accent">
                  <Checkbox
                    checked={step.addFraction}
                    onCheckedChange={(checked) =>
                      updateStep(step.id, "addFraction", !!checked)
                    }
                    id={`fraction-${step.id}`}
                  />
                  <label
                    htmlFor={`fraction-${step.id}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    Add Fraction Here
                  </label>
                </div>

                {step.addFraction && (
                  <div className="grid grid-cols-2 gap-2 pl-4">
                    <Input
                      value={step.numerator}
                      onChange={(e) =>
                        updateStep(step.id, "numerator", e.target.value)
                      }
                      placeholder="Numerator (e.g., 11-12)"
                      className="bg-input border-border"
                    />
                    <Input
                      value={step.denominator}
                      onChange={(e) =>
                        updateStep(step.id, "denominator", e.target.value)
                      }
                      placeholder="Denominator (e.g., 12-12)"
                      className="bg-input border-border"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">
                    After Fraction
                  </label>
                  <Input
                    value={step.afterFraction}
                    onChange={(e) =>
                      updateStep(step.id, "afterFraction", e.target.value)
                    }
                    placeholder="e.g., + 3"
                    className="bg-input border-border"
                  />
                </div>

                {hasContent && (
                  <div className="bg-muted p-3 rounded border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Step Preview:
                    </p>
                    <div className="min-h-[40px] flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded border">
                      <div className="text-lg text-foreground text-center font-math">
                        {formattedPreview}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Raw:{" "}
                      <code className="bg-border px-1 rounded">
                        {expressionStr}
                      </code>
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={addStep} className="flex-1">
          <Plus className="w-4 h-4 mr-1" />
          Add Step
        </Button>
        <Button type="button" variant="outline" onClick={clearAll} className="flex-1">
          <Trash2 className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} className="flex-1 bg-primary hover:opacity-90">
          Submit Work
        </Button>
      </div>
    </Card>
  );
};
