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
      console.log('Calling sell_card function with:', { p_card_id: cardId, p_user_id: user.id });

      const { data, error } = await supabase
        .rpc('sell_card', {
          p_card_id: cardId,
          p_user_id: user.id
        });

      if (error) {
        console.error('Error from sell_card function:', error);
        throw error;
      }

      if (!data) {
        console.error('No data returned from sell_card function');
        throw new Error('Failed to sell card');
      }

      console.log('Card sold successfully:', data);
      return { success: true };
    },
    onSuccess: () => {
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