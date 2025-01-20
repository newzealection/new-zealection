import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
          throw error;
        }
        
        console.log('Successfully fetched user cards:', data?.length);
        return data;
      } catch (error) {
        console.error('Failed to fetch user cards:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    onError: () => {
      toast({
        title: "Error Loading Cards",
        description: "Unable to load your cards. Please try again later.",
        variant: "destructive",
      });
    }
  });
};