import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { AuthError } from "@supabase/supabase-js";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Check current auth status
    const checkUser = async () => {
      console.log("Checking current user session...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking session:", error);
        setErrorMessage(error.message);
        return;
      }
      
      if (session?.user) {
        console.log("User is already logged in, redirecting to home");
        navigate("/");
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === "SIGNED_IN" && session) {
        console.log("User signed in, redirecting to home");
        navigate("/");
        toast({
          title: "Welcome!",
          description: "You have successfully logged in.",
        });
      } else if (event === "SIGNED_OUT") {
        setErrorMessage("");
      } else if (event === "PASSWORD_RECOVERY") {
        setErrorMessage("Please check your email for password reset instructions.");
        toast({
          title: "Password Recovery",
          description: "Please check your email for password reset instructions.",
        });
      } else if (event === "USER_UPDATED") {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth error:", error);
          setErrorMessage(error.message);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: error.message,
          });
        }
      }
    });

    checkUser();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              src="https://i.imghippo.com/files/vrF1570ATw.png"
              alt="New Zealection Logo"
              className="h-16 mx-auto"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome to New Zealection
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to start collecting New Zealand's finest locations
            </p>
          </div>
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          <div className="mt-8">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#16a34a',
                      brandAccent: '#15803d',
                    },
                  },
                },
              }}
              providers={[]}
              redirectTo={`${window.location.origin}/auth/callback`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}