import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cards from "./pages/Cards";
import Collection from "./pages/Collection";
import Summon from "./pages/Summon";
import Marketplace from "./pages/Marketplace";
import Battlefield from "./pages/Battlefield";
import Account from "./pages/Account";
import Login from "./pages/auth/Login";
import Callback from "./pages/auth/Callback";
import { AuthGuard } from "./components/AuthGuard";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      gcTime: 1000 * 60 * 5,
      meta: {
        errorMessage: "An error occurred. Please try again later."
      }
    },
  },
});

const QueryInvalidator = () => {
  const { toast } = useToast();

  useEffect(() => {
    let isInitialSession = true;
    let isFirstLoad = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in QueryInvalidator:", event);
      
      // Skip initial session check and first load to prevent unnecessary toasts
      if (isInitialSession || isFirstLoad) {
        isInitialSession = false;
        isFirstLoad = false;
        return;
      }
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in, invalidating queries");
        queryClient.invalidateQueries();
        toast({
          title: "Welcome back!",
          description: `Signed in as ${session?.user?.email}`,
        });
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out, invalidating queries");
        queryClient.invalidateQueries();
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed, invalidating queries");
        queryClient.invalidateQueries();
      }
    });

    // Set up offline/online handlers
    const handleOnline = () => {
      console.log("App is online, refreshing data");
      queryClient.invalidateQueries();
      toast({
        title: "Connected",
        description: "Your internet connection has been restored.",
      });
    };

    const handleOffline = () => {
      console.log("App is offline");
      toast({
        title: "Connection Lost",
        description: "Please check your internet connection.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
};

function App() {
  console.log('App component loaded');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize the app
    const initializeApp = async () => {
      try {
        // Check if we have a valid session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session:", error);
        }
        console.log("Initial session check:", session ? "authenticated" : "not authenticated");
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nzgreen-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster />
        <QueryInvalidator />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/callback" element={<Callback />} />
          <Route path="/cards" element={<AuthGuard><Cards /></AuthGuard>} />
          <Route path="/collection" element={<AuthGuard><Collection /></AuthGuard>} />
          <Route path="/summon" element={<AuthGuard><Summon /></AuthGuard>} />
          <Route path="/marketplace" element={<AuthGuard><Marketplace /></AuthGuard>} />
          <Route path="/battlefield" element={<AuthGuard><Battlefield /></AuthGuard>} />
          <Route path="/account" element={<AuthGuard><Account /></AuthGuard>} />
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Index />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;