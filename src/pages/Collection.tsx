import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';
import { CollectibleCard } from '@/components/CollectibleCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Collection = () => {
  const { data: userCards, isLoading } = useQuery({
    queryKey: ['userCards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_cards')
        .select(`
          card_id,
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
          <p className="text-lg text-gray-600 mb-8">
            Your collected New Zealand locations
          </p>

          {isLoading ? (
            <div className="text-center">Loading your collection...</div>
          ) : userCards?.length === 0 ? (
            <div className="text-center text-gray-600">
              Your collection is empty. Visit the Cards page to roll for new cards!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCards?.map((userCard: any) => (
                <CollectibleCard
                  key={userCard.card_id}
                  imageUrl={userCard.cards.image_url}
                  title={userCard.cards.title}
                  location={userCard.cards.location}
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