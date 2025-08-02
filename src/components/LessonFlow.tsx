import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, BookOpen, Brain, CheckCircle, ArrowRight, Youtube } from 'lucide-react';
import { useLessons, Lesson } from '@/hooks/useLessons';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseList } from '@/components/ExerciseList';
import { ChatInterface } from '@/components/ChatInterface';
import { Skeleton } from '@/components/ui/skeleton';

interface LessonFlowProps {
  topic: string;
}

type FlowStep = 'lesson-list' | 'video' | 'exercises' | 'ai-help';

export const LessonFlow = ({ topic }: LessonFlowProps) => {
  const { lessons, loading } = useLessons(topic);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState<FlowStep>('lesson-list');
  const [completedSteps, setCompletedSteps] = useState<FlowStep[]>([]);

  const { exercises } = useExercises(selectedLesson?.id);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentStep('video');
    setCompletedSteps([]);
  };

  const handleStepComplete = (step: FlowStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const getStepProgress = () => {
    const totalSteps = 3; // video, exercises, ai-help
    return (completedSteps.length / totalSteps) * 100;
  };

  const openYouTubeVideo = (url: string) => {
    window.open(url, '_blank');
    handleStepComplete('video');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (currentStep === 'lesson-list') {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Mathematics Lessons</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Choose a lesson to start your learning journey: Watch → Practice → Get Help
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">{lesson.title}</CardTitle>
                  <Badge variant="outline" className="text-xs">{lesson.topic}</Badge>
                </div>
                <CardDescription className="text-xs md:text-sm">{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    {lesson.youtube_url && (
                      <div className="flex items-center gap-1">
                        <Youtube className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Video</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Exercises</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">AI Help</span>
                    </div>
                  </div>
                  <Button onClick={() => handleLessonSelect(lesson)} size="sm" className="w-full sm:w-auto">
                    <span className="text-xs md:text-sm">Start Learning</span>
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedLesson) return null;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Lesson Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg md:text-xl">{selectedLesson.title}</CardTitle>
              <CardDescription className="text-xs md:text-sm">{selectedLesson.description}</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setCurrentStep('lesson-list')} size="sm" className="w-full sm:w-auto">
              ← Back to Lessons
            </Button>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(getStepProgress())}%</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Steps */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-3 md:p-4 bg-muted rounded-lg">
        <Button
          variant={currentStep === 'video' ? 'default' : completedSteps.includes('video') ? 'outline' : 'ghost'}
          onClick={() => setCurrentStep('video')}
          className="gap-1 md:gap-2 w-full sm:w-auto"
          size="sm"
        >
          {completedSteps.includes('video') ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> : <Play className="w-3 h-3 md:w-4 md:h-4" />}
          <span className="text-xs md:text-sm">1. Watch Video</span>
        </Button>
        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground hidden sm:block rotate-90 sm:rotate-0" />
        <Button
          variant={currentStep === 'exercises' ? 'default' : completedSteps.includes('exercises') ? 'outline' : 'ghost'}
          onClick={() => setCurrentStep('exercises')}
          className="gap-1 md:gap-2 w-full sm:w-auto"
          size="sm"
        >
          {completedSteps.includes('exercises') ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> : <BookOpen className="w-3 h-3 md:w-4 md:h-4" />}
          <span className="text-xs md:text-sm">2. Practice</span>
        </Button>
        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground hidden sm:block rotate-90 sm:rotate-0" />
        <Button
          variant={currentStep === 'ai-help' ? 'default' : 'ghost'}
          onClick={() => setCurrentStep('ai-help')}
          className="gap-1 md:gap-2 w-full sm:w-auto"
          size="sm"
        >
          <Brain className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm">3. Get Help</span>
        </Button>
      </div>

      {/* Step Content */}
      {currentStep === 'video' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Tutorial Video
            </CardTitle>
            <CardDescription>
              Learn the concepts before practicing with exercises
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedLesson.youtube_url ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Tutorial Video</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click below to watch the tutorial on YouTube. After watching, you can proceed to practice exercises.
                  </p>
                  <Button onClick={() => openYouTubeVideo(selectedLesson.youtube_url!)} className="gap-2">
                    <Youtube className="w-4 h-4" />
                    Open in YouTube
                  </Button>
                </div>
                
                {completedSteps.includes('video') && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Video completed! Ready for exercises.</span>
                    <Button size="sm" onClick={() => setCurrentStep('exercises')}>
                      Start Exercises →
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Youtube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No video available for this lesson yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    handleStepComplete('video');
                    setCurrentStep('exercises');
                  }}
                >
                  Skip to Exercises
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'exercises' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Practice Exercises
            </CardTitle>
            <CardDescription>
              Apply what you learned with these practice problems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExerciseList lessonId={selectedLesson.id} />
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  📚 Need help with any exercise? Use the AI Tutor to get detailed explanations and corrections!
                </p>
                <Button size="sm" onClick={() => setCurrentStep('ai-help')} variant="outline">
                  Get AI Help →
                </Button>
              </div>
              
              <div className="flex items-center justify-center">
                <Button 
                  onClick={() => {
                    handleStepComplete('exercises');
                    setCurrentStep('ai-help');
                  }}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Exercises Complete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'ai-help' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Tutor Help
            </CardTitle>
            <CardDescription>
              Get detailed corrections and explanations for your work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] md:h-[600px]">
              <ChatInterface 
                tutorContext={{
                  id: 'math',
                  name: 'Mathematics',
                  topics: [selectedLesson.topic]
                }}
                lessonContext={selectedLesson}
                exercises={exercises}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};