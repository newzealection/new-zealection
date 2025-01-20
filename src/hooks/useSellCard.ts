import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSellCard = (userMana: number | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ cardId }: { cardId: string }) => {
      console.log('Starting card sale process...');
      console.log('Card ID to sell:', cardId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
      }

      console.log('Authenticated user:', user.id);

      // First verify the card exists
      const { data: cardData, error: cardError } = await supabase
        .from('user_cards')
        .select('*')
        .eq('id', cardId)
        .eq('user_id', user.id)
        .single();

      if (cardError || !cardData) {
        console.error('Card verification failed:', cardError || 'Card not found');
        throw new Error('Card not found or does not belong to user');
      }

      console.log('Card verified:', cardData);
      console.log('Calling sell_card function with:', { p_card_id: cardId, p_user_id: user.id });

      // Call the sell_card function
      const { data, error } = await supabase
        .rpc('sell_card', {
          p_card_id: cardId,
          p_user_id: user.id
        });

      if (error) {
        console.error('Error from sell_card function:', error);
        throw error;
      }

      console.log('Card sold successfully:', data);
      return { success: true, manaValue: cardData.mana_value };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userCards'] });
      queryClient.invalidateQueries({ queryKey: ['userMana'] });
      
      const newTotalMana = (userMana || 0) + (data.manaValue || 0);
      
      toast({
        title: "Card sold successfully! 🎉",
        description: `You received ${data.manaValue} mana. Your new total is ${newTotalMana} mana.`,
      });
    },
    onError: (error: Error) => {
      console.error('Error selling card:', error);
      toast({
        title: "Error selling card",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};