import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSellCard = (userMana: number | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ cardId }: { cardId: string }) => {
      console.log('Selling card:', { cardId });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the mana value before selling the card
      const { data: cardData, error: cardError } = await supabase
        .from('user_cards')
        .select('mana_value')
        .eq('card_id', cardId)
        .eq('user_id', user.id)
        .single();

      if (cardError) {
        console.error('Error getting card mana value:', cardError);
        throw cardError;
      }

      if (!cardData) {
        throw new Error('Card not found or already sold');
      }

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

      console.log('Card sold successfully:', result);
      return { 
        cardId, 
        manaValue: cardData.mana_value, 
        newManaValue: (userMana || 0) + cardData.mana_value 
      };
    },
    onSuccess: (data) => {
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