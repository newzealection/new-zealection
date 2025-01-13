import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserCards = () => {
  return useQuery({
    queryKey: ['userCards'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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
        .eq('user_id', user.id);  // Filter by current user
      
      if (error) throw error;
      return data;
    },
  });
};