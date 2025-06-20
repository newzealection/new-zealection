import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';
import { AuthGuard } from '@/components/AuthGuard';
import { useUserMana } from '@/hooks/useUserMana';
import { useUserCards } from '@/hooks/useUserCards';
import { useSellCard } from '@/hooks/useSellCard';
import { FilterControls } from '@/components/collection/FilterControls';
import { CardGrid } from '@/components/collection/CardGrid';
import { CollectionHeader } from '@/components/collection/CollectionHeader';
import { supabase } from '@/integrations/supabase/client';

const Collection = () => {
  const [sortBy, setSortBy] = useState<'rarity' | 'location' | 'collected'>('rarity');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const { data: userMana } = useUserMana(userId);
  const { data: userCards, isLoading } = useUserCards(userId);
  const sellCardMutation = useSellCard(userMana);

  const handleSellCard = (cardId: string) => {
    sellCardMutation.mutate({ cardId });
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
            <CollectionHeader userMana={userMana} />
            
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