import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log("AuthGuard: Checking session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthGuard: Error checking session:", error);
          throw error;
        }

        if (mounted) {
          if (session) {
            console.log("AuthGuard: User is authenticated");
            setIsAuthenticated(true);
          } else {
            console.log("AuthGuard: No session found, redirecting to login");
            toast({
              title: "Authentication required",
              description: "Please log in to access this page",
            });
            navigate("/auth/login");
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("AuthGuard: Unexpected error:", error);
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was a problem verifying your session. Please try logging in again.",
          });
          navigate("/auth/login");
          setIsLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthGuard: Auth state changed:", event);
      
      if (mounted) {
        if (event === "SIGNED_OUT") {
          console.log("AuthGuard: User signed out, redirecting to login");
          setIsAuthenticated(false);
          navigate("/auth/login");
        } else if (event === "SIGNED_IN" && session) {
          console.log("AuthGuard: User signed in");
          setIsAuthenticated(true);
        } else if (event === "TOKEN_REFRESHED") {
          console.log("AuthGuard: Token refreshed");
          setIsAuthenticated(!!session);
        }
      }
    });

    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nzgreen-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};