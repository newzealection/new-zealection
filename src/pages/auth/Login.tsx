import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const getErrorMessage = (error: AuthError) => {
    console.error("Authentication error details:", error);
    
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          return "Invalid email or password. Please check your credentials and try again.";
        case 422:
          return "Please provide both email and password.";
        case 429:
          return "Too many login attempts. Please try again later.";
        default:
          return "An error occurred during login. Please try again.";
      }
    }
    return "An unexpected error occurred. Please try again.";
  };

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log("Checking current user session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          if (mounted) {
            setErrorMessage(getErrorMessage(error));
          }
          return;
        }
        
        if (session?.user && mounted) {
          console.log("User is already logged in, redirecting to home");
          navigate("/");
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        }
      } catch (error) {
        console.error("Unexpected error during session check:", error);
        if (mounted && error instanceof AuthError) {
          setErrorMessage(getErrorMessage(error));
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "for user:", session?.user);
      
      if (event === "SIGNED_IN" && session && mounted) {
        console.log("User signed in successfully, redirecting to home");
        navigate("/");
        toast({
          title: "Welcome!",
          description: "You have successfully logged in.",
        });
      } else if (event === "SIGNED_OUT" && mounted) {
        console.log("User signed out");
        setErrorMessage("");
      }
    });

    checkSession();

    return () => {
      mounted = false;
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
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
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
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email address',
                    password_label: 'Password',
                    button_label: 'Sign in',
                    loading_button_label: 'Signing in...',
                  },
                  sign_up: {
                    email_label: 'Email address',
                    password_label: 'Create a password',
                    button_label: 'Sign up',
                    loading_button_label: 'Signing up...',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}