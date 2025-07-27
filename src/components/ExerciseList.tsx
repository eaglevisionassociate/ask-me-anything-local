import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useExercises, Exercise } from '@/hooks/useExercises';
import { useGenerateExercise } from '@/hooks/useGenerateExercise';
import { Loader2, Brain, CheckCircle, XCircle, Eye, EyeOff, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ExerciseListProps {
  lessonId?: string;
  onExerciseSelect?: (exercise: Exercise) => void;
}

export const ExerciseList = ({ lessonId, onExerciseSelect }: ExerciseListProps) => {
  const { exercises, loading, error, refetch } = useExercises(lessonId);
  const { generateExercise, isGenerating } = useGenerateExercise();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [showAnswers, setShowAnswers] = useState<{ [key: string]: boolean }>({});

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
              <p className="text-foreground whitespace-pre-wrap">{exercise.question}</p>
            </div>

            {selectedExercise === exercise.id && (
              <div className="space-y-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Answer:</label>
                  <Textarea
                    placeholder="Write your solution here..."
                    value={userAnswers[exercise.id] || ''}
                    onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                    className="min-h-20"
                  />
                </div>

                <div className="flex items-center gap-2">
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
                </div>

                {showAnswers[exercise.id] && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Correct Answer:</h4>
                      <p className="text-sm whitespace-pre-wrap">{exercise.answer}</p>
                    </div>
                    
                    {exercise.explanation && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Explanation:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {exercise.explanation}
                        </p>
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