import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Delete, CornerDownLeft, Plus, Minus, X, Divide, Equal, ChevronUp, ChevronDown } from 'lucide-react';
import { Fraction } from '@/components/ui/fraction';

interface MathCalculatorKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
}

export const MathCalculatorKeyboard: React.FC<MathCalculatorKeyboardProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false
}) => {
  const [showFractionBuilder, setShowFractionBuilder] = useState(false);
  const [numerator, setNumerator] = useState('');
  const [denominator, setDenominator] = useState('');
  const [activeField, setActiveField] = useState<'numerator' | 'denominator'>('numerator');

  // Insert character at cursor position
  const insertChar = (char: string) => {
    if (disabled) return;
    
    if (showFractionBuilder) {
      if (activeField === 'numerator') {
        setNumerator(prev => prev + char);
      } else {
        setDenominator(prev => prev + char);
      }
    } else {
      onChange(value + char);
    }
  };

  // Delete last character
  const handleDelete = () => {
    if (disabled) return;
    
    if (showFractionBuilder) {
      if (activeField === 'numerator') {
        setNumerator(prev => prev.slice(0, -1));
      } else {
        setDenominator(prev => prev.slice(0, -1));
      }
    } else {
      onChange(value.slice(0, -1));
    }
  };

  // Clear all
  const handleClear = () => {
    if (disabled) return;
    
    if (showFractionBuilder) {
      setNumerator('');
      setDenominator('');
    } else {
      onChange('');
    }
  };

  // Insert the built fraction
  const insertFraction = () => {
    if (numerator && denominator) {
      const fractionText = `(${numerator})/(${denominator})`;
      onChange(value + fractionText);
      setNumerator('');
      setDenominator('');
      setShowFractionBuilder(false);
      setActiveField('numerator');
    }
  };

  // Toggle between numerator and denominator input
  const toggleFractionField = () => {
    setActiveField(prev => prev === 'numerator' ? 'denominator' : 'numerator');
  };

  // Number keys
  const numberKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '('];
  
  // Operator keys
  const operatorKeys = [
    { symbol: '+', display: <Plus className="w-4 h-4" /> },
    { symbol: '-', display: <Minus className="w-4 h-4" /> },
    { symbol: '×', display: <X className="w-4 h-4" /> },
    { symbol: '÷', display: <Divide className="w-4 h-4" /> },
  ];

  // Additional math symbols
  const mathSymbols = [
    { symbol: '=', display: '=' },
    { symbol: ')', display: ')' },
    { symbol: '<', display: '<' },
    { symbol: '>', display: '>' },
    { symbol: '√', display: '√' },
    { symbol: 'π', display: 'π' },
    { symbol: '²', display: 'x²' },
    { symbol: '³', display: 'x³' },
  ];

  return (
    <div className="space-y-3 bg-card p-4 rounded-xl border border-border">
      {/* Display Area */}
      <div className="bg-background rounded-lg p-3 min-h-[60px] border border-border">
        {showFractionBuilder ? (
          <div className="flex items-center justify-center gap-4">
            <div 
              className={`flex flex-col items-center cursor-pointer p-2 rounded ${activeField === 'numerator' ? 'bg-primary/20 ring-2 ring-primary' : ''}`}
              onClick={() => setActiveField('numerator')}
            >
              <div className="min-w-[80px] text-center border-b-2 border-foreground pb-1 mb-1 font-mono text-lg">
                {numerator || <span className="text-muted-foreground">top</span>}
              </div>
              <div className="min-w-[80px] text-center pt-1 font-mono text-lg">
                {denominator || <span className="text-muted-foreground">bottom</span>}
              </div>
            </div>
            <div 
              className={`flex flex-col items-center cursor-pointer p-2 rounded ${activeField === 'denominator' ? 'bg-primary/20 ring-2 ring-primary' : ''}`}
              onClick={() => setActiveField('denominator')}
            >
            </div>
          </div>
        ) : (
          <div className="font-mono text-xl break-all">
            {value || <span className="text-muted-foreground">Type your answer...</span>}
          </div>
        )}
      </div>

      {/* Fraction Builder Mode Indicator */}
      {showFractionBuilder && (
        <div className="text-center text-sm text-primary font-medium">
          Building fraction: Type the {activeField}
        </div>
      )}

      {/* Calculator Keypad */}
      <div className="grid grid-cols-5 gap-2">
        {/* Numbers Column */}
        <div className="col-span-3 grid grid-cols-3 gap-1.5">
          {numberKeys.map((key) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                insertChar(key);
              }}
              disabled={disabled}
              className="h-12 text-lg font-semibold bg-secondary hover:bg-secondary/80"
            >
              {key}
            </Button>
          ))}
        </div>

        {/* Operators Column */}
        <div className="col-span-2 grid grid-cols-2 gap-1.5">
          {operatorKeys.map((op) => (
            <Button
              key={op.symbol}
              type="button"
              variant="outline"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                insertChar(` ${op.symbol} `);
              }}
              disabled={disabled}
              className="h-12 bg-accent/20 hover:bg-accent/30 text-accent-foreground"
            >
              {op.display}
            </Button>
          ))}
          
          {/* Fraction Button */}
          <Button
            type="button"
            variant={showFractionBuilder ? "default" : "outline"}
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              setShowFractionBuilder(!showFractionBuilder);
              if (!showFractionBuilder) {
                setNumerator('');
                setDenominator('');
                setActiveField('numerator');
              }
            }}
            disabled={disabled}
            className={`h-12 ${showFractionBuilder ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/30'}`}
          >
            <div className="flex flex-col items-center text-xs leading-tight">
              <span className="border-b border-current px-1">a</span>
              <span className="px-1">b</span>
            </div>
          </Button>

          {/* Up/Down Arrow for Fraction */}
          {showFractionBuilder ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                toggleFractionField();
              }}
              disabled={disabled}
              className="h-12 bg-secondary"
            >
              <div className="flex flex-col">
                <ChevronUp className={`w-3 h-3 ${activeField === 'numerator' ? 'text-primary' : ''}`} />
                <ChevronDown className={`w-3 h-3 ${activeField === 'denominator' ? 'text-primary' : ''}`} />
              </div>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={disabled}
              className="h-12 bg-destructive/20 hover:bg-destructive/30"
            >
              <Delete className="w-4 h-4" />
            </Button>
          )}

          {/* Insert Fraction or Delete */}
          {showFractionBuilder ? (
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                insertFraction();
              }}
              disabled={disabled || !numerator || !denominator}
              className="h-12 col-span-2 bg-primary hover:bg-primary/80"
            >
              Insert Fraction
            </Button>
          ) : (
            <>
              {/* Delete */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                disabled={disabled}
                className="h-12 bg-destructive/20 hover:bg-destructive/30"
              >
                C
              </Button>
              {/* Enter/Submit */}
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onSubmit?.();
                }}
                disabled={disabled || !value.trim()}
                className="h-12 bg-primary hover:bg-primary/80"
              >
                <CornerDownLeft className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Additional Math Symbols Row */}
      <div className="grid grid-cols-8 gap-1.5">
        {mathSymbols.map((sym) => (
          <Button
            key={sym.symbol}
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              insertChar(sym.symbol);
            }}
            disabled={disabled}
            className="h-10 text-sm bg-muted hover:bg-muted/80"
          >
            {sym.display}
          </Button>
        ))}
      </div>

      {/* Quick Fraction Shortcuts */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">Quick fractions:</span>
        <div className="flex gap-1 flex-wrap">
          {['(1)/(2)', '(1)/(3)', '(1)/(4)', '(2)/(3)', '(3)/(4)'].map((frac) => (
            <Button
              key={frac}
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onChange(value + frac);
              }}
              disabled={disabled}
              className="h-8 px-2 text-xs"
            >
              <Fraction 
                numerator={frac.match(/\((\d+)\)/)?.[1] || ''} 
                denominator={frac.match(/\/\((\d+)\)/)?.[1] || ''} 
              />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
