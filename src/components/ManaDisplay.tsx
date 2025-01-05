import { Sparkles } from 'lucide-react';

interface ManaDisplayProps {
  amount: number;
  className?: string;
}

export const ManaDisplay = ({ amount, className = "" }: ManaDisplayProps) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Sparkles className="w-4 h-4 text-blue-400" />
      <span>{amount}</span>
    </div>
  );
};