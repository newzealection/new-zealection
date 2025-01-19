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

      // Get the card details first
      const { data: cardData, error: cardError } = await supabase
        .from('user_cards')
        .select('mana_value')
        .eq('id', cardId)
        .single();

      if (cardError) {
        console.error('Error getting card details:', cardError);
        throw cardError;
      }

      if (!cardData) {
        throw new Error('Card not found');
      }

      // Delete the card using its ID
      const { error: deleteError } = await supabase
        .from('user_cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting card:', deleteError);
        throw deleteError;
      }

      // Update user's mana
      const { error: manaError } = await supabase
        .from('user_mana')
        .update({ 
          mana: (userMana || 0) + cardData.mana_value,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (manaError) {
        console.error('Error updating mana:', manaError);
        throw manaError;
      }

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