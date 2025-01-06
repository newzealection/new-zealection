import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterControlsProps {
  sortBy: 'rarity' | 'location' | 'collected';
  setSortBy: (value: 'rarity' | 'location' | 'collected') => void;
  filterRarity: string;
  setFilterRarity: (value: string) => void;
  filterLocation: string;
  setFilterLocation: (value: string) => void;
  locations: Set<string>;
}

export const FilterControls = ({
  sortBy,
  setSortBy,
  filterRarity,
  setFilterRarity,
  filterLocation,
  setFilterLocation,
  locations,
}: FilterControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
      <Select value={sortBy} onValueChange={(value: 'rarity' | 'location' | 'collected') => setSortBy(value)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rarity">Sort by Rarity</SelectItem>
          <SelectItem value="location">Sort by Location</SelectItem>
          <SelectItem value="collected">Sort by Collection Date</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterRarity} onValueChange={setFilterRarity}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by rarity..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Rarities</SelectItem>
          <SelectItem value="legendary">Legendary</SelectItem>
          <SelectItem value="epic">Epic</SelectItem>
          <SelectItem value="rare">Rare</SelectItem>
          <SelectItem value="common">Common</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterLocation} onValueChange={setFilterLocation}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by location..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {Array.from(locations).map(location => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};