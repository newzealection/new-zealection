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
        throw new Error('Card not found or already sold');
      }

      // Then delete the card
      const { error: deleteError } = await supabase
        .from('user_cards')
        .delete()
        .eq('id', cardId);

      if (deleteError) {
        console.error('Error deleting card:', deleteError);
        throw deleteError;
      }

      console.log('Card deleted successfully');

      // Then update mana
      const { data: updatedMana, error: updateError } = await supabase
        .from('user_mana')
        .update({ 
          mana: (userMana || 0) + existingCard.mana_value,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Error updating mana:', updateError);
        throw updateError;
      }

      if (!updatedMana) {
        throw new Error('Failed to update mana balance');
      }

      console.log('Mana updated successfully');
      return { cardId, manaValue: existingCard.mana_value, newManaValue: (userMana || 0) + existingCard.mana_value };
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