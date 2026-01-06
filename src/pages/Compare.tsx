import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Zap, Fuel, TrendingDown, MapPin, Navigation } from 'lucide-react';
import { useEvStations } from '@/hooks/useEvStations';
import { useFuelStations, FuelStation } from '@/hooks/useFuelStations';
import { useFuelType } from '@/contexts/FuelTypeContext';
import { FuelTypeSelector } from '@/components/FuelTypeSelector';
import { SmartRouteOptimizer } from '@/components/SmartRouteOptimizer';

const fuelTypeLabels: Record<string, string> = {
  gasoline: 'Gasoline',
  diesel: 'Diesel',
  lpg: 'LPG',
};

// Helper to get price for a fuel type
function getPriceForType(station: FuelStation, fuelType: string): number | null {
  const option = station.fuel_options.find(o => o.fuel_type === fuelType);
  return option ? Number(option.price_per_liter) : null;
}

// Helper to get stations with specific fuel type
function getStationsWithType(stations: FuelStation[], fuelType: string): { station: FuelStation; price: number }[] {
  return stations
    .map(s => {
      const price = getPriceForType(s, fuelType);
      return price !== null ? { station: s, price } : null;
    })
    .filter((s): s is { station: FuelStation; price: number } => s !== null)
    .sort((a, b) => a.price - b.price);
}

export default function Compare() {
  const { data: evStations = [] } = useEvStations();
  const { data: fuelStations = [] } = useFuelStations();
  const { selectedFuelType } = useFuelType();

  const sortedEvStations = [...evStations].sort((a, b) => Number(a.price_per_kwh) - Number(b.price_per_kwh));

  // Get stations for each fuel type
  const gasolineStations = getStationsWithType(fuelStations, 'gasoline');
  const dieselStations = getStationsWithType(fuelStations, 'diesel');
  const lpgStations = getStationsWithType(fuelStations, 'lpg');

  // Get stations for selected fuel type
  const selectedStations = getStationsWithType(fuelStations, selectedFuelType);

  const evPriceRange = sortedEvStations.length > 0 
    ? { min: Number(sortedEvStations[0].price_per_kwh), max: Number(sortedEvStations[sortedEvStations.length - 1].price_per_kwh) }
    : null;

  const getPriceDiff = (stations: { station: FuelStation; price: number }[]) => {
    if (stations.length < 2) return null;
    const min = stations[0].price;
    const max = stations[stations.length - 1].price;
    return { diff: max - min, percentage: ((max - min) / min * 100).toFixed(1) };
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Price Comparison"
        description="Compare prices across all your tracked stations"
      />

      <Tabs defaultValue="route" className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="route" className="gap-2">
            <Navigation className="h-4 w-4" />
            Route Planner
          </TabsTrigger>
          <TabsTrigger value="ev" className="gap-2">
            <Zap className="h-4 w-4" />
            EV Charging
          </TabsTrigger>
          <TabsTrigger value="fuel" className="gap-2">
            <Fuel className="h-4 w-4" />
            Fuel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="route" className="space-y-6">
          <SmartRouteOptimizer />
        </TabsContent>

        <TabsContent value="ev" className="space-y-6">
          {evPriceRange && (
            <Card className="shadow-card bg-ev-light border-ev/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price Range</p>
                    <p className="text-2xl font-display font-bold text-ev">
                      ₺{evPriceRange.min.toFixed(4)} - ₺{evPriceRange.max.toFixed(4)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">per kWh</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Potential Savings</p>
                    <p className="text-xl font-display font-bold text-success flex items-center gap-1">
                      <TrendingDown className="h-5 w-5" />
                      ₺{(evPriceRange.max - evPriceRange.min).toFixed(4)}/kWh
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">EV Stations Ranked by Price</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedEvStations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No EV stations to compare</p>
              ) : (
                <div className="space-y-3">
                  {sortedEvStations.map((station, index) => (
                    <div key={station.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ev text-ev-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{station.station_name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {station.city} • {station.provider}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-display font-bold text-ev">
                          ₺{Number(station.price_per_kwh).toFixed(4)}
                        </p>
                        {index === 0 && (
                          <Badge className="bg-success text-success-foreground">Best Price</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-6">
          {/* Fuel Type Selector */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filter by Fuel Type</h3>
            <FuelTypeSelector />
          </div>

          {/* Summary Cards for Each Fuel Type */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Gasoline', stations: gasolineStations, color: 'fuel', type: 'gasoline' },
              { label: 'Diesel', stations: dieselStations, color: 'foreground', type: 'diesel' },
              { label: 'LPG', stations: lpgStations, color: 'success', type: 'lpg' },
            ].map(({ label, stations, color, type }) => {
              const diff = getPriceDiff(stations);
              const isSelected = type === selectedFuelType;
              return (
                <Card key={label} className={`shadow-card ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">{label}</p>
                    {stations.length > 0 ? (
                      <>
                        <p className={`text-xl font-display font-bold text-${color}`}>
                          ₺{stations[0].price.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">lowest price</p>
                        {diff && (
                          <p className="text-sm text-success mt-2 flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            Save up to ₺{diff.diff.toFixed(2)}/L
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No data</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Ranked List for Selected Fuel Type */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">
                {fuelTypeLabels[selectedFuelType]} Stations Ranked
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No stations with {fuelTypeLabels[selectedFuelType]} to compare
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedStations.map(({ station, price }, index) => (
                    <div key={station.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fuel text-fuel-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{station.station_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {station.city} • {station.brand}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-display font-bold text-fuel">
                          ₺{price.toFixed(2)}
                        </p>
                        {index === 0 && (
                          <Badge className="bg-success text-success-foreground">Best Price</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
