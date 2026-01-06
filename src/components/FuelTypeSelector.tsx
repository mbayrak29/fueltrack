import { useFuelType } from '@/contexts/FuelTypeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Fuel } from 'lucide-react';

const fuelTypes = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'lpg', label: 'LPG' },
] as const;

export function FuelTypeSelector() {
  const { selectedFuelType, setSelectedFuelType } = useFuelType();

  return (
    <div className="flex items-center gap-2">
      <Fuel className="h-4 w-4 text-fuel" />
      <Select value={selectedFuelType} onValueChange={(v) => setSelectedFuelType(v as 'gasoline' | 'diesel' | 'lpg')}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fuelTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
