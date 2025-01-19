import { Button } from "@/components/ui/button";

interface ManaDisplayProps {
  manaValue: number;
  onSell: () => void;
  cardTitle: string;
}

export const ManaDisplay = ({ manaValue, onSell, cardTitle }: ManaDisplayProps) => {
  return (
    <Button
      onClick={onSell}
      className="absolute top-2 left-4 z-30 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white border-none flex items-center gap-2 transition-all duration-300"
    >
      <img 
        src="/lovable-uploads/75d6637e-1062-4fd8-b272-34dbb7e63acc.png" 
        alt="Mana" 
        className="w-5 h-5 object-contain"
      />
      {manaValue}
    </Button>
  );
};