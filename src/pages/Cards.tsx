import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { CollectibleCard } from '@/components/CollectibleCard';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type UserCard = Database['public']['Tables']['user_cards']['Row'] & {
  cards: Database['public']['Tables']['cards']['Row']
};

const Cards = () => {
  const { toast } = useToast();
  const [isRolling, setIsRolling] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Query for the last roll time
  const { data: lastRoll, refetch: refetchLastRoll } = useQuery({
    queryKey: ['lastRoll'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data: userCards, error } = await supabase
        .from('user_cards')
        .select('last_roll_at')
        .eq('user_id', session.user.id)
        .order('last_roll_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching last roll:', error);
        throw error;
      }
      return userCards?.[0]?.last_roll_at;
    },
  });

  // Query for recent cards
  const { data: recentCards, refetch: refetchCards } = useQuery({
    queryKey: ['recentCards'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase
        .from('user_cards')
        .select(`
          *,
          cards (*)
        `)
        .eq('user_id', session.user.id)
        .order('collected_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching recent cards:', error);
        throw error;
      }
      return data as UserCard[];
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  useEffect(() => {
    const updateCountdown = () => {
      if (!lastRoll) {
        setCountdown('Roll Now!');
        return;
      }

      const nextRollTime = new Date(lastRoll).getTime() + 24 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const timeLeft = nextRollTime - now;

      if (timeLeft <= 0) {
        setCountdown('Roll Now!');
      } else {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setCountdown(`Roll in ${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lastRoll]);

  const canRoll = !lastRoll || new Date(lastRoll).getTime() + 24 * 60 * 60 * 1000 < Date.now();

  const handleRoll = async () => {
    try {
      setIsRolling(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to roll cards.",
        });
        return;
      }
      
      // Get a random card
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*');
      
      if (cardsError) throw cardsError;
      
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      
      // Add card to user's collection
      const { error: insertError } = await supabase
        .from('user_cards')
        .insert({
          card_id: randomCard.id,
          user_id: session.user.id,
        });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Congratulations!",
        description: `You got ${randomCard.title} (${randomCard.rarity})!`,
      });

      // Refetch data to update the UI
      await Promise.all([refetchLastRoll(), refetchCards()]);
      
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