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
  
  const processedText = text;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Create a combined regex to find all fraction patterns
  const allFractions = [];
  
  // Find LaTeX fractions
  const latexFractionRegex = /\\frac\{([^}]+)\}\{([^}]+)\}/g;
  let match;
  while ((match = latexFractionRegex.exec(processedText)) !== null) {
    allFractions.push({
      index: match.index,
      length: match[0].length,
      numerator: match[1],
      denominator: match[2],
      type: 'latex'
    });
  }
  
  // Find user-friendly fractions
  const userFractionRegex = /\(([^)]+)\)\/\(([^)]+)\)/g;
  while ((match = userFractionRegex.exec(processedText)) !== null) {
    allFractions.push({
      index: match.index,
      length: match[0].length,
      numerator: match[1],
      denominator: match[2],
      type: 'user'
    });
  }
  
  // Sort fractions by index
  allFractions.sort((a, b) => a.index - b.index);
  
  // Build the result with fraction components
  for (let i = 0; i < allFractions.length; i++) {
    const fraction = allFractions[i];
    
    // Add text before the fraction
    if (fraction.index > lastIndex) {
      parts.push(processedText.slice(lastIndex, fraction.index));
    }
    
    // Add the fraction component
    parts.push(
      <Fraction 
        key={`${fraction.type}-${fraction.index}`} 
        numerator={fraction.numerator} 
        denominator={fraction.denominator} 
        className="mx-1"
      />
    );
    
    lastIndex = fraction.index + fraction.length;
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