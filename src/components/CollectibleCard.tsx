import { useState } from 'react';
import { motion } from 'framer-motion';

interface CollectibleCardProps {
  imageUrl: string;
  title: string;
  location: string;
  rarity: string;
  collectedAt: string;
}

export const CollectibleCard = ({ imageUrl, title, location, rarity, collectedAt }: CollectibleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const rarityColors = {
    legendary: 'bg-yellow-500/80',
    epic: 'bg-purple-500/80',
    rare: 'bg-blue-500/80',
    common: 'bg-gray-500/80',
  };

  return (
    <motion.div
      className="relative w-72 h-96 rounded-xl overflow-hidden cursor-pointer perspective-1000"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-black/20 z-10" />
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300"
        style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className={`inline-block px-2 py-1 text-xs font-medium text-white ${rarityColors[rarity as keyof typeof rarityColors]} rounded-full`}>
            {rarity}
          </span>
          <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-nzgreen-500/80 rounded-full">
            {location}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-300">Collected on {collectedAt}</p>
      </div>
    </motion.div>
  );
};