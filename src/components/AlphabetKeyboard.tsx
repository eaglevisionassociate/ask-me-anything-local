import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Delete, Space, CornerDownLeft } from 'lucide-react';

interface AlphabetKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const AlphabetKeyboard: React.FC<AlphabetKeyboardProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false
}) => {
  const [isUpperCase, setIsUpperCase] = React.useState(false);

  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const punctuation = ['.', ',', '!', '?', "'", '-', '(', ')'];

  const handleKeyPress = (key: string) => {
    if (disabled) return;
    const char = isUpperCase ? key : key.toLowerCase();
    onChange(value + char);
  };

  const handleBackspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const handleSpace = () => {
    if (disabled) return;
    onChange(value + ' ');
  };

  const handleEnter = () => {
    if (disabled) return;
    onChange(value + '\n');
  };

  return (
    <div className="bg-card rounded-xl border-2 border-border shadow-lg p-3 space-y-3">
      {/* Display */}
      <div className="bg-muted/50 rounded-lg p-3 min-h-[80px] border border-border">
        <div className="text-sm text-muted-foreground mb-1">Your Answer:</div>
        <div className="text-lg font-medium text-foreground whitespace-pre-wrap break-words">
          {value || <span className="text-muted-foreground italic">Start typing...</span>}
        </div>
      </div>

      {/* Number row */}
      <div className="flex justify-center gap-1">
        {numbers.map((num) => (
          <Button
            key={num}
            variant="outline"
            size="sm"
            onClick={() => onChange(value + num)}
            disabled={disabled}
            className="w-8 h-10 text-lg font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          >
            {num}
          </Button>
        ))}
      </div>

      {/* Letter rows */}
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1">
          {rowIndex === 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUpperCase(!isUpperCase)}
              className={`w-12 h-10 text-xs font-bold ${isUpperCase ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              disabled={disabled}
            >
              {isUpperCase ? 'ABC' : 'abc'}
            </Button>
          )}
          {row.map((letter) => (
            <Button
              key={letter}
              variant="outline"
              size="sm"
              onClick={() => handleKeyPress(letter)}
              disabled={disabled}
              className="w-8 h-10 text-lg font-bold bg-card hover:bg-muted text-card-foreground"
            >
              {isUpperCase ? letter : letter.toLowerCase()}
            </Button>
          ))}
          {rowIndex === 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackspace}
              className="w-12 h-10 bg-destructive/10 hover:bg-destructive/20 text-destructive"
              disabled={disabled}
            >
              <Delete className="w-5 h-5" />
            </Button>
          )}
        </div>
      ))}

      {/* Punctuation row */}
      <div className="flex justify-center gap-1">
        {punctuation.map((char) => (
          <Button
            key={char}
            variant="outline"
            size="sm"
            onClick={() => onChange(value + char)}
            disabled={disabled}
            className="w-8 h-10 text-lg font-bold bg-muted hover:bg-muted/80 text-muted-foreground"
          >
            {char}
          </Button>
        ))}
      </div>

      {/* Bottom row - space and enter */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEnter}
          className="w-16 h-10 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          disabled={disabled}
        >
          <CornerDownLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSpace}
          className="flex-1 max-w-[200px] h-10 bg-card hover:bg-muted text-card-foreground"
          disabled={disabled}
        >
          <Space className="w-4 h-4 mr-2" />
          Space
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="w-20 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
        >
          Done ✓
        </Button>
      </div>
    </div>
  );
};
