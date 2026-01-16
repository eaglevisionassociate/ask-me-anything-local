import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Trash2, Check, ArrowUp, ArrowDown, Plus, X } from 'lucide-react';

interface MathElement {
  id: string;
  type: 'number' | 'operator' | 'fraction';
  value?: string;
  numerator?: string;
  denominator?: string;
}

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
  const [elements, setElements] = useState<MathElement[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showFractionBuilder, setShowFractionBuilder] = useState(false);
  const [numerator, setNumerator] = useState('');
  const [denominator, setDenominator] = useState('');
  const [activeField, setActiveField] = useState<'numerator' | 'denominator'>('numerator');

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Convert elements to string for submission
  const elementsToString = (els: MathElement[]): string => {
    return els.map(el => {
      if (el.type === 'fraction') {
        return `(${el.numerator})/(${el.denominator})`;
      }
      return el.value || '';
    }).join('');
  };

  // Update parent value whenever elements change
  const updateValue = (newElements: MathElement[]) => {
    setElements(newElements);
    onChange(elementsToString(newElements));
  };

  // Insert a number or operator at cursor position
  const insertElement = (type: 'number' | 'operator', val: string) => {
    if (disabled) return;
    
    const lastElement = elements[cursorPosition - 1];
    
    // If last element is a number and we're adding a number, append to it
    if (type === 'number' && lastElement?.type === 'number') {
      const newElements = [...elements];
      newElements[cursorPosition - 1] = {
        ...lastElement,
        value: (lastElement.value || '') + val
      };
      updateValue(newElements);
    } else {
      // Insert new element
      const newElement: MathElement = {
        id: generateId(),
        type,
        value: val
      };
      const newElements = [
        ...elements.slice(0, cursorPosition),
        newElement,
        ...elements.slice(cursorPosition)
      ];
      updateValue(newElements);
      setCursorPosition(cursorPosition + 1);
    }
  };

  // Insert fraction at cursor
  const insertFraction = () => {
    if (!numerator || !denominator) return;
    
    const newElement: MathElement = {
      id: generateId(),
      type: 'fraction',
      numerator,
      denominator
    };
    
    const newElements = [
      ...elements.slice(0, cursorPosition),
      newElement,
      ...elements.slice(cursorPosition)
    ];
    
    updateValue(newElements);
    setCursorPosition(cursorPosition + 1);
    setShowFractionBuilder(false);
    setNumerator('');
    setDenominator('');
    setActiveField('numerator');
  };

  // Insert quick fraction
  const insertQuickFraction = (num: string, den: string) => {
    const newElement: MathElement = {
      id: generateId(),
      type: 'fraction',
      numerator: num,
      denominator: den
    };
    
    const newElements = [
      ...elements.slice(0, cursorPosition),
      newElement,
      ...elements.slice(cursorPosition)
    ];
    
    updateValue(newElements);
    setCursorPosition(cursorPosition + 1);
  };

  // Move cursor left
  const moveCursorLeft = () => {
    if (cursorPosition > 0) {
      setCursorPosition(cursorPosition - 1);
    }
  };

  // Move cursor right
  const moveCursorRight = () => {
    if (cursorPosition < elements.length) {
      setCursorPosition(cursorPosition + 1);
    }
  };

  // Delete element before cursor (backspace)
  const handleBackspace = () => {
    if (disabled) return;
    
    if (showFractionBuilder) {
      if (activeField === 'numerator') {
        setNumerator(prev => prev.slice(0, -1));
      } else {
        setDenominator(prev => prev.slice(0, -1));
      }
    } else if (cursorPosition > 0) {
      const elementToDelete = elements[cursorPosition - 1];
      
      // If it's a number with multiple digits, just remove last digit
      if (elementToDelete.type === 'number' && elementToDelete.value && elementToDelete.value.length > 1) {
        const newElements = [...elements];
        newElements[cursorPosition - 1] = {
          ...elementToDelete,
          value: elementToDelete.value.slice(0, -1)
        };
        updateValue(newElements);
      } else {
        // Remove the whole element
        const newElements = elements.filter((_, i) => i !== cursorPosition - 1);
        updateValue(newElements);
        setCursorPosition(cursorPosition - 1);
      }
    }
  };

  // Clear all
  const handleClearAll = () => {
    if (disabled) return;
    
    if (showFractionBuilder) {
      setNumerator('');
      setDenominator('');
    } else {
      updateValue([]);
      setCursorPosition(0);
    }
  };

  // Handle number input for fraction builder
  const handleFractionInput = (char: string) => {
    if (activeField === 'numerator') {
      setNumerator(prev => prev + char);
    } else {
      setDenominator(prev => prev + char);
    }
  };

  // Render a single element
  const renderElement = (el: MathElement, index: number) => {
    const isBeforeCursor = index === cursorPosition - 1;
    const isAfterCursor = index === cursorPosition;
    
    if (el.type === 'fraction') {
      return (
        <div 
          key={el.id} 
          className={`inline-flex flex-col items-center mx-1 px-2 py-1 rounded-lg transition-all ${
            isBeforeCursor ? 'bg-green-100 dark:bg-green-900/30' : ''
          }`}
        >
          <span className="text-xl md:text-2xl font-bold border-b-2 border-foreground px-2 min-w-[24px] text-center">
            {el.numerator}
          </span>
          <span className="text-xl md:text-2xl font-bold px-2 min-w-[24px] text-center">
            {el.denominator}
          </span>
        </div>
      );
    }
    
    if (el.type === 'operator') {
      return (
        <span 
          key={el.id} 
          className={`text-2xl md:text-3xl font-bold mx-1 text-purple-600 dark:text-purple-400 ${
            isBeforeCursor ? 'bg-green-100 dark:bg-green-900/30 px-1 rounded' : ''
          }`}
        >
          {el.value}
        </span>
      );
    }
    
    return (
      <span 
        key={el.id} 
        className={`text-2xl md:text-3xl font-bold ${
          isBeforeCursor ? 'bg-green-100 dark:bg-green-900/30 px-1 rounded' : ''
        }`}
      >
        {el.value}
      </span>
    );
  };

  // Render cursor
  const renderCursor = () => (
    <span className="inline-block w-0.5 h-8 bg-primary animate-pulse mx-0.5" />
  );

  return (
    <div className="space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 p-5 rounded-2xl border-2 border-primary/20 shadow-lg">
      
      {/* Math Expression Display - Shows visual fractions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 min-h-[100px] border-2 border-primary/30 shadow-inner">
        {showFractionBuilder ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-primary flex items-center gap-2">
              {activeField === 'numerator' ? '👆 Type the TOP number' : '👇 Type the BOTTOM number'}
            </p>
            <div className="flex items-center gap-4">
              {/* Show existing expression before the new fraction */}
              {elements.length > 0 && cursorPosition > 0 && (
                <div className="flex items-center opacity-60">
                  {elements.slice(0, cursorPosition).map(renderElement)}
                </div>
              )}
              
              {/* Fraction being built */}
              <div className="flex flex-col items-center bg-teal-50 dark:bg-teal-900/30 px-6 py-3 rounded-xl border-2 border-teal-400">
                <div 
                  className={`min-w-[80px] text-center text-2xl font-bold border-b-4 border-foreground pb-2 mb-2 px-2 rounded cursor-pointer transition-all ${
                    activeField === 'numerator' 
                      ? 'bg-green-200 dark:bg-green-800 ring-2 ring-green-500' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveField('numerator')}
                >
                  {numerator || <span className="text-muted-foreground text-lg">?</span>}
                </div>
                <div 
                  className={`min-w-[80px] text-center text-2xl font-bold pt-1 px-2 rounded cursor-pointer transition-all ${
                    activeField === 'denominator' 
                      ? 'bg-green-200 dark:bg-green-800 ring-2 ring-green-500' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveField('denominator')}
                >
                  {denominator || <span className="text-muted-foreground text-lg">?</span>}
                </div>
              </div>
              
              {/* Show rest of expression after new fraction */}
              {elements.length > cursorPosition && (
                <div className="flex items-center opacity-60">
                  {elements.slice(cursorPosition).map(renderElement)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center flex-wrap min-h-[60px]">
            {elements.length === 0 ? (
              <div className="flex items-center">
                {renderCursor()}
                <span className="text-muted-foreground ml-2">Your answer goes here... 📝</span>
              </div>
            ) : (
              <>
                {cursorPosition === 0 && renderCursor()}
                {elements.map((el, index) => (
                  <React.Fragment key={el.id}>
                    {renderElement(el, index)}
                    {cursorPosition === index + 1 && renderCursor()}
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Navigation Arrows - Move through expression */}
      {!showFractionBuilder && elements.length > 0 && (
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              moveCursorLeft();
            }}
            disabled={disabled || cursorPosition === 0}
            className="h-12 px-6 text-lg font-bold bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 border-2 border-blue-300 text-blue-700 dark:text-blue-300 rounded-xl disabled:opacity-40"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Move Left
          </Button>
          <div className="flex items-center px-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium">
            Position: {cursorPosition} / {elements.length}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              moveCursorRight();
            }}
            disabled={disabled || cursorPosition === elements.length}
            className="h-12 px-6 text-lg font-bold bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 border-2 border-blue-300 text-blue-700 dark:text-blue-300 rounded-xl disabled:opacity-40"
          >
            Move Right
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      )}

      {/* Correction Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleBackspace();
          }}
          disabled={disabled}
          className="flex-1 h-14 text-lg font-bold bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/40 border-2 border-orange-300 text-orange-700 dark:text-orange-300 rounded-xl"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Undo Last
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleClearAll();
          }}
          disabled={disabled}
          className="flex-1 h-14 text-lg font-bold bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 border-2 border-red-300 text-red-700 dark:text-red-300 rounded-xl"
        >
          <Trash2 className="w-6 h-6 mr-2" />
          Start Over
        </Button>
      </div>

      {/* Main Number Pad */}
      <div className="grid grid-cols-4 gap-2">
        {['7', '8', '9', '+', '4', '5', '6', '-', '1', '2', '3', '×', '0', '.', '=', '÷'].map((key) => {
          const isOperator = ['+', '-', '×', '÷', '='].includes(key);
          return (
            <Button
              key={key}
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                if (showFractionBuilder) {
                  if (!isOperator) {
                    handleFractionInput(key);
                  }
                } else {
                  insertElement(isOperator ? 'operator' : 'number', key);
                }
              }}
              disabled={disabled || (showFractionBuilder && isOperator)}
              className={`h-16 text-2xl font-bold rounded-xl transition-transform active:scale-95 ${
                isOperator 
                  ? 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-800/50 border-2 border-purple-300 text-purple-700 dark:text-purple-300' 
                  : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800/50 border-2 border-blue-300 text-blue-700 dark:text-blue-300'
              } ${showFractionBuilder && isOperator ? 'opacity-40' : ''}`}
            >
              {key}
            </Button>
          );
        })}
      </div>

      {/* Fraction Controls */}
      {showFractionBuilder ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setActiveField(prev => prev === 'numerator' ? 'denominator' : 'numerator');
            }}
            disabled={disabled}
            className="flex-1 h-14 text-base font-bold bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/40 border-2 border-yellow-400 text-yellow-700 dark:text-yellow-300 rounded-xl"
          >
            {activeField === 'numerator' ? (
              <>
                <ArrowDown className="w-5 h-5 mr-2" />
                Go to Bottom
              </>
            ) : (
              <>
                <ArrowUp className="w-5 h-5 mr-2" />
                Go to Top
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              insertFraction();
            }}
            disabled={disabled || !numerator || !denominator}
            className="flex-1 h-14 text-base font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl"
          >
            <Check className="w-5 h-5 mr-2" />
            Add Fraction ✓
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setShowFractionBuilder(false);
              setNumerator('');
              setDenominator('');
              setActiveField('numerator');
            }}
            disabled={disabled}
            className="h-14 px-4 text-base font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-2 border-gray-300 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setShowFractionBuilder(true);
              setNumerator('');
              setDenominator('');
              setActiveField('numerator');
            }}
            disabled={disabled}
            className="flex-1 h-14 text-lg font-bold bg-teal-100 hover:bg-teal-200 dark:bg-teal-900/30 dark:hover:bg-teal-800/40 border-2 border-teal-400 text-teal-700 dark:text-teal-300 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5" />
              <div className="flex flex-col items-center text-sm leading-tight">
                <span className="border-b-2 border-current px-2">a</span>
                <span className="px-2">b</span>
              </div>
              <span>Add Fraction</span>
            </div>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              insertElement('operator', '(');
            }}
            disabled={disabled}
            className="h-14 w-14 text-xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-2 border-gray-300 rounded-xl"
          >
            (
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              insertElement('operator', ')');
            }}
            disabled={disabled}
            className="h-14 w-14 text-xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-2 border-gray-300 rounded-xl"
          >
            )
          </Button>
        </div>
      )}

      {/* Quick Fraction Shortcuts */}
      {!showFractionBuilder && (
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-3 border border-primary/10">
          <p className="text-sm font-medium text-muted-foreground mb-2">⚡ Quick fractions:</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {[
              { num: '1', den: '2' },
              { num: '1', den: '3' },
              { num: '1', den: '4' },
              { num: '2', den: '3' },
              { num: '3', den: '4' },
            ].map((frac) => (
              <Button
                key={`${frac.num}/${frac.den}`}
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  insertQuickFraction(frac.num, frac.den);
                }}
                disabled={disabled}
                className="h-14 px-4 bg-white hover:bg-primary/10 dark:bg-slate-700 dark:hover:bg-slate-600 border-2 border-primary/20 rounded-xl transition-transform active:scale-95"
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold border-b-2 border-current px-2">{frac.num}</span>
                  <span className="text-lg font-bold px-2">{frac.den}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Extra Math Symbols */}
      {!showFractionBuilder && (
        <div className="grid grid-cols-6 gap-2">
          {[
            { symbol: '<', label: '<' },
            { symbol: '>', label: '>' },
            { symbol: '√', label: '√' },
            { symbol: 'π', label: 'π' },
            { symbol: '²', label: 'x²' },
            { symbol: '³', label: 'x³' },
          ].map((sym) => (
            <Button
              key={sym.symbol}
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                insertElement('operator', sym.symbol);
              }}
              disabled={disabled}
              className="h-12 text-lg font-medium bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40 border border-indigo-200 dark:border-indigo-700 rounded-xl transition-transform active:scale-95"
            >
              {sym.label}
            </Button>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="button"
        variant="default"
        onClick={(e) => {
          e.stopPropagation();
          onSubmit?.();
        }}
        disabled={disabled || elements.length === 0}
        className="w-full h-16 text-xl font-bold bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl shadow-lg transition-transform active:scale-98"
      >
        <Check className="w-6 h-6 mr-2" />
        Submit My Answer 🎯
      </Button>
    </div>
  );
};
