import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSellCard = (userMana: number | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ cardId }: { cardId: string }) => {
      console.log('Starting sell card process:', { cardId });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First verify the card exists and get its mana value
      const { data: existingCard, error: checkError } = await supabase
        .from('user_cards')
        .select('mana_value')
        .eq('id', cardId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking card:', checkError);
        throw checkError;
      }

      if (!existingCard) {
        console.error('Card not found or already sold');
        throw new Error('Card not found or already sold');
      }

      console.log('Found card with mana value:', existingCard.mana_value);

      // Call the sell_card function
      const { data: result, error: rpcError } = await supabase
        .rpc('sell_card', { 
          p_card_id: cardId,
          p_user_id: user.id
        });

      if (rpcError) {
        console.error('Error in sell_card transaction:', rpcError);
        throw rpcError;
      }

      if (!result) {
        console.error('Sell card operation failed');
        throw new Error('Failed to sell card');
      }

      console.log('Card sold successfully:', { result, manaValue: existingCard.mana_value });
      return { 
        cardId, 
        manaValue: existingCard.mana_value, 
        newManaValue: (userMana || 0) + existingCard.mana_value 
      };
    },
    onSuccess: (data) => {
      console.log('Mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['userCards'] });
      queryClient.invalidateQueries({ queryKey: ['userMana'] });
      toast({
        title: "Card sold successfully!",
        description: `You received ${data.manaValue} mana. New balance: ${data.newManaValue} mana.`,
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