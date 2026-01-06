import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Fuel, Plus, X } from 'lucide-react';
import { useCreateFuelStation } from '@/hooks/useFuelStations';

const brands = ['Shell', 'BP', 'Opet', 'Petrol Ofisi', 'Total', 'Lukoil', 'TP', 'Aytemiz', 'Other'];
const fuelTypes = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'lpg', label: 'LPG' },
] as const;
const cities = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Eskisehir', 'Kayseri', 'Samsun', 'Trabzon', 'Diyarbakir', 'Erzurum'];

interface FuelOptionInput {
  fuel_type: 'gasoline' | 'diesel' | 'lpg';
  price_per_liter: string;
}

export default function AddFuelStation() {
  const navigate = useNavigate();
  const createStation = useCreateFuelStation();
  
  const [formData, setFormData] = useState({
    station_name: '',
    brand: '',
    city: '',
    district: '',
    address: '',
    notes: '',
  });

  const [fuelOptions, setFuelOptions] = useState<FuelOptionInput[]>([
    { fuel_type: 'gasoline', price_per_liter: '' }
  ]);

  const addFuelOption = () => {
    const usedTypes = fuelOptions.map(o => o.fuel_type);
    const availableType = fuelTypes.find(t => !usedTypes.includes(t.value));
    if (availableType) {
      setFuelOptions([...fuelOptions, { fuel_type: availableType.value, price_per_liter: '' }]);
    }
  };

  const removeFuelOption = (index: number) => {
    if (fuelOptions.length > 1) {
      setFuelOptions(fuelOptions.filter((_, i) => i !== index));
    }
  };

  const updateFuelOption = (index: number, field: keyof FuelOptionInput, value: string) => {
    const updated = [...fuelOptions];
    if (field === 'fuel_type') {
      updated[index].fuel_type = value as 'gasoline' | 'diesel' | 'lpg';
    } else {
      updated[index].price_per_liter = value;
    }
    setFuelOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validFuelOptions = fuelOptions.filter(o => o.price_per_liter);
    if (validFuelOptions.length === 0) return;

    await createStation.mutateAsync({
      station_name: formData.station_name,
      brand: formData.brand,
      city: formData.city,
      district: formData.district,
      address: formData.address || undefined,
      notes: formData.notes || undefined,
      fuel_options: validFuelOptions.map(o => ({
        fuel_type: o.fuel_type,
        price_per_liter: parseFloat(o.price_per_liter),
      })),
    });

    navigate('/fuel-stations');
  };

  const usedFuelTypes = fuelOptions.map(o => o.fuel_type);

  return (
    <AppLayout>
      <PageHeader 
        title="Add Fuel Station"
        description="Add a new fuel station to track"
      />

      <Card className="max-w-2xl shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-fuel">
              <Fuel className="h-4 w-4 text-fuel-foreground" />
            </div>
            Station Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="station_name">Station Name *</Label>
                <Input
                  id="station_name"
                  placeholder="e.g., Shell Kadıköy"
                  value={formData.station_name}
                  onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => setFormData({ ...formData, brand: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  placeholder="e.g., Kadıköy"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                placeholder="Street address (optional)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Fuel Types Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Fuel Types & Prices *</Label>
                {fuelOptions.length < 3 && (
                  <Button type="button" variant="outline" size="sm" onClick={addFuelOption} className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Fuel Type
                  </Button>
                )}
              </div>
              
              {fuelOptions.map((option, index) => (
                <div key={index} className="flex gap-4 items-end p-4 rounded-lg bg-muted/50">
                  <div className="flex-1 space-y-2">
                    <Label>Fuel Type</Label>
                    <Select
                      value={option.fuel_type}
                      onValueChange={(value) => updateFuelOption(index, 'fuel_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((t) => (
                          <SelectItem 
                            key={t.value} 
                            value={t.value}
                            disabled={usedFuelTypes.includes(t.value) && option.fuel_type !== t.value}
                          >
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Price per Liter (₺)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 45.50"
                      value={option.price_per_liter}
                      onChange={(e) => updateFuelOption(index, 'price_per_liter', e.target.value)}
                      required
                    />
                  </div>
                  {fuelOptions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFuelOption(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/fuel-stations')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createStation.isPending}>
                {createStation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Station'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
