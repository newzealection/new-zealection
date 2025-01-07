import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  manaValue?: number;
  onSell?: () => void;
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
  isPreview = false,
  manaValue,
  onSell
}: CollectibleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const handleSellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSell) {
      setShowConfirmDialog(true);
    }
  };

  return (
    <>
      <motion.div
        className="relative w-full sm:w-72 h-96 rounded-xl overflow-hidden cursor-pointer perspective-1000 mx-auto"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        style={{ transformStyle: 'preserve-3d', maxWidth: '100%' }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of card */}
          <div 
            className={`absolute inset-0 w-full h-full ${isFlipped ? 'backface-hidden opacity-0' : 'opacity-100'}`}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
          >
            <div className="absolute inset-0 bg-black/20 z-10" />
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
            />
            
            {/* Card details */}
            {!isPreview && uniqueCardId && (
              <div className="absolute top-2 right-2 z-20 bg-black/60 px-2 py-1 rounded text-xs font-mono text-white">
                {uniqueCardId}
              </div>
            )}

            {!isPreview && userName && (
              <div className="absolute top-2 left-2 z-20 bg-black/60 px-2 py-1 rounded text-xs text-white">
                {userName}
              </div>
            )}

            {/* Mana Display */}
            {manaValue !== undefined && onSell && (
              <button
                onClick={handleSellClick}
                className="absolute top-2 left-2 z-30 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white border-none flex items-center gap-2 transition-all duration-300 px-2 py-1 rounded"
              >
                <img 
                  src="/lovable-uploads/75d6637e-1062-4fd8-b272-34dbb7e63acc.png" 
                  alt="Mana" 
                  className="w-5 h-5 object-contain"
                />
                {manaValue}
              </button>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`inline-block px-2 py-1 text-xs font-medium text-white ${rarityColors[rarity as keyof typeof rarityColors]} rounded-full`}>
                  {rarity}
                </span>
                <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-nzgreen-500/80 rounded-full">
                  {location}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{title}</h3>
              {!isPreview && collectedAt && (
                <p className="text-xs sm:text-sm text-gray-300">Collected on {collectedAt}</p>
              )}
            </div>
          </div>

          {/* Back of card */}
          {showFlip && description && (
            <div 
              className={`absolute inset-0 p-6 ${isFlipped ? 'opacity-100' : 'opacity-0 backface-hidden'}`}
              style={{ 
                transform: 'rotateY(180deg)',
                backgroundImage: 'url(https://i.imghippo.com/files/rs5370hFA.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'opacity 0.3s ease-in-out'
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sell {title}? You will receive {manaValue} mana.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onSell) {
                  onSell();
                  setShowConfirmDialog(false);
                }
              }}
            >
              Confirm Sale
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};