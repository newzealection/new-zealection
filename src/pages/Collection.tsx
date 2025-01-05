import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';
import { CollectibleCard } from '@/components/CollectibleCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Collection = () => {
  const [sortBy, setSortBy] = useState<'rarity' | 'location' | 'collected'>('rarity');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user's mana
  const { data: userMana } = useQuery({
    queryKey: ['userMana'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_mana')
        .select('mana')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data?.mana || 0;
    },
  });

  const { data: userCards, isLoading } = useQuery({
    queryKey: ['userCards'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_cards')
        .select(`
          id,
          card_id,
          collected_at,
          unique_card_id,
          cards (
            id,
            title,
            location,
            image_url,
            rarity,
            description
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation for selling a card
  const sellCardMutation = useMutation({
    mutationFn: async ({ cardId, manaValue }: { cardId: string, manaValue: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Start a transaction by updating user_mana first
      const { error: manaError } = await supabase
        .from('user_mana')
        .update({ mana: userMana + manaValue })
        .eq('user_id', user.id);

      if (manaError) throw manaError;

      // Then delete the card
      const { error: deleteError } = await supabase
        .from('user_cards')
        .delete()
        .eq('id', cardId);

      if (deleteError) throw deleteError;

      return { cardId, manaValue };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userCards'] });
      queryClient.invalidateQueries({ queryKey: ['userMana'] });
      toast({
        title: "Card sold successfully!",
        description: `You received ${data.manaValue} mana.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error selling card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getManaValue = (rarity: string): number => {
    const manaValues = {
      legendary: 500,
      epic: 400,
      rare: 300,
      common: 100,
    };
    return manaValues[rarity as keyof typeof manaValues] || 0;
  };

  const handleSellCard = (cardId: string, rarity: string) => {
    const manaValue = getManaValue(rarity);
    sellCardMutation.mutate({ cardId, manaValue });
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
            <div className="bg-nzgreen-500/10 px-4 py-2 rounded-lg">
              <span className="text-lg font-semibold text-nzgreen-700">
                {userMana} Mana
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
            <Select value={sortBy} onValueChange={(value: 'rarity' | 'location' | 'collected') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rarity">Sort by Rarity</SelectItem>
                <SelectItem value="location">Sort by Location</SelectItem>
                <SelectItem value="collected">Sort by Collection Date</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by rarity..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="common">Common</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by location..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {Array.from(locations).map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading your collection...</div>
          ) : sortedAndFilteredCards.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              {userCards?.length === 0 
                ? "Your collection is empty. Visit the Cards page to roll for new cards!"
                : "No cards match your current filters."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {sortedAndFilteredCards.map((userCard) => (
                <div key={userCard.unique_card_id} className="relative">
                  <CollectibleCard
                    imageUrl={userCard.cards.image_url}
                    title={userCard.cards.title}
                    location={userCard.cards.location}
                    rarity={userCard.cards.rarity}
                    collectedAt={format(new Date(userCard.collected_at), 'PPP')}
                    uniqueCardId={userCard.unique_card_id}
                    description={userCard.cards.description}
                    showFlip={true}
                  />
                  <div className="absolute bottom-4 right-4 z-30">
                    <Button
                      onClick={() => handleSellCard(userCard.id, userCard.cards.rarity)}
                      variant="secondary"
                      className="bg-nzgreen-500 hover:bg-nzgreen-600 text-white"
                    >
                      Sell for {getManaValue(userCard.cards.rarity)} Mana
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Collection;