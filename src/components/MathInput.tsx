import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Fraction } from "@/components/ui/fraction";
import { Card } from "@/components/ui/card";
import { 
  X, 
  Plus, 
  Minus, 
  Divide,
  Calculator,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface MathToken {
  type: 'text' | 'fraction' | 'superscript' | 'subscript' | 'sqrt' | 'operator';
  content: string;
  numerator?: string;
  denominator?: string;
  exponent?: string;
}

export const MathInput = ({ 
  value, 
  onChange, 
  onKeyDown, 
  placeholder = "Type your answer...",
  disabled,
  className = ""
}: MathInputProps) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Parse the input value to display visual fractions
  const parseExpression = (text: string): MathToken[] => {
    const tokens: MathToken[] = [];
    let i = 0;
    let currentText = '';

    while (i < text.length) {
      // Check for fraction pattern (num)/(den)
      const fractionMatch = text.slice(i).match(/^\(([^)]+)\)\/\(([^)]+)\)/);
      if (fractionMatch) {
        if (currentText) {
          tokens.push({ type: 'text', content: currentText });
          currentText = '';
        }
        tokens.push({
          type: 'fraction',
          content: fractionMatch[0],
          numerator: fractionMatch[1],
          denominator: fractionMatch[2]
        });
        i += fractionMatch[0].length;
        continue;
      }

      // Check for simple fraction pattern num/den (single digits or simple numbers)
      const simpleFractionMatch = text.slice(i).match(/^(\d+)\/(\d+)/);
      if (simpleFractionMatch) {
        if (currentText) {
          tokens.push({ type: 'text', content: currentText });
          currentText = '';
        }
        tokens.push({
          type: 'fraction',
          content: simpleFractionMatch[0],
          numerator: simpleFractionMatch[1],
          denominator: simpleFractionMatch[2]
        });
        i += simpleFractionMatch[0].length;
        continue;
      }

      // Check for superscript pattern ^(exp)
      const superscriptMatch = text.slice(i).match(/^\^(?:\(([^)]+)\)|(\d))/);
      if (superscriptMatch) {
        if (currentText) {
          tokens.push({ type: 'text', content: currentText });
          currentText = '';
        }
        tokens.push({
          type: 'superscript',
          content: superscriptMatch[0],
          exponent: superscriptMatch[1] || superscriptMatch[2]
        });
        i += superscriptMatch[0].length;
        continue;
      }

      // Check for sqrt pattern
      const sqrtMatch = text.slice(i).match(/^sqrt\(([^)]+)\)/);
      if (sqrtMatch) {
        if (currentText) {
          tokens.push({ type: 'text', content: currentText });
          currentText = '';
        }
        tokens.push({
          type: 'sqrt',
          content: sqrtMatch[0],
          numerator: sqrtMatch[1]
        });
        i += sqrtMatch[0].length;
        continue;
      }

      currentText += text[i];
      i++;
    }

    if (currentText) {
      tokens.push({ type: 'text', content: currentText });
    }

    return tokens;
  };

  const renderTokens = (tokens: MathToken[]) => {
    return tokens.map((token, index) => {
      switch (token.type) {
        case 'fraction':
          return (
            <Fraction
              key={index}
              numerator={token.numerator || ''}
              denominator={token.denominator || ''}
              className="mx-0.5"
            />
          );
        case 'superscript':
          return (
            <sup key={index} className="text-xs">
              {token.exponent}
            </sup>
          );
        case 'sqrt':
          return (
            <span key={index} className="inline-flex items-center">
              √<span className="border-t border-current px-1">{token.numerator}</span>
            </span>
          );
        case 'text':
        default:
          return <span key={index}>{token.content}</span>;
      }
    });
  };

  const insertText = (text: string) => {
    const newValue = value + text;
    onChange(newValue);
  };

  const insertFraction = () => {
    insertText('()/()')
    // Move cursor between first parentheses
    setTimeout(() => {
      if (hiddenInputRef.current) {
        const newPos = value.length + 1;
        hiddenInputRef.current.setSelectionRange(newPos, newPos);
        hiddenInputRef.current.focus();
      }
    }, 0);
  };

  const mathButtons = [
    { label: 'x²', value: '^2', icon: null },
    { label: 'xⁿ', value: '^()', icon: null },
    { label: '¹⁄ₓ', value: '1/()', icon: null },
    { label: '√', value: 'sqrt()', icon: null },
    { label: 'π', value: 'π', icon: null },
    { label: 'sin', value: 'sin()', icon: null },
    { label: 'cos', value: 'cos()', icon: null },
    { label: 'tan', value: 'tan()', icon: null },
    { label: 'ln', value: 'ln()', icon: null },
    { label: 'log', value: 'log()', icon: null },
  ];

  const operatorButtons = [
    { label: '+', icon: Plus },
    { label: '-', icon: Minus },
    { label: '×', value: '×', icon: X },
    { label: '÷', icon: Divide },
    { label: '=', value: '=', icon: null },
    { label: '(', value: '(', icon: null },
    { label: ')', value: ')', icon: null },
  ];

  const numberButtons = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.'];

  const tokens = parseExpression(value);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Visual Display */}
      <div 
        ref={inputRef}
        className="min-h-[60px] max-h-32 overflow-y-auto p-3 bg-input border border-border rounded-md focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent transition-smooth"
      >
        <div className="flex flex-wrap items-center gap-1 text-base">
          {value ? renderTokens(tokens) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
      </div>

      {/* Hidden input for actual text editing */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className="sr-only"
      />

      {/* Toggle Keyboard Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowKeyboard(!showKeyboard)}
        className="w-full"
      >
        <Calculator className="w-4 h-4 mr-2" />
        {showKeyboard ? 'Hide' : 'Show'} Math Keyboard
        {showKeyboard ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
      </Button>

      {/* Math Keyboard */}
      {showKeyboard && (
        <Card className="p-3 bg-card border-border">
          <div className="space-y-2">
            {/* Math Functions Row 1 */}
            <div className="grid grid-cols-5 gap-1">
              {mathButtons.slice(0, 5).map((btn) => (
                <Button
                  key={btn.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText(btn.value || btn.label)}
                  className="text-xs h-9"
                >
                  {btn.label}
                </Button>
              ))}
            </div>

            {/* Math Functions Row 2 */}
            <div className="grid grid-cols-5 gap-1">
              {mathButtons.slice(5).map((btn) => (
                <Button
                  key={btn.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText(btn.value || btn.label)}
                  className="text-xs h-9"
                >
                  {btn.label}
                </Button>
              ))}
            </div>

            {/* Fraction Button (Highlighted) */}
            <div className="grid grid-cols-1 gap-1">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={insertFraction}
                className="text-sm h-10 bg-primary"
              >
                <span className="inline-flex flex-col items-center leading-none text-xs">
                  <span className="border-b border-current px-2">a</span>
                  <span className="px-2">b</span>
                </span>
                <span className="ml-2">Fraction</span>
              </Button>
            </div>

            {/* Numbers and Operators */}
            <div className="grid grid-cols-4 gap-1">
              {numberButtons.map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText(num)}
                  className="h-10"
                >
                  {num}
                </Button>
              ))}
              {operatorButtons.map((op) => (
                <Button
                  key={op.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertText(op.value || op.label)}
                  className="h-10"
                >
                  {op.icon ? <op.icon className="w-4 h-4" /> : op.label}
                </Button>
              ))}
            </div>

            {/* Clear Button */}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onChange('')}
              className="w-full"
            >
              Clear
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
