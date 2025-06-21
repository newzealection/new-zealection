import { motion } from 'framer-motion';
import { CollectibleCard } from './CollectibleCard';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const Hero = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartCollection = () => {
    if (isAuthenticated) {
      navigate('/cards');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-50">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-50/90" />
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e"
          alt="New Zealand Landscape"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-nzgreen-500 bg-white/90 rounded-full">
            Discover New Zealand
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Collect the Beauty of Aotearoa
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Experience New Zealand's breathtaking landscapes through our unique collectible cards.
            Each card is a gateway to adventure.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartCollection}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-nzgreen-500 text-white rounded-lg font-medium shadow-lg hover:bg-nzgreen-600 transition-colors"
          >
            Start Your Collection
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12 px-4">
          <div className="w-full">
            <CollectibleCard
              imageUrl="https://images.unsplash.com/photo-1553462167-103041ad6e71"
              title="Mount Cook"
              location="Southern Alps"
              rarity="legendary"
              isPreview={true}
            />
          </div>
          <div className="w-full">
            <CollectibleCard
              imageUrl="https://images.unsplash.com/photo-1495072667656-424d680e6299"
              title="Milford Sound"
              location="Fiordland"
              rarity="epic"
              isPreview={true}
            />
          </div>
          <div className="w-full">
            <CollectibleCard
              imageUrl="https://images.unsplash.com/photo-1542243337-8a2c60753f6e"
              title="Cathedral Cove"
              location="Coromandel"
              rarity="rare"
              isPreview={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};