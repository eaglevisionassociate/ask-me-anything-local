import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useExercises, Exercise } from '@/hooks/useExercises';
import { useGenerateExercise } from '@/hooks/useGenerateExercise';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { Loader2, Brain, CheckCircle, XCircle, Eye, EyeOff, Plus, RotateCcw, Printer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { renderMathExpression, formatMathExpression } from '@/components/ui/fraction';

interface ExerciseListProps {
  lessonId?: string;
  onExerciseSelect?: (exercise: Exercise) => void;
}

export const ExerciseList = ({ lessonId, onExerciseSelect }: ExerciseListProps) => {
  const { exercises, loading, error, refetch } = useExercises(lessonId);
  const { generateExercise, isGenerating } = useGenerateExercise();
  const { completeExercise } = useActivityTracking();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [showAnswers, setShowAnswers] = useState<{ [key: string]: boolean }>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<{ [key: string]: boolean }>({});
  const [answerFeedback, setAnswerFeedback] = useState<{ [key: string]: { isCorrect: boolean; feedback: string; explanationSteps?: string[] } }>({});

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(selectedExercise === exercise.id ? null : exercise.id);
    onExerciseSelect?.(exercise);
  };

  const handleAnswerChange = (exerciseId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [exerciseId]: answer
    }));
  };

  const handleSubmitAnswer = async (exerciseId: string) => {
    const userAnswer = userAnswers[exerciseId]?.trim();
    if (!userAnswer) return;

    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const normalizeAnswer = (answer: string) => 
      answer.trim().toLowerCase().replace(/\s+/g, '');

    const correctAnswer = normalizeAnswer(exercise.answer);
    const submittedAnswer = normalizeAnswer(userAnswer);

    const isCorrect = correctAnswer === submittedAnswer || 
                     correctAnswer.includes(submittedAnswer) ||
                     submittedAnswer.includes(correctAnswer);

    setSubmittedAnswers(prev => ({
      ...prev,
      [exerciseId]: true
    }));

    setAnswerFeedback(prev => ({
      ...prev,
      [exerciseId]: {
        isCorrect,
        feedback: isCorrect ? "🎉 Excellent work! You got it right!" : "❌ That's not quite right. Try again!",
        explanationSteps: []
      }
    }));

    const score = isCorrect ? 100 : 0;
    await completeExercise(
      `${exercise.question.substring(0, 30)}...`,
      score,
      'Mathematics'
    );

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
    if (newExercises) refetch();
  };

  const handleResetExercises = () => {
    setSelectedExercise(null);
    setUserAnswers({});
    setShowAnswers({});
    setSubmittedAnswers({});
    setAnswerFeedback({});
  };

  const handlePrintExercises = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `<!DOCTYPE html>
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
            </div>`).join('')}
        </body>
      </html>`;

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
          <Button onClick={handlePrintExercises} variant="outline" size="sm" className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button onClick={handleResetExercises} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={handleGenerateExercise} disabled={isGenerating} size="sm" className="gap-2">
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
          className={`cursor-pointer transition-all ${selectedExercise === exercise.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
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
                {renderMathExpression(formatMathExpression(exercise.question))}
              </div>
            </div>

            {selectedExercise === exercise.id && (
              <div className="space-y-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Answer Preview:</div>
                  <div className="min-h-16 p-3 border rounded-md bg-background font-mono text-lg flex items-center">
                    <div className="w-full">
                      {userAnswers[exercise.id]?.trim() ? (
                        renderMathExpression(formatMathExpression(userAnswers[exercise.id]))
                      ) : (
                        <span className="text-muted-foreground">Your answer will appear here...</span>
                      )}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Write your solution here (use a/b for fractions)..."
                    value={userAnswers[exercise.id] || ''}
                    onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                    className="min-h-20 font-mono"
                    data-exercise-id={exercise.id}
                  />
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
                        {answerFeedback[exercise.id].feedback}
                      </p>
                    </div>
                  </div>
                )}

                {showAnswers[exercise.id] && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Correct Answer:</h4>
                      <div className="text-lg whitespace-pre-wrap">
                        {renderMathExpression(formatMathExpression(exercise.answer))}
                      </div>
                    </div>
                    {exercise.explanation && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Explanation:</h4>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {renderMathExpression(formatMathExpression(exercise.explanation))}
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
