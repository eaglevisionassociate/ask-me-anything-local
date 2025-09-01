// Utility functions for converting fraction notation to proper mathematical display

// Common fraction mappings
const fractionMap: { [key: string]: string } = {
  '1/2': '½',
  '1/3': '⅓',
  '2/3': '⅔',
  '1/4': '¼',
  '3/4': '¾',
  '1/5': '⅕',
  '2/5': '⅖',
  '3/5': '⅗',
  '4/5': '⅘',
  '1/6': '⅙',
  '5/6': '⅚',
  '1/7': '⅐',
  '1/8': '⅛',
  '3/8': '⅜',
  '5/8': '⅝',
  '7/8': '⅞',
  '1/9': '⅑',
  '1/10': '⅒',
};

// Unicode superscript digits
const superscriptMap: { [key: string]: string } = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
};

// Unicode subscript digits
const subscriptMap: { [key: string]: string } = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
};

/**
 * Converts a number to superscript
 */
function toSuperscript(num: string): string {
  return num.split('').map(digit => superscriptMap[digit] || digit).join('');
}

/**
 * Converts a number to subscript
 */
function toSubscript(num: string): string {
  return num.split('').map(digit => subscriptMap[digit] || digit).join('');
}

/**
 * Converts fraction notation like "a/b" to proper mathematical fractions
 * Uses Unicode fraction symbols when available, otherwise superscript/subscript
 */
export function formatFractions(text: string): string {
  if (!text) return text;

  // First, handle common fractions with direct Unicode symbols
  let result = text;
  
  // Replace common fractions
  Object.entries(fractionMap).forEach(([fraction, symbol]) => {
    const regex = new RegExp(`\\b${fraction.replace('/', '/')}\\b`, 'g');
    result = result.replace(regex, symbol);
  });

  // Handle remaining fractions with pattern like "number/number"
  // This regex matches fractions that aren't already converted
  const fractionRegex = /\b(\d+)\/(\d+)\b/g;
  result = result.replace(fractionRegex, (match, numerator, denominator) => {
    // Check if this fraction was already converted by the direct mapping
    if (fractionMap[match]) {
      return fractionMap[match];
    }
    
    // For other fractions, use superscript/subscript notation
    return `${toSuperscript(numerator)}⁄${toSubscript(denominator)}`;
  });

  // Handle mixed numbers like "2 1/2" -> "2½"
  const mixedNumberRegex = /\b(\d+)\s+([¹²³⁴⁵⁶⁷⁸⁹⁰]+)([⁄])([₀₁₂₃₄₅₆₇₈₉]+)\b/g;
  result = result.replace(mixedNumberRegex, '$1$2$3$4');

  // Also handle mixed numbers that weren't converted yet
  const mixedNumberSimpleRegex = /\b(\d+)\s+(\d+)\/(\d+)\b/g;
  result = result.replace(mixedNumberSimpleRegex, (match, whole, num, den) => {
    const fractionPart = `${num}/${den}`;
    const properFraction = fractionMap[fractionPart] || `${toSuperscript(num)}⁄${toSubscript(den)}`;
    return `${whole}${properFraction}`;
  });

  return result;
}

/**
 * Formats mathematical expressions by converting fractions and other notations
 */
export function formatMathExpression(text: string): string {
  if (!text) return text;
  
  let result = formatFractions(text);
  
  // Additional mathematical formatting can be added here
  // For example, converting ** to superscript for powers
  result = result.replace(/\*\*(\d+)/g, (match, power) => toSuperscript(power));
  
  // Convert sqrt() notation to √ symbol
  result = result.replace(/sqrt\(([^)]+)\)/g, '√($1)');
  
  return result;
}