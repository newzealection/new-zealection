import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserCards = (userId: string | null) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['userCards', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID not provided');
      }

      console.log('Fetching cards for user:', userId);
      
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
          .eq('user_id', userId);
        
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
    enabled: !!userId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    meta: {
      errorMessage: "Unable to load your cards. Please try again later."
    },
    gcTime: 1000 * 60 * 5
  });
};