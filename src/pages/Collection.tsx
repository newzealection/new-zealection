import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';
import { CollectibleCard } from '@/components/CollectibleCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';

const Collection = () => {
  const [sortBy, setSortBy] = useState<'rarity' | 'location' | 'collected'>('rarity');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  const { data: userCards, isLoading } = useQuery({
    queryKey: ['userCards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_cards')
        .select(`
          card_id,
          collected_at,
          cards (
            id,
            title,
            location,
            image_url,
            rarity
          )
        `);
      
      if (error) throw error;
      return data;
    },
  });

  const sortedAndFilteredCards = useMemo(() => {
    if (!userCards) return [];

    let filteredCards = userCards;

    // Apply rarity filter
    if (filterRarity !== 'all') {
      filteredCards = filteredCards.filter(card => card.cards.rarity === filterRarity);
    }

    // Apply location filter
    if (filterLocation !== 'all') {
      filteredCards = filteredCards.filter(card => card.cards.location === filterLocation);
    }

    // Sort cards
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">My Collection</h1>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <Select value={sortBy} onValueChange={(value: 'rarity' | 'location' | 'collected') => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rarity">Sort by Rarity</SelectItem>
                <SelectItem value="location">Sort by Location</SelectItem>
                <SelectItem value="collected">Sort by Collection Date</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
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
            <div className="text-center">Loading your collection...</div>
          ) : sortedAndFilteredCards.length === 0 ? (
            <div className="text-center text-gray-600">
              {userCards?.length === 0 
                ? "Your collection is empty. Visit the Cards page to roll for new cards!"
                : "No cards match your current filters."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAndFilteredCards.map((userCard) => (
                <CollectibleCard
                  key={userCard.card_id}
                  imageUrl={userCard.cards.image_url}
                  title={userCard.cards.title}
                  location={userCard.cards.location}
                  rarity={userCard.cards.rarity}
                  collectedAt={format(new Date(userCard.collected_at), 'PPP')}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Collection;