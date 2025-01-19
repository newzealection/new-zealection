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

      // Call the sell_card function directly with the user_cards.id
      const { data: result, error: rpcError } = await supabase
        .rpc('sell_card', { 
          p_card_id: cardId,
          p_user_id: user.id
        });

      if (rpcError) {
        console.error('Error in sell_card transaction:', rpcError);
        throw rpcError;
      }

      // Get the mana value for the success message
      const { data: cardData } = await supabase
        .from('user_cards')
        .select('mana_value')
        .eq('id', cardId)
        .single();

      console.log('Card sold successfully:', result);
      return { 
        cardId, 
        manaValue: cardData?.mana_value || 0, 
        newManaValue: (userMana || 0) + (cardData?.mana_value || 0)
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