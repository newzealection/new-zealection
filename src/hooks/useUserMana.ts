import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserMana = () => {
  return useQuery({
    queryKey: ['userMana'],
    queryFn: async () => {
      console.log('Fetching user mana...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found when fetching mana');
        throw new Error('User not authenticated');
      }

      console.log('Fetching mana for user:', user.id);
      const { data: manaData, error: manaError } = await supabase
        .from('user_mana')
        .select('mana')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (manaError) {
        console.error('Error fetching mana:', manaError);
        throw manaError;
      }

      if (!manaData) {
        console.log('No mana record found for user:', user.id, 'creating new one...');
        const { data: newManaData, error: createError } = await supabase
          .from('user_mana')
          .insert([{ 
            user_id: user.id, 
            mana: 0 
          }])
          .select('mana')
          .maybeSingle();

        if (createError) {
          console.error('Error creating mana record:', createError);
          throw createError;
        }

        console.log('New mana record created for user:', user.id);
        return newManaData?.mana || 0;
      }

      console.log('Existing mana record found for user:', user.id, 'mana:', manaData.mana);
      return manaData?.mana || 0;
    },
    retry: 1,
  });
};