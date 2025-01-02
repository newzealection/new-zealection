import { motion } from 'framer-motion';
import { Navbar } from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, LogOut, Mail, User as UserIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: userEmail } = useQuery({
    queryKey: ['userEmail'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return profile?.email;
    },
  });

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth/login');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-nzgreen-500 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{userEmail || 'Loading...'}</h1>
              <p className="text-gray-600">Manage your New Zealection account settings</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-full bg-nzgreen-100">
                  <Mail className="h-6 w-6 text-nzgreen-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Email Preferences</h2>
                  <p className="text-stone-200">Manage your email notifications</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Update Email Settings
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-full bg-nzgreen-100">
                  <Settings className="h-6 w-6 text-nzgreen-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Account Settings</h2>
                  <p className="text-stone-200">Update your account preferences</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Manage Settings
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow md:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-full bg-red-100">
                  <LogOut className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Sign Out</h2>
                  <p className="text-stone-200">Securely log out of your account</p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Account;