import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserCards = () => {
  return useQuery({
    queryKey: ['userCards'],
    queryFn: async () => {
      console.log('Fetching user cards...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, throwing error');
        throw new Error('User not authenticated');
      }

      console.log('Fetching cards for user:', user.id);
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
    },
    enabled: true, // Query will run as soon as component mounts
    retry: 1,
  });
};