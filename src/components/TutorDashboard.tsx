import { useState } from "react";
import { Book, Calculator, Beaker, Globe, Brain, MessageCircle, Star, Trophy, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChatInterface } from "./ChatInterface";
import { ExerciseList } from "./ExerciseList";
import { LessonFlow } from "./LessonFlow";
import { PhotoUpload } from "./PhotoUpload";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Subject {
  id: string;
  name: string;
  icon: any;
  progress: number;
  color: string;
  topics: string[];
}

const subjects: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    icon: Calculator,
    progress: 75,
    color: "bg-primary",
    topics: ["Algebra", "Geometry", "Number Theory"]
  },
  {
    id: "science",
    name: "Science",
    icon: Beaker,
    progress: 0,
    color: "bg-green-600",
    topics: ["Physical Sciences", "Life Sciences", "Earth Sciences"]
  },
  {
    id: "english",
    name: "English",
    icon: Book,
    progress: 0,
    color: "bg-muted",
    topics: ["Reading", "Writing", "Grammar", "Literature"]
  },
  {
    id: "social",
    name: "Social Studies",
    icon: Globe,
    progress: 0,
    color: "bg-muted",
    topics: ["History", "Geography", "Civics", "Economics"]
  }
];

export const TutorDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const { user, signOut } = useAuth();
  const { profile, userStats, subjectProgress, recentActivities, loading } = useDashboardData(user?.id);
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleSubjectSelect = (subject: Subject) => {
    if (subject.id !== "math" && subject.id !== "science") {
      return; // Only Math and Science are available
    }
    setSelectedSubject(subject);
    setActiveTab("lessons");
  };

  // Get real subject progress data
  const getSubjectProgress = () => {
    return subjects.map(subject => {
      const progress = subjectProgress.find(p => p.subject_name === subject.name);
      return {
        ...subject,
        progress: progress?.progress_percentage || 0
      };
    });
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (subjectProgress.length === 0) return 0;
    const total = subjectProgress.reduce((sum, p) => sum + p.progress_percentage, 0);
    return Math.round(total / subjectProgress.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Grade 8 AI Tutor</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Your personalized learning companion</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-sm sm:text-base">
                  {loading ? <Skeleton className="h-4 w-16" /> : `${profile?.total_xp || 0} XP`}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">
                {loading ? <Skeleton className="h-4 w-20" /> : `Welcome, ${profile?.display_name || user?.email || 'Student'}!`}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="self-start sm:self-auto">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="inline-flex w-full sm:grid sm:grid-cols-5 min-w-max sm:min-w-0">
              <TabsTrigger value="dashboard" className="whitespace-nowrap">Dashboard</TabsTrigger>
              <TabsTrigger value="subjects" className="whitespace-nowrap">Subjects</TabsTrigger>
              <TabsTrigger value="lessons" className="whitespace-nowrap">{selectedSubject?.name || "Math"} Lessons</TabsTrigger>
              <TabsTrigger value="upload" className="whitespace-nowrap">Photo Upload</TabsTrigger>
              <TabsTrigger value="chat" className="whitespace-nowrap">AI Tutor Chat</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-16" /> : `${calculateOverallProgress()}%`}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all subjects</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-12" /> : userStats?.total_lessons_completed || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total completed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-12" /> : `${profile?.study_streak || 0} days`}
                  </div>
                  <p className="text-xs text-muted-foreground">Keep it up!</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Sessions</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-12" /> : userStats?.ai_sessions_count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total sessions</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Progress</CardTitle>
                  <CardDescription>Your progress across all subjects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))
                  ) : (
                    getSubjectProgress().map((subject) => (
                      <div key={subject.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <subject.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{subject.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest learning activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-5 w-12" />
                      </div>
                    ))
                  ) : recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((activity) => {
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case 'exercise': return Calculator;
                          case 'lesson': return Book;
                          case 'chat': return MessageCircle;
                          default: return Brain;
                        }
                      };
                      
                      const ActivityIcon = getActivityIcon(activity.activity_type);
                      const timeAgo = new Date(activity.created_at).toLocaleDateString();
                      
                      return (
                        <div key={activity.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <ActivityIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.activity_title}</p>
                            <p className="text-xs text-muted-foreground">{timeAgo}</p>
                          </div>
                          {activity.score && (
                            <Badge variant="secondary">{activity.score}%</Badge>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No activities yet</p>
                      <p className="text-xs">Start learning to see your progress here!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                📚 Mathematics is available! Science is now accessible (Under Development). English and Social Studies coming soon.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {subjects.map((subject) => {
                const isAvailable = subject.id === "math" || subject.id === "science";
                return (
                  <Card 
                    key={subject.id} 
                    className={`transition-shadow ${
                      isAvailable 
                        ? "cursor-pointer hover:shadow-md" 
                        : "opacity-60 cursor-not-allowed"
                    }`}
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${subject.color} rounded-xl flex items-center justify-center`}>
                          <subject.icon className={`w-6 h-6 ${isAvailable ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {subject.name}
                            {subject.id === "science" && (
                              <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">Beta</Badge>
                            )}
                            {subject.id !== "math" && subject.id !== "science" && (
                              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {subject.id === "math" ? `${subject.progress}% Complete` : 
                             subject.id === "science" ? "Under Development" : "Coming Soon"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={subject.progress} className="mb-4" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Topics:</p>
                        <div className="flex flex-wrap gap-1">
                          {subject.topics.map((topic) => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => handleSubjectSelect(subject)}
                        disabled={!isAvailable}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {subject.id === "math" ? "Start Learning" : 
                         subject.id === "science" ? "Explore Science" : "Coming Soon"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            {/* Under Development Banner for Science */}
            {selectedSubject?.id === "science" && (
              <div className="p-6 bg-yellow-500/20 border-2 border-yellow-500 rounded-xl text-center">
                <h2 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  🚧 UNDER DEVELOPMENT 🚧
                </h2>
                <p className="text-lg text-muted-foreground">
                  Science exercises are being built. You can explore the available topics below!
                </p>
              </div>
            )}

            {/* Topic Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Select a Topic</CardTitle>
                <CardDescription>Choose from available {selectedSubject?.name.toLowerCase()} topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {selectedSubject?.topics.map((topic) => (
                    <Button
                      key={topic}
                      variant={selectedSubject?.topics.length === 1 && selectedSubject.topics.includes(topic) ? "default" : "outline"}
                      onClick={() => {
                        if (selectedSubject) {
                          setSelectedSubject({
                            ...selectedSubject,
                            topics: [topic] // Set single topic for filtering
                          });
                        }
                      }}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {selectedSubject && selectedSubject.topics.length === 1 ? (
              <LessonFlow topic={selectedSubject.topics[0]} />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  {selectedSubject?.id === "science" ? (
                    <Beaker className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  ) : (
                    <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  )}
                  <p className="text-muted-foreground">Select a topic above to view lessons</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <PhotoUpload onAnalysisComplete={(results) => {
              toast({
                title: "Analysis Complete",
                description: `Processing complete! Found ${results.totalQuestions} questions.`,
              });
            }} />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            {selectedSubject && (
              <Card className="mb-4">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${selectedSubject.color} rounded-xl flex items-center justify-center`}>
                      <selectedSubject.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>{selectedSubject.name} AI Tutor</CardTitle>
                      <CardDescription>Ask questions about {selectedSubject.name} topics</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}
            <div className="h-[calc(100vh-300px)]">
              <ChatInterface tutorContext={selectedSubject} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};