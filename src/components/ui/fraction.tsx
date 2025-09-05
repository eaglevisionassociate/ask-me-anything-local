import React from 'react';

interface FractionProps {
  numerator: string | number;
  denominator: string | number;
  className?: string;
}

export const Fraction: React.FC<FractionProps> = ({ numerator, denominator, className = '' }) => {
  return (
    <span className={`inline-flex flex-col items-center text-sm leading-none ${className}`}>
      <span className="border-b border-current px-1">{numerator}</span>
      <span className="px-1">{denominator}</span>
    </span>
  );
};

interface MathExpressionProps {
  children: React.ReactNode;
  className?: string;
}

export const MathExpression: React.FC<MathExpressionProps> = ({ children, className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {children}
    </span>
  );
};

// Parse and render mathematical expressions with proper fraction display
export const renderMathExpression = (text: string): React.ReactNode => {
  if (!text) return text;
  
  // First apply the existing formatting for Unicode symbols
  let processedText = text;
  
  // Handle LaTeX-style fractions \frac{num}{den}
  const fractionRegex = /\\frac\{([^}]+)\}\{([^}]+)\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = fractionRegex.exec(processedText)) !== null) {
    // Add text before the fraction
    if (match.index > lastIndex) {
      parts.push(processedText.slice(lastIndex, match.index));
    }
    
    // Add the fraction component
    parts.push(
      <Fraction 
        key={match.index} 
        numerator={match[1]} 
        denominator={match[2]} 
        className="mx-1"
      />
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < processedText.length) {
    parts.push(processedText.slice(lastIndex));
  }
  
  // If no fractions were found, return the original text
  if (parts.length === 0) {
    return processedText;
  }
  
  return <MathExpression>{parts}</MathExpression>;
};