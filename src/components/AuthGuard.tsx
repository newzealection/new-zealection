import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let isInitialCheck = true;

    const checkAuth = async () => {
      try {
        console.log("AuthGuard: Checking session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthGuard: Error checking session:", error);
          throw error;
        }

        if (!session && mounted && !isInitialCheck) {
          console.log("AuthGuard: No session found, redirecting to login");
          toast({
            title: "Authentication required",
            description: "Please log in to access this page",
          });
          navigate("/auth/login");
        }
        isInitialCheck = false;
      } catch (error) {
        console.error("AuthGuard: Unexpected error:", error);
        if (mounted && !isInitialCheck) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was a problem verifying your session. Please try logging in again.",
          });
          navigate("/auth/login");
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthGuard: Auth state changed:", event);
      
      if (event === "SIGNED_OUT" && mounted && !isInitialCheck) {
        console.log("AuthGuard: User signed out, redirecting to login");
        navigate("/auth/login");
      } else if (event === "TOKEN_REFRESHED") {
        console.log("AuthGuard: Token refreshed");
      }
    });

    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return <>{children}</>;
};