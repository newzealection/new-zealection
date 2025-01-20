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
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Create a client with more aggressive retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      gcTime: 1000 * 60 * 5,
      onError: (error, query) => {
        if (query.meta?.errorMessage) {
          queryClient.getLogger().error(error);
          // Show toast with custom error message from meta
          const toast = useToast();
          toast.toast({
            title: "Error",
            description: query.meta.errorMessage as string,
            variant: "destructive",
          });
        }
      },
    },
  },
});

// Create a wrapper component to handle auth state changes
const QueryInvalidator = () => {
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in QueryInvalidator:", event);
      
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
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;