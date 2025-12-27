import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useSystemSetup } from "@/hooks/useSystemSetup";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";
import { Loader2, WifiOff, Cloud } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

// Offline indicator component
const OfflineIndicator = () => {
  const { isOnline, isSyncing, pendingCount } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all ${
      isOnline ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
    }`}>
      {isOnline ? (
        <>
          <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-medium">
            {isSyncing ? 'جاري المزامنة...' : `${pendingCount} عملية في الانتظار`}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">وضع عدم الاتصال</span>
          {pendingCount > 0 && (
            <span className="bg-background/20 px-2 py-0.5 rounded-full text-xs">
              {pendingCount}
            </span>
          )}
        </>
      )}
    </div>
  );
};

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <p className="text-muted-foreground">جاري التحميل...</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { data: setupData, isLoading: setupLoading } = useSystemSetup();

  if (loading || setupLoading) {
    return <LoadingScreen />;
  }

  // If system is not setup, redirect to setup page
  if (!setupData?.isSetupCompleted) {
    return <Navigate to="/setup" replace />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public Route - redirects to home if logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { data: setupData, isLoading: setupLoading } = useSystemSetup();

  if (loading || setupLoading) {
    return <LoadingScreen />;
  }

  // If system is not setup, redirect to setup page
  if (!setupData?.isSetupCompleted) {
    return <Navigate to="/setup" replace />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Setup Route - only accessible when system is not setup
const SetupRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: setupData, isLoading } = useSystemSetup();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // If system is already setup, redirect to auth
  if (setupData?.isSetupCompleted) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="/setup"
          element={
            <SetupRoute>
              <Setup />
            </SetupRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <OfflineIndicator />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
