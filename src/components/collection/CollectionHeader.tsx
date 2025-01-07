import { motion } from 'framer-motion';

interface CollectionHeaderProps {
  userMana: number | undefined;
}

export const CollectionHeader = ({ userMana }: CollectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Collection</h1>
      <div className="bg-nzgreen-500/10 px-4 py-2 rounded-lg flex items-center gap-2">
        <span className="text-lg font-semibold text-nzgreen-700 flex items-center gap-2">
          <img 
            src="/lovable-uploads/75d6637e-1062-4fd8-b272-34dbb7e63acc.png" 
            alt="Mana" 
            className="w-5 h-5 object-contain"
          />
          {userMana ?? 0}
        </span>
      </div>
    </div>
  );
};