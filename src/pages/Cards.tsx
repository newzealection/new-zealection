import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { CollectibleCard } from '@/components/CollectibleCard';
import { format, differenceInHours } from 'date-fns';

const Cards = () => {
  const { toast } = useToast();
  const [isRolling, setIsRolling] = useState(false);
  const [countdown, setCountdown] = useState('Roll Now!');

  const { data: lastRoll, refetch: refetchLastRoll } = useQuery({
    queryKey: ['lastRoll'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: userCards, error } = await supabase
        .from('user_cards')
        .select('last_roll_at')
        .eq('user_id', user.id)
        .order('last_roll_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return userCards?.[0]?.last_roll_at;
    },
  });

  const { data: recentCards } = useQuery({
    queryKey: ['recentCards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_cards_with_profiles')
        .select(`
          *,
          cards:card_id (*)
        `)
        .order('collected_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      console.log('Fetched user cards:', data);
      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Calculate if user can roll based on last roll time
  const canRoll = !lastRoll || differenceInHours(new Date(), new Date(lastRoll)) >= 24;

  useEffect(() => {
    const updateCountdown = () => {
      if (!lastRoll) {
        setCountdown('Roll Now!');
        return;
      }

      const lastRollDate = new Date(lastRoll);
      const nextRollDate = new Date(lastRollDate.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      
      if (now >= nextRollDate) {
        setCountdown('Roll Now!');
        return;
      }

      const diffHours = Math.floor((nextRollDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      const diffMinutes = Math.floor(((nextRollDate.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
      
      setCountdown(`Wait ${diffHours}h ${diffMinutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastRoll]);

  const handleRoll = async () => {
    try {
      setIsRolling(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*');
      
      if (cardsError) throw cardsError;
      
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      
      const { error: insertError } = await supabase
        .from('user_cards')
        .insert({
          card_id: randomCard.id,
          user_id: user.id,
        });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Congratulations!",
        description: `You got ${randomCard.title} (${randomCard.rarity})!`,
      });

      refetchLastRoll();
      
    } catch (error) {
      console.error('Error rolling card:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to roll a card. Please try again.",
      });
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Explore New Zealand</h1>
          <p className="text-lg text-gray-600 mb-8">
            Discover beautiful locations across New Zealand through our unique collectible cards.
            You can roll once every 24 hours.
          </p>
          
          <Button
            size="lg"
            className="bg-nzgreen-500 hover:bg-nzgreen-600 text-white px-8 py-4 rounded-lg text-lg"
            onClick={handleRoll}
            disabled={!canRoll || isRolling}
          >
            {isRolling ? "Rolling..." : countdown}
          </Button>

          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Recently Collected Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentCards?.map((userCard) => (
                <CollectibleCard
                  key={userCard.id}
                  imageUrl={userCard.cards.image_url}
                  title={userCard.cards.title}
                  location={userCard.cards.location}
                  rarity={userCard.cards.rarity}
                  collectedAt={format(new Date(userCard.collected_at), 'PPP')}
                  uniqueCardId={userCard.unique_card_id}
                  userName={userCard.user_email}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cards;
