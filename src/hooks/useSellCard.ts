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

      // Call the sell_card database function
      const { data, error } = await supabase
        .rpc('sell_card', {
          p_card_id: cardId,
          p_user_id: user.id
        });

      if (error) {
        console.error('Error selling card:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Failed to sell card');
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate both queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['userCards'] });
      queryClient.invalidateQueries({ queryKey: ['userMana'] });
      toast({
        title: "Card sold successfully!",
        description: "The card has been removed from your collection and you received mana.",
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