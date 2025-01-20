import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useUserCards = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['userCards'],
    queryFn: async () => {
      console.log('Fetching user cards...');
      
      // Get current user with retry logic
      let user;
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        user = currentUser;
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: "Authentication Error",
          description: "Please try logging in again.",
          variant: "destructive",
        });
        throw new Error('User not authenticated');
      }

      if (!user) {
        console.log('No user found, throwing error');
        throw new Error('User not authenticated');
      }

      console.log('Fetching cards for user:', user.id);
      
      // Fetch user cards with retry logic
      try {
        const { data, error } = await supabase
          .from('user_cards')
          .select(`
            id,
            card_id,
            collected_at,
            unique_card_id,
            mana_value,
            cards (
              id,
              title,
              location,
              image_url,
              rarity,
              description
            )
          `)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching user cards:', error);
          toast({
            title: "Error Loading Cards",
            description: "There was a problem loading your cards. Please refresh the page.",
            variant: "destructive",
          });
          throw error;
        }
        
        console.log('Successfully fetched user cards:', data?.length);
        return data;
      } catch (error) {
        console.error('Failed to fetch user cards:', error);
        toast({
          title: "Connection Error",
          description: "Unable to load your cards. Please check your internet connection and try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refresh data when tab becomes active
    refetchOnReconnect: true, // Refresh data when internet connection is restored
  });
};