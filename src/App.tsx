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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Create a wrapper component to handle auth state changes
const QueryInvalidator = () => {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed in QueryInvalidator:", event);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log("Invalidating queries due to auth state change");
        // Invalidate all queries when auth state changes
        queryClient.invalidateQueries();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryInvalidator />
      <Router>
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
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;