import { useState } from 'react';
import { motion } from 'framer-motion';

interface CollectibleCardProps {
  imageUrl: string;
  title: string;
  location: string;
}

export const CollectibleCard = ({ imageUrl, title, location }: CollectibleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

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
        <span className="inline-block px-2 py-1 mb-2 text-xs font-medium text-white bg-nzgreen-500/80 rounded-full">
          {location}
        </span>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
    </motion.div>
  );
};