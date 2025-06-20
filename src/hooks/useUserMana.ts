import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserMana = (userId: string | null) => {
  return useQuery({
    queryKey: ['userMana', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID not provided');
      }

      console.log('Fetching mana for user:', userId);
      const { data: manaData, error: manaError } = await supabase
        .from('user_mana')
        .select('mana')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (manaError) {
        console.error('Error fetching mana:', manaError);
        throw manaError;
      }

      if (!manaData) {
        console.log('No mana record found, creating new one...');
        const { data: newManaData, error: createError } = await supabase
          .from('user_mana')
          .insert([{ 
            user_id: userId, 
            mana: 0 
          }])
          .select('mana')
          .maybeSingle();

        if (createError) {
          console.error('Error creating mana record:', createError);
          throw createError;
        }

        console.log('New mana record created:', newManaData);
        return newManaData?.mana || 0;
      }

      console.log('Existing mana record found:', manaData);
      return manaData?.mana || 0;
    },
    enabled: !!userId,
    retry: 1,
  });
};