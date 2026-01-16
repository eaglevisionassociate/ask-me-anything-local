import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Check, ArrowUp, ArrowDown } from 'lucide-react';
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

  // Insert character
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

  // Delete last character (backspace)
  const handleBackspace = () => {
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
  const handleClearAll = () => {
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

  // Cancel fraction builder
  const cancelFraction = () => {
    setShowFractionBuilder(false);
    setNumerator('');
    setDenominator('');
    setActiveField('numerator');
  };

  return (
    <div className="space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 p-5 rounded-2xl border-2 border-primary/20 shadow-lg">
      {/* Answer Display - Big and Clear */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 min-h-[80px] border-2 border-primary/30 shadow-inner">
        {showFractionBuilder ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-primary">
              {activeField === 'numerator' ? '👆 Type the TOP number' : '👇 Type the BOTTOM number'}
            </p>
            <div className="flex items-center justify-center">
              <div 
                className={`flex flex-col items-center cursor-pointer px-6 py-2 rounded-xl transition-all ${
                  activeField === 'numerator' 
                    ? 'bg-green-100 dark:bg-green-900/30 ring-3 ring-green-500 scale-105' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
                onClick={() => setActiveField('numerator')}
              >
                <div className="min-w-[100px] text-center text-2xl font-bold border-b-4 border-foreground pb-2 mb-2">
                  {numerator || <span className="text-muted-foreground text-lg">?</span>}
                </div>
                <div 
                  className={`min-w-[100px] text-center text-2xl font-bold pt-1 rounded-lg px-2 ${
                    activeField === 'denominator' 
                      ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500' 
                      : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveField('denominator');
                  }}
                >
                  {denominator || <span className="text-muted-foreground text-lg">?</span>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="font-mono text-2xl md:text-3xl break-all flex-1">
              {value || <span className="text-muted-foreground">Your answer goes here... 📝</span>}
            </div>
            {value && (
              <span className="text-2xl ml-2">✏️</span>
            )}
          </div>
        )}
      </div>

      {/* Correction Buttons - Always Visible and Prominent */}
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

      {/* Main Number Pad - Large Kid-Friendly Buttons */}
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
                if (isOperator && key !== '=') {
                  insertChar(` ${key} `);
                } else {
                  insertChar(key);
                }
              }}
              disabled={disabled}
              className={`h-16 text-2xl font-bold rounded-xl transition-transform active:scale-95 ${
                isOperator 
                  ? 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-800/50 border-2 border-purple-300 text-purple-700 dark:text-purple-300' 
                  : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800/50 border-2 border-blue-300 text-blue-700 dark:text-blue-300'
              }`}
            >
              {key}
            </Button>
          );
        })}
      </div>

      {/* Fraction Section */}
      {showFractionBuilder ? (
        <div className="flex gap-2">
          {/* Switch Top/Bottom */}
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
          
          {/* Insert Fraction */}
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
            Done with Fraction ✓
          </Button>
          
          {/* Cancel */}
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              cancelFraction();
            }}
            disabled={disabled}
            className="h-14 px-4 text-base font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-2 border-gray-300 rounded-xl"
          >
            ✕
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          {/* Fraction Button */}
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
              <div className="flex flex-col items-center text-sm leading-tight">
                <span className="border-b-2 border-current px-2">a</span>
                <span className="px-2">b</span>
              </div>
              <span>Fraction</span>
            </div>
          </Button>
          
          {/* More Symbols */}
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              insertChar('(');
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
              insertChar(')');
            }}
            disabled={disabled}
            className="h-14 w-14 text-xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-2 border-gray-300 rounded-xl"
          >
            )
          </Button>
        </div>
      )}

      {/* Quick Fraction Shortcuts - Visual Fractions */}
      {!showFractionBuilder && (
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-3 border border-primary/10">
          <p className="text-sm font-medium text-muted-foreground mb-2">⚡ Tap to add quick fractions:</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {[
              { num: '1', den: '2', label: '½' },
              { num: '1', den: '3', label: '⅓' },
              { num: '1', den: '4', label: '¼' },
              { num: '2', den: '3', label: '⅔' },
              { num: '3', den: '4', label: '¾' },
            ].map((frac) => (
              <Button
                key={`${frac.num}/${frac.den}`}
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value + `(${frac.num})/(${frac.den})`);
                }}
                disabled={disabled}
                className="h-12 px-4 bg-white hover:bg-primary/10 dark:bg-slate-700 dark:hover:bg-slate-600 border-2 border-primary/20 rounded-xl transition-transform active:scale-95"
              >
                <Fraction numerator={frac.num} denominator={frac.den} />
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
                insertChar(sym.symbol);
              }}
              disabled={disabled}
              className="h-12 text-lg font-medium bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40 border border-indigo-200 dark:border-indigo-700 rounded-xl transition-transform active:scale-95"
            >
              {sym.label}
            </Button>
          ))}
        </div>
      )}

      {/* Submit Button - Big and Green */}
      <Button
        type="button"
        variant="default"
        onClick={(e) => {
          e.stopPropagation();
          onSubmit?.();
        }}
        disabled={disabled || !value.trim()}
        className="w-full h-16 text-xl font-bold bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl shadow-lg transition-transform active:scale-98"
      >
        <Check className="w-6 h-6 mr-2" />
        Submit My Answer 🎯
      </Button>
    </div>
  );
};
