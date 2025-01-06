import { format } from 'date-fns';
import { CollectibleCard } from '@/components/CollectibleCard';
import { ManaDisplay } from '@/components/ManaDisplay';

interface CardGridProps {
  cards: any[];
  onSellCard: (cardId: string, rarity: string) => void;
  getManaValue: (rarity: string) => number;
}

export const CardGrid = ({ cards, onSellCard, getManaValue }: CardGridProps) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No cards match your current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {cards.map((userCard) => (
        <div key={userCard.unique_card_id} className="relative">
          <CollectibleCard
            imageUrl={userCard.cards.image_url}
            title={userCard.cards.title}
            location={userCard.cards.location}
            rarity={userCard.cards.rarity}
            collectedAt={format(new Date(userCard.collected_at), 'PPP')}
            uniqueCardId={userCard.unique_card_id}
            description={userCard.cards.description}
            showFlip={true}
          />
          <ManaDisplay
            manaValue={getManaValue(userCard.cards.rarity)}
            onSell={() => onSellCard(userCard.id, userCard.cards.rarity)}
            cardTitle={userCard.cards.title}
          />
        </div>
      ))}
    </div>
  );
};