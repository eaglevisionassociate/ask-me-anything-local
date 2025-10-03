import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useExercises, Exercise } from '@/hooks/useExercises';
import { useGenerateExercise } from '@/hooks/useGenerateExercise';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { Loader2, Brain, CheckCircle, XCircle, Eye, EyeOff, Plus, RotateCcw, Printer, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMathExpression } from '@/lib/fractionUtils';
import { Fraction, renderMathExpression } from '@/components/ui/fraction';
import { DrawingPad } from "./DrawingPad";

interface ExerciseListProps {
  lessonId?: string;
  topic?: string;
  onExerciseSelect?: (exercise: Exercise) => void;
}

export const ExerciseList = ({ lessonId, topic, onExerciseSelect }: ExerciseListProps) => {
  const { exercises, loading, error, refetch } = useExercises(lessonId);
  const { generateExercise, isGenerating } = useGenerateExercise();
  const { completeExercise } = useActivityTracking();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [showAnswers, setShowAnswers] = useState<{ [key: string]: boolean }>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<{ [key: string]: boolean }>({});
  const [answerFeedback, setAnswerFeedback] = useState<{ [key: string]: { isCorrect: boolean; feedback: string; explanationSteps?: string[] } }>({});
  const [fractionInput, setFractionInput] = useState<{ [key: string]: { numerator: string; denominator: string; isEditing: boolean } }>({});
  const [showDrawing, setShowDrawing] = useState<{ [key: string]: boolean }>({});

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(selectedExercise === exercise.id ? null : exercise.id);
    onExerciseSelect?.(exercise);
    
    // Initialize fraction input state for this exercise
    if (!fractionInput[exercise.id]) {
      setFractionInput(prev => ({
        ...prev,
        [exercise.id]: { numerator: '', denominator: '', isEditing: false }
      }));
    }
    
    // Auto-show drawing pad for geometry exercises
    if (isGeometryExercise(exercise.question) && !showDrawing[exercise.id]) {
      setShowDrawing(prev => ({
        ...prev,
        [exercise.id]: true
      }));
    }
  };

  const handleAnswerChange = (exerciseId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [exerciseId]: answer
    }));
  };

  const handleFractionInput = (exerciseId: string, field: 'numerator' | 'denominator', value: string) => {
    setFractionInput(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };

  const handleInsertFraction = (exerciseId: string, operator?: string) => {
    const fraction = fractionInput[exerciseId];
    if (!fraction.numerator || !fraction.denominator) return;

    // Use a user-friendly fraction format instead of LaTeX
    const fractionText = `(${fraction.numerator})/(${fraction.denominator})`;
    
    // Add the fraction to the current answer with optional operator
    const currentAnswer = userAnswers[exerciseId] || '';
    const newAnswer = operator ? currentAnswer + ` ${operator} ${fractionText}` : currentAnswer + fractionText;
    
    handleAnswerChange(exerciseId, newAnswer);
    
    // Reset fraction input
    setFractionInput(prev => ({
      ...prev,
      [exerciseId]: { numerator: '', denominator: '', isEditing: false }
    }));
  };

  const toggleFractionEditor = (exerciseId: string) => {
    setFractionInput(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        isEditing: !prev[exerciseId]?.isEditing
      }
    }));
  };

  const insertCommonFraction = (exerciseId: string, fraction: string) => {
    const currentAnswer = userAnswers[exerciseId] || '';
    const newAnswer = currentAnswer + fraction;
    handleAnswerChange(exerciseId, newAnswer);
  };

  const insertOperator = (exerciseId: string, operator: string) => {
    const currentAnswer = userAnswers[exerciseId] || '';
    const newAnswer = currentAnswer + ` ${operator} `;
    handleAnswerChange(exerciseId, newAnswer);
  };

  const isGeometryExercise = (question: string): boolean => {
    const geometryKeywords = [
      'draw', 'sketch', 'construct', 'diagram', 'angle', 'triangle', 
      'rectangle', 'circle', 'square', 'polygon', 'line', 'point',
      'perpendicular', 'parallel', 'bisector', 'median', 'altitude'
    ];
    return geometryKeywords.some(keyword => 
      question.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleDrawingSave = (exerciseId: string, dataURL: string) => {
    // Here you could save the drawing or analyze it
    // For now, just show a success message
    setAnswerFeedback(prev => ({
      ...prev,
      [exerciseId]: {
        isCorrect: true,
        feedback: "Drawing saved! Great work on your geometric construction."
      }
    }));
  };

  const handleSubmitAnswer = async (exerciseId: string) => {
    const userAnswer = userAnswers[exerciseId]?.trim();
    if (!userAnswer) return;

    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    // Enhanced answer checking with flexible mathematical equivalence
    const normalizeAnswer = (answer: string) => {
      let normalized = answer.trim().toLowerCase();
      
      // Remove common conjunctions and punctuation
      normalized = normalized.replace(/\b(and|or|&)\b/g, ',');
      
      // Clean up multiple commas and spaces
      normalized = normalized.replace(/[,\s]+/g, ',');
      normalized = normalized.replace(/^,|,$/g, ''); // Remove leading/trailing commas
      
      // For comma-separated lists, sort the items to ignore order
      if (normalized.includes(',')) {
        const items = normalized.split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0)
          .sort();
        return items.join(',');
      }
      
      // For single words/phrases, just remove all spaces
      return normalized.replace(/\s+/g, '');
    };
    
    // Convert fractions to decimals for comparison
    const evaluateMathExpression = (expression: string): number | null => {
      try {
        // Handle fractions like (3)/(4) or 3/4
        const fractionMatch = expression.match(/\(?(\d+)\)?\s*\/\s*\(?(\d+)\)?/);
        if (fractionMatch) {
          const numerator = parseFloat(fractionMatch[1]);
          const denominator = parseFloat(fractionMatch[2]);
          return denominator !== 0 ? numerator / denominator : null;
        }
        
        // Handle decimals and whole numbers
        const number = parseFloat(expression);
        return isNaN(number) ? null : number;
      } catch {
        return null;
      }
    };
    
    const correctAnswer = normalizeAnswer(exercise.answer);
    const submittedAnswer = normalizeAnswer(userAnswer);
    
    // Check for exact text match first
    let isCorrect = correctAnswer === submittedAnswer;
    
    // If not exact match, try mathematical equivalence
    if (!isCorrect) {
      const correctValue = evaluateMathExpression(correctAnswer);
      const submittedValue = evaluateMathExpression(submittedAnswer);
      
      if (correctValue !== null && submittedValue !== null) {
        // Check if values are approximately equal (handle floating point precision)
        isCorrect = Math.abs(correctValue - submittedValue) < 0.0001;
      } else {
        // Fall back to substring matching for non-numeric answers
        isCorrect = correctAnswer.includes(submittedAnswer) || submittedAnswer.includes(correctAnswer);
      }
    }
    
    // Generate step-by-step explanation
    const generateExplanation = (original: string, normalized: string, isUserAnswer: boolean) => {
      const steps = [];
      const label = isUserAnswer ? "Your answer" : "Correct answer";
      
      steps.push(`📝 ${label}: "${original}"`);
      
      if (original !== original.trim()) {
        steps.push(`🧹 Remove extra spaces: "${original.trim()}"`);
      }
      
      if (original.trim() !== original.trim().toLowerCase()) {
        steps.push(`🔤 Convert to lowercase: "${original.trim().toLowerCase()}"`);
      }
      
      if (original.trim().toLowerCase() !== normalized) {
        steps.push(`📐 Remove all spaces: "${normalized}"`);
      }
      
      // Show mathematical evaluation if possible
      const mathValue = evaluateMathExpression(normalized);
      if (mathValue !== null) {
        steps.push(`🔢 Mathematical value: ${mathValue}`);
      }
      
      return steps;
    };

    // Generate detailed feedback with explanations
    let feedback = "";
    let explanationSteps = [];
    
    if (isCorrect) {
      feedback = "🎉 Excellent work! You got it right!";
    } else {
      feedback = "Let me show you how I process answers:";
      explanationSteps = [
        ...generateExplanation(userAnswer, submittedAnswer, true),
        "",
        ...generateExplanation(exercise.answer, correctAnswer, false),
        "",
        "🔍 Comparison result:",
        `   Your processed answer: "${submittedAnswer}"`,
        `   Correct processed answer: "${correctAnswer}"`,
        `   Match: ${correctAnswer === submittedAnswer ? "✅ Yes" : "❌ No"}`,
        "",
        "💡 Tip: Answers are checked ignoring spaces and letter case!"
      ];
    }

    setSubmittedAnswers(prev => ({
      ...prev,
      [exerciseId]: true
    }));

    setAnswerFeedback(prev => ({
      ...prev,
      [exerciseId]: {
        isCorrect,
        feedback,
        explanationSteps
      }
    }));

    // Track the exercise completion
    const score = isCorrect ? 100 : 0;
    await completeExercise(
      `${exercise.question.substring(0, 30)}...`,
      score,
      'Mathematics'
    );

    // Auto-show answer after submission
    setShowAnswers(prev => ({
      ...prev,
      [exerciseId]: true
    }));
  };

  const toggleShowAnswer = (exerciseId: string) => {
    setShowAnswers(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const handleGenerateExercise = async () => {
    const newExercises = await generateExercise({
      lessonId,
      topic: 'mathematics',
      difficulty: 'medium',
      count: 2,
    });
    
    if (newExercises) {
      refetch();
    }
  };

  const handleResetExercises = () => {
    setSelectedExercise(null);
    setUserAnswers({});
    setShowAnswers({});
    setSubmittedAnswers({});
    setAnswerFeedback({});
    setFractionInput({});
    setShowDrawing({});
  };

  const handlePrintExercises = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Math Exercises - Print</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .exercise { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            .question { font-weight: bold; margin-bottom: 10px; }
            .answer-space { border-bottom: 1px solid #999; min-height: 60px; margin: 15px 0; }
            .difficulty { background: #f0f0f0; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Math Exercises</h1>
            <p>Total Problems: ${exercises.length}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          ${exercises.map((exercise, index) => `
            <div class="exercise">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3>Problem ${index + 1}</h3>
                ${exercise.difficulty ? `<span class="difficulty">${exercise.difficulty}</span>` : ''}
              </div>
              <div class="question">${formatMathExpression(exercise.question)}</div>
              <div class="answer-space">
                <strong>Answer:</strong>
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <XCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
            <p>Failed to load exercises: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card>
      <CardContent className="pt-6">
        <div className="text-center text-muted-foreground">
          <Brain className="w-8 h-8 mx-auto mb-2" />
          <p>No exercises available yet.</p>
          <p className="text-sm">Ask the AI tutor to create some practice problems!</p>
        </div>
      </CardContent>
    </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Math Exercises</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{exercises.length} problems</Badge>
          <Button
            onClick={handlePrintExercises}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            onClick={handleResetExercises}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={handleGenerateExercise}
            disabled={isGenerating}
            size="sm"
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Add More'}
          </Button>
        </div>
      </div>

      {exercises.map((exercise, index) => (
        <Card 
          key={exercise.id} 
          className={`cursor-pointer transition-all ${
            selectedExercise === exercise.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
          }`}
          onClick={() => handleExerciseClick(exercise)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Problem {index + 1}</CardTitle>
              <div className="flex items-center gap-2">
                {exercise.difficulty && (
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
                <div className="text-foreground whitespace-pre-wrap text-lg">
                {topic?.toLowerCase().includes('science') 
                  ? exercise.question 
                  : renderMathExpression(exercise.question)}
              </div>
            </div>

            {selectedExercise === exercise.id && (
              <div className="space-y-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
                
                {/* Drawing Pad for Geometry Exercises */}
                {isGeometryExercise(exercise.question) && (
                  <div className="space-y-3 bg-primary/5 p-4 rounded-lg border-2 border-primary/20">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-primary" />
                        <span className="text-sm font-semibold text-primary">✏️ Use Drawing Pad Below</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDrawing(prev => ({ 
                          ...prev, 
                          [exercise.id]: !prev[exercise.id] 
                        }))}
                      >
                        {showDrawing[exercise.id] ? "Hide Drawing" : "Show Drawing"}
                      </Button>
                    </div>
                    
                    {showDrawing[exercise.id] && (
                      <div className="w-full">
                        <DrawingPad 
                          height={300}
                          onSave={(dataURL) => handleDrawingSave(exercise.id, dataURL)} 
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Answer:</label>
                  <div className="space-y-2">
                     {/* Simple Fraction Input */}
                     <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                        <div className="text-sm font-medium">Build Fraction:</div>
                        <div className="grid grid-cols-3 gap-2 items-end">
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Numerator</label>
                            <input
                              type="text"
                              value={fractionInput[exercise.id]?.numerator || ''}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleFractionInput(exercise.id, 'numerator', e.target.value);
                              }}
                              className="w-full px-2 py-1 text-sm border rounded text-center bg-background"
                              placeholder="Top"
                            />
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-light text-muted-foreground">/</div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Denominator</label>
                            <input
                              type="text"
                              value={fractionInput[exercise.id]?.denominator || ''}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleFractionInput(exercise.id, 'denominator', e.target.value);
                              }}
                              className="w-full px-2 py-1 text-sm border rounded text-center bg-background"
                              placeholder="Bottom"
                            />
                          </div>
                        </div>
                        {fractionInput[exercise.id]?.numerator && fractionInput[exercise.id]?.denominator && (
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">Preview:</div>
                            <Fraction 
                              numerator={fractionInput[exercise.id].numerator} 
                              denominator={fractionInput[exercise.id].denominator}
                              className="text-lg"
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-4 gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertFraction(exercise.id);
                            }}
                            disabled={!fractionInput[exercise.id]?.numerator || !fractionInput[exercise.id]?.denominator}
                            className="col-span-4"
                          >
                            Add Fraction
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertFraction(exercise.id, '+');
                            }}
                            disabled={!fractionInput[exercise.id]?.numerator || !fractionInput[exercise.id]?.denominator}
                          >
                            + Fraction
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertFraction(exercise.id, '-');
                            }}
                            disabled={!fractionInput[exercise.id]?.numerator || !fractionInput[exercise.id]?.denominator}
                          >
                            - Fraction
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertFraction(exercise.id, '×');
                            }}
                            disabled={!fractionInput[exercise.id]?.numerator || !fractionInput[exercise.id]?.denominator}
                          >
                            × Fraction
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertFraction(exercise.id, '÷');
                            }}
                            disabled={!fractionInput[exercise.id]?.numerator || !fractionInput[exercise.id]?.denominator}
                          >
                            ÷ Fraction
                          </Button>
                        </div>
                      </div>
                     
                     {/* Math Operators */}
                     <div className="p-3 bg-muted/50 rounded-lg">
                       <div className="text-sm font-medium mb-2">Math Operators:</div>
                       <div className="grid grid-cols-4 gap-2">
                         <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           onClick={(e) => {
                             e.stopPropagation();
                             insertOperator(exercise.id, '+');
                           }}
                         >
                           +
                         </Button>
                         <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           onClick={(e) => {
                             e.stopPropagation();
                             insertOperator(exercise.id, '-');
                           }}
                         >
                           -
                         </Button>
                         <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           onClick={(e) => {
                             e.stopPropagation();
                             insertOperator(exercise.id, '×');
                           }}
                         >
                           ×
                         </Button>
                         <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           onClick={(e) => {
                             e.stopPropagation();
                             insertOperator(exercise.id, '÷');
                           }}
                         >
                           ÷
                         </Button>
                         <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           onClick={(e) => {
                             e.stopPropagation();
                             insertOperator(exercise.id, '=');
                           }}
                         >
                           =
                         </Button>
                         <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           onClick={(e) => {
                             e.stopPropagation();
                             insertOperator(exercise.id, '<');
                           }}
                         >
                           &lt;
                         </Button>
                         <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           onClick={(e) => {
                             e.stopPropagation();
                             insertOperator(exercise.id, '>');
                           }}
                         >
                           &gt;
                         </Button>
                         <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           onClick={(e) => {
                             e.stopPropagation();
                             insertOperator(exercise.id, '√');
                           }}
                         >
                           √
                         </Button>
                       </div>
                     </div>
                     
                     {/* Combined Answer Input */}
                     <div className="space-y-2">
                       <div className="text-sm font-medium">Write your solution here:</div>
                        <div className="min-h-16 p-3 border rounded-md bg-background font-mono text-lg flex items-center">
                          {userAnswers[exercise.id] ? (
                            <div className="w-full">
                              {topic?.toLowerCase().includes('science') 
                                ? userAnswers[exercise.id] 
                                : renderMathExpression(userAnswers[exercise.id])}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Your answer will appear here as you type or use the tools above...</span>
                          )}
                        </div>
                       <Textarea
                         placeholder="Type your answer here or use the fraction tools and operators above..."
                         value={userAnswers[exercise.id] || ''}
                         onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                         className="min-h-20 font-mono"
                         data-exercise-id={exercise.id}
                       />
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!submittedAnswers[exercise.id] ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmitAnswer(exercise.id);
                      }}
                      disabled={!userAnswers[exercise.id]?.trim()}
                      size="sm"
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Submit Answer
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleShowAnswer(exercise.id);
                      }}
                      className="gap-2"
                    >
                      {showAnswers[exercise.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showAnswers[exercise.id] ? 'Hide Answer' : 'Show Answer'}
                    </Button>
                  )}
                </div>

                {answerFeedback[exercise.id] && (
                  <div className={`p-3 rounded-lg border ${
                    answerFeedback[exercise.id].isCorrect 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      {answerFeedback[exercise.id].isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <p className="text-sm font-medium">
                        {answerFeedback[exercise.id].isCorrect 
                          ? "🎉 Excellent work! You got it right!" 
                          : answerFeedback[exercise.id].feedback}
                      </p>
                     </div>
                     
                     {answerFeedback[exercise.id].explanationSteps && (
                       <div className="mt-3 p-3 bg-gray-50 border rounded-lg">
                         <h4 className="font-medium text-sm mb-2">📖 Step-by-step answer processing:</h4>
                         <div className="space-y-1 text-xs font-mono">
                           {answerFeedback[exercise.id].explanationSteps.map((step, index) => (
                             <div key={index} className={step === "" ? "h-2" : ""}>
                               {step && <p>{step}</p>}
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 )}

                {showAnswers[exercise.id] && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                     <div>
                        <h4 className="font-medium text-sm mb-1">Correct Answer:</h4>
                        <div className="text-lg whitespace-pre-wrap">
                          {topic?.toLowerCase().includes('science') 
                            ? exercise.answer 
                            : (renderMathExpression(exercise.answer) || formatMathExpression(exercise.answer))}
                        </div>
                     </div>
                     
                     {exercise.explanation && (
                       <div>
                          <h4 className="font-medium text-sm mb-1">Explanation:</h4>
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {topic?.toLowerCase().includes('science') 
                              ? exercise.explanation 
                              : (renderMathExpression(exercise.explanation) || formatMathExpression(exercise.explanation))}
                          </div>
                       </div>
                     )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};