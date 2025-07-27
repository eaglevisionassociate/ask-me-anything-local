import { useAuth } from "@/hooks/useAuth";
import { TutorDashboard } from "@/components/TutorDashboard";
import { AuthPage } from "@/components/AuthPage";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    );
  }

  return user ? <TutorDashboard /> : <AuthPage />;
};

export default Index;
