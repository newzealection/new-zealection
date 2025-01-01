import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Cards = () => {
  const { toast } = useToast();
  const [isRolling, setIsRolling] = useState(false);

  const { data: lastRoll } = useQuery({
    queryKey: ['lastRoll'],
    queryFn: async () => {
      const { data: userCards, error } = await supabase
        .from('user_cards')
        .select('last_roll_at')
        .order('last_roll_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return userCards?.[0]?.last_roll_at;
    },
  });

  const canRoll = !lastRoll || new Date(lastRoll).getTime() + 24 * 60 * 60 * 1000 < Date.now();

  const handleRoll = async () => {
    try {
      setIsRolling(true);
      
      // Get a random card
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*');
      
      if (cardsError) throw cardsError;
      
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      
      // Add card to user's collection
      const { error: insertError } = await supabase
        .from('user_cards')
        .insert([
          {
            card_id: randomCard.id,
          },
        ]);
      
      if (insertError) throw insertError;
      
      toast({
        title: "Congratulations!",
        description: `You got ${randomCard.title} (${randomCard.rarity})!`,
      });
      
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Roll a Card</h1>
          <p className="text-lg text-gray-600 mb-8">
            Try your luck and discover beautiful locations across New Zealand!
            You can roll once every 24 hours.
          </p>
          
          <Button
            size="lg"
            className="bg-nzgreen-500 hover:bg-nzgreen-600 text-white px-8 py-4 rounded-lg text-lg"
            onClick={handleRoll}
            disabled={!canRoll || isRolling}
          >
            {isRolling ? "Rolling..." : canRoll ? "Roll Now!" : "Come back in 24 hours"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Cards;