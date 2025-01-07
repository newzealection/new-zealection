import { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthGuard } from '@/components/AuthGuard';
import { useUserMana } from '@/hooks/useUserMana';
import { useUserCards } from '@/hooks/useUserCards';
import { FilterControls } from '@/components/collection/FilterControls';
import { CardGrid } from '@/components/collection/CardGrid';

const Collection = () => {
  const [sortBy, setSortBy] = useState<'rarity' | 'location' | 'collected'>('rarity');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userMana } = useUserMana();
  const { data: userCards, isLoading } = useUserCards();

  const sellCardMutation = useMutation({
    mutationFn: async ({ cardId, manaValue }: { cardId: string, manaValue: number }) => {
      console.log('Selling card:', { cardId, manaValue });
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
          mana: userMana + existingCard.mana_value,
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
      return { cardId, manaValue: existingCard.mana_value, newManaValue: userMana + existingCard.mana_value };
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

  const handleSellCard = (cardId: string) => {
    sellCardMutation.mutate({ cardId, manaValue: 0 }); // manaValue is not used anymore as it comes from the database
  };

  const sortedAndFilteredCards = useMemo(() => {
    if (!userCards) return [];

    let filteredCards = userCards;

    if (filterRarity !== 'all') {
      filteredCards = filteredCards.filter(card => card.cards.rarity === filterRarity);
    }

    if (filterLocation !== 'all') {
      filteredCards = filteredCards.filter(card => card.cards.location === filterLocation);
    }

    return [...filteredCards].sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
          return rarityOrder[a.cards.rarity as keyof typeof rarityOrder] - 
                 rarityOrder[b.cards.rarity as keyof typeof rarityOrder];
        case 'location':
          return a.cards.location.localeCompare(b.cards.location);
        case 'collected':
          return new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime();
        default:
          return 0;
      }
    });
  }, [userCards, sortBy, filterRarity, filterLocation]);

  const locations = useMemo(() => {
    if (!userCards) return new Set<string>();
    return new Set(userCards.map(card => card.cards.location));
  }, [userCards]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Collection</h1>
              <div className="bg-nzgreen-500/10 px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="text-lg font-semibold text-nzgreen-700 flex items-center gap-2">
                  <img 
                    src="/lovable-uploads/75d6637e-1062-4fd8-b272-34dbb7e63acc.png" 
                    alt="Mana" 
                    className="w-5 h-5 object-contain"
                  />
                  {userMana ?? 0}
                </span>
              </div>
            </div>
            
            <FilterControls
              sortBy={sortBy}
              setSortBy={setSortBy}
              filterRarity={filterRarity}
              setFilterRarity={setFilterRarity}
              filterLocation={filterLocation}
              setFilterLocation={setFilterLocation}
              locations={locations}
            />

            {isLoading ? (
              <div className="text-center py-8">Loading your collection...</div>
            ) : userCards?.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                Your collection is empty. Visit the Cards page to roll for new cards!
              </div>
            ) : (
              <CardGrid
                cards={sortedAndFilteredCards}
                onSellCard={handleSellCard}
                getManaValue={(card) => card.mana_value}
              />
            )}
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Collection;
