import { useState } from 'react';
import { motion } from 'framer-motion';

interface CollectibleCardProps {
  imageUrl: string;
  title: string;
  location: string;
  rarity: string;
  collectedAt?: string;
  uniqueCardId?: string;
  description?: string;
  userName?: string;
  showFlip?: boolean;
  isPreview?: boolean;
}

export const CollectibleCard = ({ 
  imageUrl, 
  title, 
  location, 
  rarity, 
  collectedAt,
  uniqueCardId,
  description,
  userName,
  showFlip = false,
  isPreview = false
}: CollectibleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const rarityColors = {
    legendary: 'bg-yellow-500/80',
    epic: 'bg-purple-500/80',
    rare: 'bg-blue-500/80',
    common: 'bg-gray-500/80',
  };

  const handleClick = () => {
    if (showFlip && description) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <motion.div
      className="relative w-72 h-96 rounded-xl overflow-hidden cursor-pointer perspective-1000"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        className="w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <div className={`absolute inset-0 ${isFlipped ? 'backface-hidden' : ''}`}>
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
          />
          
          {/* Card ID at top right - only show if not preview */}
          {!isPreview && uniqueCardId && (
            <div className="absolute top-2 right-2 z-20 bg-black/60 px-2 py-1 rounded text-xs font-mono text-white">
              {uniqueCardId}
            </div>
          )}

          {/* Username at top left if provided and not preview */}
          {!isPreview && userName && (
            <div className="absolute top-2 left-2 z-20 bg-black/60 px-2 py-1 rounded text-xs text-white">
              {userName}
            </div>
          )}

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
            {!isPreview && collectedAt && (
              <p className="text-sm text-gray-300">Collected on {collectedAt}</p>
            )}
          </div>
        </div>

        {/* Back of card */}
        {showFlip && description && (
          <div 
            className={`absolute inset-0 p-6 ${isFlipped ? '' : 'backface-hidden'}`}
            style={{ 
              transform: 'rotateY(180deg)',
              backgroundImage: 'url(https://i.imghippo.com/files/rs5370hFA.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-md bg-black/40" />
            
            <div className="relative h-full flex flex-col justify-center items-center text-white z-10">
              <h3 className="text-2xl font-bold mb-4">{title}</h3>
              <p className="text-center">{description}</p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
