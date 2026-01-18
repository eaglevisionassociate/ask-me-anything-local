import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useExercises, Exercise } from '@/hooks/useExercises';
import { useGenerateExercise } from '@/hooks/useGenerateExercise';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { Loader2, Brain, CheckCircle, XCircle, Eye, EyeOff, Plus, RotateCcw, Printer, Camera, Upload, Calculator, Pencil, Clock, RefreshCw } from 'lucide-react';
import { MathCalculatorKeyboard } from '@/components/MathCalculatorKeyboard';
import { KidDrawingPad } from '@/components/KidDrawingPad';
import { AlphabetKeyboard } from '@/components/AlphabetKeyboard';
import { InputMethodSelector, InputMethod } from '@/components/InputMethodSelector';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMathExpression } from '@/lib/fractionUtils';
import { Fraction, renderMathExpression } from '@/components/ui/fraction';
import { useToast } from "@/hooks/use-toast";
import Tesseract from 'tesseract.js';
import { usePuterAI } from '@/hooks/usePuterAI';

interface ExerciseListProps {
  lessonId?: string;
  topic?: string;
  subjectId?: string; // math, science, english, social
  onExerciseSelect?: (exercise: Exercise) => void;
}

export const ExerciseList = ({ lessonId, topic, subjectId = 'math', onExerciseSelect }: ExerciseListProps) => {
  const { exercises, loading, error, refetch } = useExercises(lessonId);
  const { generateExercise, isGenerating } = useGenerateExercise();
  const { completeExercise } = useActivityTracking();
  const { shouldRefresh, formattedTimeRemaining, markRefreshComplete, resetRefreshTimer } = useAutoRefresh();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generateResponse: generatePuterResponse, isPuterReady } = usePuterAI();
  
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [showAnswers, setShowAnswers] = useState<{ [key: string]: boolean }>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<{ [key: string]: boolean }>({});
  const [answerFeedback, setAnswerFeedback] = useState<{ [key: string]: { isCorrect: boolean; feedback: string; explanationSteps?: string[] } }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  const [uploadPreviews, setUploadPreviews] = useState<{ [key: string]: string }>({});
  const [isProcessingUpload, setIsProcessingUpload] = useState<{ [key: string]: boolean }>({});
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [activeInputMethod, setActiveInputMethod] = useState<{ [key: string]: InputMethod }>({});

  // Auto-refresh questions every 1.5 hours
  useEffect(() => {
    const handleAutoRefresh = async () => {
      if (shouldRefresh && !isAutoGenerating && !isGenerating) {
        setIsAutoGenerating(true);
        
        toast({
          title: "🔄 Time for new questions!",
          description: "Generating fresh practice problems for you...",
        });

        try {
          // Generate 3 new exercises
          await generateExercise({
            lessonId,
            topic: topic || 'mixed',
            difficulty: 'medium',
            count: 3
          });
          
          // Refetch to get the new exercises
          await refetch();
          
          // Clear previous answers and states for fresh start
          setUserAnswers({});
          setShowAnswers({});
          setSubmittedAnswers({});
          setAnswerFeedback({});
          setSelectedExercise(null);
          
          markRefreshComplete();
          
          toast({
            title: "✨ New questions ready!",
            description: "Fresh practice problems have been added. Keep learning!",
          });
        } catch (err) {
          console.error('Auto-refresh failed:', err);
          toast({
            title: "Refresh failed",
            description: "Could not generate new questions. Try again later.",
            variant: "destructive",
          });
        } finally {
          setIsAutoGenerating(false);
        }
      }
    };

    handleAutoRefresh();
  }, [shouldRefresh, isAutoGenerating, isGenerating, lessonId, topic, generateExercise, refetch, markRefreshComplete, toast]);

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

  const handleFileUpload = (exerciseId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please select an image or PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(prev => ({ ...prev, [exerciseId]: file }));
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreviews(prev => ({ ...prev, [exerciseId]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      // For PDF files, show a placeholder
      setUploadPreviews(prev => ({ ...prev, [exerciseId]: 'pdf-placeholder' }));
    }
  };

  const processUploadedWork = async (exerciseId: string) => {
    const file = uploadedFiles[exerciseId];
    if (!file) return;

    setIsProcessingUpload(prev => ({ ...prev, [exerciseId]: true }));
    
    try {
      let extractedText = "";
      
      if (file.type.startsWith('image/')) {
        const result = await Tesseract.recognize(file, 'eng', {
          logger: m => console.log(m)
        });
        extractedText = result.data.text;
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll use a placeholder text since PDF processing is more complex
        extractedText = "[PDF content would be processed here]";
        toast({
          title: "PDF Processing",
          description: "PDF processing requires additional setup. Please upload an image for now.",
          variant: "default",
        });
        return;
      }

      const exercise = exercises.find(e => e.id === exerciseId);
      if (!exercise) return;

      if (!extractedText || extractedText.trim().length < 2) {
        setAnswerFeedback(prev => ({
          ...prev,
          [exerciseId]: {
            isCorrect: false,
            feedback: "⚠️ Could not detect clear answer in the image. Please ensure the photo is clear and try again.",
            explanationSteps: ["No text could be extracted from the image"]
          }
        }));
        
        toast({
          title: "Upload Failed",
          description: "Please try with a clearer image",
          variant: "destructive",
        });
        
        return;
      }

      // Check if Puter AI is ready
      if (!isPuterReady()) {
        toast({
          title: "Puter AI Not Ready",
          description: "Please wait for Puter AI to load and try again.",
          variant: "destructive",
        });
        return;
      }

      // Use Puter AI to validate the answer
      const validationPrompt = `You are a helpful math tutor evaluating a student's answer. Compare the student's answer with the correct answer.

Be flexible in your evaluation:
- Accept mathematically equivalent answers (e.g., 1/2 = 0.5 = 50%)
- Ignore minor formatting differences
- Accept answers in different units if they're equivalent
- Consider partial credit for partially correct answers

Question: ${exercise.question}
Correct Answer: ${exercise.answer}
Student's Answer: ${extractedText}

Respond ONLY with valid JSON in this exact format:
{
  "isCorrect": true/false,
  "score": 0-100,
  "feedback": "brief encouraging feedback",
  "explanation": "why the answer is correct/incorrect"
}`;

      const aiResponse = await generatePuterResponse(validationPrompt);
      
      // Parse the AI response
      let validation;
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          validation = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse Puter AI response:', parseError);
        toast({
          title: "Validation Error",
          description: "Could not parse AI response. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setAnswerFeedback(prev => ({
        ...prev,
        [exerciseId]: {
          isCorrect: validation.isCorrect,
          feedback: validation.feedback || (validation.isCorrect ? "✅ Correct!" : "❌ Not quite right"),
          explanationSteps: [
            `📝 Extracted text: "${extractedText.substring(0, 200)}"`,
            `✓ Correct answer: "${exercise.answer}"`,
            `💡 ${validation.explanation || ''}`
          ]
        }
      }));

      setSubmittedAnswers(prev => ({ ...prev, [exerciseId]: true }));

      toast({
        title: validation.isCorrect ? "Correct! 🎉" : "Not Quite Right",
        description: validation.feedback,
      });

      await completeExercise(
        `${exercise.question.substring(0, 30)}...`,
        validation.score || (validation.isCorrect ? 100 : 0),
        'Mathematics'
      );
      
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process the uploaded file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingUpload(prev => ({ ...prev, [exerciseId]: false }));
    }
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
      topic: topic || 'mathematics',
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
    setUploadedFiles({});
    setUploadPreviews({});
    setIsProcessingUpload({});
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
      {/* Auto-refresh timer banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            New questions in: <strong>{formattedTimeRemaining}</strong>
          </span>
        </div>
        {(isAutoGenerating || isGenerating) && (
          <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Generating new questions...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Math Exercises</h3>
        <div className="flex items-center gap-2 flex-wrap">
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
            onClick={() => {
              handleGenerateExercise();
              resetRefreshTimer();
            }}
            disabled={isGenerating || isAutoGenerating}
            size="sm"
            className="gap-2"
          >
            {isGenerating || isAutoGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isGenerating || isAutoGenerating ? 'Generating...' : 'Add More'}
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
                
                {/* Photo/PDF Upload Option */}
                <div className="space-y-3 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">📸 Upload Your Work (Photo/PDF)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Did this exercise on paper? Take a photo or upload a PDF for automatic correction!
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    {uploadedFiles[exercise.id] && (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          processUploadedWork(exercise.id);
                        }}
                        disabled={isProcessingUpload[exercise.id]}
                        className="flex-1"
                      >
                        {isProcessingUpload[exercise.id] ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        {isProcessingUpload[exercise.id] ? "Processing..." : "Submit Work"}
                      </Button>
                    )}
                  </div>
                  
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      e.stopPropagation();
                      handleFileUpload(exercise.id, e);
                    }}
                    className="hidden"
                  />
                  
                  {uploadPreviews[exercise.id] && uploadPreviews[exercise.id] !== 'pdf-placeholder' && (
                    <div className="mt-3">
                      <img 
                        src={uploadPreviews[exercise.id]} 
                        alt="Uploaded work" 
                        className="max-w-full max-h-48 object-contain rounded-lg border mx-auto"
                      />
                    </div>
                  )}
                  
                  {uploadPreviews[exercise.id] === 'pdf-placeholder' && (
                    <div className="mt-3 p-4 border rounded-lg text-center">
                      <div className="text-sm font-medium">PDF File Selected</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {uploadedFiles[exercise.id]?.name}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Supported: JPG, PNG, PDF • Max size: 10MB
                  </div>
                </div>

                {/* Toggleable Input Method Selector */}
                <InputMethodSelector
                  activeMethod={activeInputMethod[exercise.id] || null}
                  onMethodChange={(method) => {
                    setActiveInputMethod(prev => ({ ...prev, [exercise.id]: method }));
                  }}
                  showCalculator={subjectId === 'math' || subjectId === 'science'}
                  showAlphabet={true}
                  showDrawing={true}
                />

                {/* Calculator Input - for Math and Science */}
                {activeInputMethod[exercise.id] === 'calculator' && (subjectId === 'math' || subjectId === 'science') && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="w-5 h-5 text-primary" />
                      <label className="text-sm font-semibold text-primary">
                        {subjectId === 'science' ? 'Science Calculator' : 'Math Calculator'}
                      </label>
                    </div>
                    <MathCalculatorKeyboard
                      value={userAnswers[exercise.id] || ''}
                      onChange={(value) => handleAnswerChange(exercise.id, value)}
                      onSubmit={() => handleSubmitAnswer(exercise.id)}
                      disabled={submittedAnswers[exercise.id]}
                    />
                  </div>
                )}

                {/* Alphabet Keyboard Input */}
                {activeInputMethod[exercise.id] === 'alphabet' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🔤</span>
                      <label className="text-sm font-semibold text-primary">
                        Type Your Answer
                      </label>
                    </div>
                    <AlphabetKeyboard
                      value={userAnswers[exercise.id] || ''}
                      onChange={(value) => handleAnswerChange(exercise.id, value)}
                      onSubmit={() => handleSubmitAnswer(exercise.id)}
                      disabled={submittedAnswers[exercise.id]}
                    />
                  </div>
                )}

                {/* Drawing Pad Input */}
                {activeInputMethod[exercise.id] === 'drawing' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <Pencil className="w-5 h-5 text-primary" />
                      <label className="text-sm font-semibold text-primary">
                        Draw Your Answer
                      </label>
                    </div>
                    <KidDrawingPad
                      subject={subjectId}
                      onSave={(dataURL) => {
                        handleAnswerChange(exercise.id, `[Drawing submitted]`);
                        setUploadPreviews(prev => ({ ...prev, [exercise.id]: dataURL }));
                        toast({
                          title: "Drawing Saved! 🎨",
                          description: "Your drawing has been saved. Click 'Submit Answer' to submit.",
                        });
                      }}
                    />
                  </div>
                )}

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
