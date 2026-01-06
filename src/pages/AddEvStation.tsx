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
import { Loader2, Zap } from 'lucide-react';
import { useCreateEvStation } from '@/hooks/useEvStations';

const providers = ['Tesla', 'Trugo', 'ZES', 'Eşarj', 'Sharz', 'Voltrun', 'Powersarj', 'Other'];
const chargerTypes = ['DC Fast', 'AC Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'];
const cities = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep'];

export default function AddEvStation() {
  const navigate = useNavigate();
  const createStation = useCreateEvStation();
  
  const [formData, setFormData] = useState({
    station_name: '',
    provider: '',
    city: '',
    district: '',
    address: '',
    price_per_kwh: '',
    charger_type: 'DC Fast',
    power_kw: '50',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createStation.mutateAsync({
      station_name: formData.station_name,
      provider: formData.provider,
      city: formData.city,
      district: formData.district,
      address: formData.address || undefined,
      price_per_kwh: parseFloat(formData.price_per_kwh),
      charger_type: formData.charger_type,
      power_kw: parseInt(formData.power_kw),
      notes: formData.notes || undefined,
    });

    navigate('/ev-stations');
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Add EV Station"
        description="Add a new EV charging station to track"
      />

      <Card className="max-w-2xl shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-ev">
              <Zap className="h-4 w-4 text-ev-foreground" />
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
                  placeholder="e.g., Mall of Istanbul"
                  value={formData.station_name}
                  onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider *</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
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
                  placeholder="e.g., Başakşehir"
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price_per_kwh">Price per kWh (₺) *</Label>
                <Input
                  id="price_per_kwh"
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="e.g., 7.5000"
                  value={formData.price_per_kwh}
                  onChange={(e) => setFormData({ ...formData, price_per_kwh: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="charger_type">Charger Type</Label>
                <Select
                  value={formData.charger_type}
                  onValueChange={(value) => setFormData({ ...formData, charger_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chargerTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="power_kw">Power (kW)</Label>
                <Input
                  id="power_kw"
                  type="number"
                  min="1"
                  placeholder="e.g., 50"
                  value={formData.power_kw}
                  onChange={(e) => setFormData({ ...formData, power_kw: e.target.value })}
                />
              </div>
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
                onClick={() => navigate('/ev-stations')}
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
