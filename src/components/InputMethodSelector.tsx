import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, Type, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InputMethod = 'calculator' | 'alphabet' | 'drawing' | null;

interface InputMethodSelectorProps {
  activeMethod: InputMethod;
  onMethodChange: (method: InputMethod) => void;
  showCalculator?: boolean;
  showAlphabet?: boolean;
  showDrawing?: boolean;
}

export const InputMethodSelector: React.FC<InputMethodSelectorProps> = ({
  activeMethod,
  onMethodChange,
  showCalculator = true,
  showAlphabet = true,
  showDrawing = true
}) => {
  const handleToggle = (method: InputMethod) => {
    if (activeMethod === method) {
      onMethodChange(null); // Close if already open
    } else {
      onMethodChange(method); // Open new one (closes others)
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center p-3 bg-muted/30 rounded-lg border border-border">
      <span className="text-sm text-muted-foreground self-center mr-2">Answer with:</span>
      
      {showCalculator && (
        <Button
          variant={activeMethod === 'calculator' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToggle('calculator')}
          className={cn(
            "gap-2 transition-all",
            activeMethod === 'calculator' && "ring-2 ring-primary ring-offset-2"
          )}
        >
          <Calculator className="w-4 h-4" />
          Math Calculator
          {activeMethod === 'calculator' ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </Button>
      )}

      {showAlphabet && (
        <Button
          variant={activeMethod === 'alphabet' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToggle('alphabet')}
          className={cn(
            "gap-2 transition-all",
            activeMethod === 'alphabet' && "ring-2 ring-primary ring-offset-2"
          )}
        >
          <Type className="w-4 h-4" />
          Alphabet
          {activeMethod === 'alphabet' ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </Button>
      )}

      {showDrawing && (
        <Button
          variant={activeMethod === 'drawing' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToggle('drawing')}
          className={cn(
            "gap-2 transition-all",
            activeMethod === 'drawing' && "ring-2 ring-primary ring-offset-2"
          )}
        >
          <Pencil className="w-4 h-4" />
          Drawing
          {activeMethod === 'drawing' ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </Button>
      )}
    </div>
  );
};
