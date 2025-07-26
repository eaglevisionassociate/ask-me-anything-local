import { useState } from "react";
import { Book, Calculator, Beaker, Globe, Brain, MessageCircle, Star, Trophy, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChatInterface } from "./ChatInterface";

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
    topics: ["Algebra", "Geometry", "Statistics", "Probability"]
  },
  {
    id: "science",
    name: "Science",
    icon: Beaker,
    progress: 0,
    color: "bg-muted",
    topics: ["Physics", "Chemistry", "Biology", "Environmental Science"]
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

  const handleSubjectSelect = (subject: Subject) => {
    if (subject.id !== "math") {
      return; // Only Math is available
    }
    setSelectedSubject(subject);
    setActiveTab("chat");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Grade 8 AI Tutor</h1>
                <p className="text-sm text-muted-foreground">Your personalized learning companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">1,250 XP</span>
              </div>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="chat">AI Tutor Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">72%</div>
                  <p className="text-xs text-muted-foreground">+5% from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7 days</div>
                  <p className="text-xs text-muted-foreground">Keep it up!</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Sessions</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15</div>
                  <p className="text-xs text-muted-foreground">This week</p>
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
                  {subjects.map((subject) => (
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
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest learning activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Completed Algebra Quiz</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <Badge variant="secondary">95%</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Beaker className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Chemistry Lab Session</p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                    <Badge variant="secondary">88%</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Book className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Essay Writing Practice</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                    <Badge variant="secondary">92%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">
                🚧 Currently focused on Mathematics. Other subjects are under development and will be available soon!
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {subjects.map((subject) => (
                <Card 
                  key={subject.id} 
                  className={`transition-shadow ${
                    subject.id === "math" 
                      ? "cursor-pointer hover:shadow-md" 
                      : "opacity-60 cursor-not-allowed"
                  }`} 
                  onClick={() => handleSubjectSelect(subject)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${subject.color} rounded-xl flex items-center justify-center`}>
                        <subject.icon className={`w-6 h-6 ${subject.id === "math" ? "text-white" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {subject.name}
                          {subject.id !== "math" && (
                            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {subject.id === "math" ? `${subject.progress}% Complete` : "Under Development"}
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
                      disabled={subject.id !== "math"}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {subject.id === "math" ? "Study with AI" : "Coming Soon"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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