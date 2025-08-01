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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Mathematics Lessons</h2>
          <p className="text-muted-foreground">
            Choose a lesson to start your learning journey: Watch → Practice → Get Help
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{lesson.title}</CardTitle>
                  <Badge variant="outline">{lesson.topic}</Badge>
                </div>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {lesson.youtube_url && (
                      <div className="flex items-center gap-1">
                        <Youtube className="w-4 h-4" />
                        <span>Video</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>Exercises</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="w-4 h-4" />
                      <span>AI Help</span>
                    </div>
                  </div>
                  <Button onClick={() => handleLessonSelect(lesson)}>
                    Start Learning
                    <ArrowRight className="w-4 h-4 ml-2" />
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
    <div className="space-y-6">
      {/* Lesson Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{selectedLesson.title}</CardTitle>
              <CardDescription>{selectedLesson.description}</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setCurrentStep('lesson-list')}>
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
      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        <Button
          variant={currentStep === 'video' ? 'default' : completedSteps.includes('video') ? 'outline' : 'ghost'}
          onClick={() => setCurrentStep('video')}
          className="gap-2"
        >
          {completedSteps.includes('video') ? <CheckCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          1. Watch Video
        </Button>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <Button
          variant={currentStep === 'exercises' ? 'default' : completedSteps.includes('exercises') ? 'outline' : 'ghost'}
          onClick={() => setCurrentStep('exercises')}
          disabled={!completedSteps.includes('video')}
          className="gap-2"
        >
          {completedSteps.includes('exercises') ? <CheckCircle className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          2. Practice
        </Button>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <Button
          variant={currentStep === 'ai-help' ? 'default' : 'ghost'}
          onClick={() => setCurrentStep('ai-help')}
          disabled={!completedSteps.includes('video')}
          className="gap-2"
        >
          <Brain className="w-4 h-4" />
          3. Get Help
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
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                📚 Need help with any exercise? Use the AI Tutor to get detailed explanations and corrections!
              </p>
              <Button size="sm" onClick={() => setCurrentStep('ai-help')} variant="outline">
                Get AI Help →
              </Button>
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
            <div className="h-[600px]">
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