import React, { useState } from "react";
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
    setSteps((prev) => [
      ...prev,
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
    setSteps((prev) =>
      prev.map((step) =>
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
    let expr = step.beforeFraction.trim();
    if (step.addFraction && step.numerator.trim() && step.denominator.trim()) {
      // I include parentheses around numerator/denominator
      expr += ` (${step.numerator.trim()})/(${step.denominator.trim()})`;
    }
    if (step.afterFraction.trim()) {
      // ensure spacing
      expr += ` ${step.afterFraction.trim()}`;
    }
    return expr.trim();
  };

  const formatMathPreview = (step: MathStep): JSX.Element => {
    const parts: JSX.Element[] = [];

    // Before fraction
    if (step.beforeFraction.trim()) {
      parts.push(
        <span key="before" className="mr-1">
          {formatMathText(step.beforeFraction)}
        </span>
      );
    }

    // Fraction part
    if (step.addFraction && step.numerator.trim() && step.denominator.trim()) {
      parts.push(
        <span
          key="fraction"
          className="inline-flex flex-col items-center mx-1 leading-none"
        >
          <span className="border-b border-gray-700 px-1">
            {formatMathText(step.numerator)}
          </span>
          <span className="pt-0.5 px-1">
            {formatMathText(step.denominator)}
          </span>
        </span>
      );
    }

    // After fraction
    if (step.afterFraction.trim()) {
      parts.push(
        <span key="after" className="ml-1">
          {formatMathText(step.afterFraction)}
        </span>
      );
    }

    if (parts.length === 0) {
      return <span className="text-gray-500">No expression to display</span>;
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
    const fullExpr = steps.map(buildExpression).join(" ");
    if (fullExpr.trim()) {
      onSubmit(fullExpr);
    }
  };

  return (
    <Card className="p-4 space-y-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
      {/* Instructions */}
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Build your expression:
        </h3>
        <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>Type what comes <strong>before</strong> the fraction</li>
          <li>Check “Add Fraction” and fill numerator/denominator</li>
          <li>Type what comes <strong>after</strong> the fraction</li>
          <li>Use: * for ×, / for ÷, ^2 for ², sqrt for √, pi for π</li>
        </ol>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {steps.map((step, idx) => {
          const exprStr = buildExpression(step);
          const hasContent =
            step.beforeFraction.trim() !== "" ||
            (step.addFraction &&
              step.numerator.trim() !== "" &&
              step.denominator.trim() !== "") ||
            step.afterFraction.trim() !== "";

          const preview = formatMathPreview(step);

          return (
            <Card
              key={step.id}
              className="p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 space-y-3"
            >
              {/* Step Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-medium">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Step {idx + 1}
                </h4>
              </div>

              <div className="space-y-3">
                {/* Before Fraction Input */}
                <div>
                  <label className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1 block">
                    Before Fraction
                  </label>
                  <Input
                    value={step.beforeFraction}
                    onChange={(e) =>
                      updateStep(step.id, "beforeFraction", e.target.value)
                    }
                    placeholder="e.g., 12+45"
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Fraction Toggle */}
                <div className="flex items-center gap-2 pl-4 border-l-2 border-blue-500">
                  <Checkbox
                    checked={step.addFraction}
                    onCheckedChange={(chk) =>
                      updateStep(step.id, "addFraction", !!chk)
                    }
                    id={`fraction-${step.id}`}
                  />
                  <label
                    htmlFor={`fraction-${step.id}`}
                    className="text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                  >
                    Add Fraction Here
                  </label>
                </div>

                {/* Numerator / Denominator */}
                {step.addFraction && (
                  <div className="grid grid-cols-2 gap-2 pl-4">
                    <Input
                      value={step.numerator}
                      onChange={(e) =>
                        updateStep(step.id, "numerator", e.target.value)
                      }
                      placeholder="Numerator"
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                    />
                    <Input
                      value={step.denominator}
                      onChange={(e) =>
                        updateStep(step.id, "denominator", e.target.value)
                      }
                      placeholder="Denominator"
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}

                {/* After Fraction Input */}
                <div>
                  <label className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1 block">
                    After Fraction
                  </label>
                  <Input
                    value={step.afterFraction}
                    onChange={(e) =>
                      updateStep(step.id, "afterFraction", e.target.value)
                    }
                    placeholder="e.g., + 3"
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Preview Box */}
                {hasContent && (
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Step Preview:
                    </p>
                    <div className="min-h-[40px] flex items-center justify-center p-2 rounded border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-900">
                      <div className="text-lg text-gray-900 dark:text-gray-100 text-center font-math">
                        {preview}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Raw:{" "}
                      <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                        {exprStr}
                      </code>
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-300 dark:border-gray-600">
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
          className="flex-1 bg-blue-500 hover:opacity-90 text-white"
        >
          Submit Work
        </Button>
      </div>
    </Card>
  );
};
