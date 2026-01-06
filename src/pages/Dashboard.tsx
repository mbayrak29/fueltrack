import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Fuel, TrendingDown, MapPin } from 'lucide-react';
import { useEvStations } from '@/hooks/useEvStations';
import { useFuelStations, FuelStation } from '@/hooks/useFuelStations';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Helper function to get cheapest station for a fuel type
function getCheapestForType(stations: FuelStation[], fuelType: string): { station: FuelStation; price: number } | null {
  let cheapest: { station: FuelStation; price: number } | null = null;
  
  for (const station of stations) {
    const option = station.fuel_options.find(o => o.fuel_type === fuelType);
    if (option) {
      const price = Number(option.price_per_liter);
      if (!cheapest || price < cheapest.price) {
        cheapest = { station, price };
      }
    }
  }
  
  return cheapest;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: evStations = [] } = useEvStations();
  const { data: fuelStations = [] } = useFuelStations();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || '';

  const cheapestEv = evStations.length > 0
    ? evStations.reduce((min, s) => Number(s.price_per_kwh) < Number(min.price_per_kwh) ? s : min)
    : null;

  const cheapestGasoline = getCheapestForType(fuelStations, 'gasoline');
  const cheapestDiesel = getCheapestForType(fuelStations, 'diesel');
  const cheapestLpg = getCheapestForType(fuelStations, 'lpg');

  const avgEvPrice = evStations.length > 0
    ? (evStations.reduce((sum, s) => sum + Number(s.price_per_kwh), 0) / evStations.length).toFixed(4)
    : '0.00';

  // Calculate average fuel price across all fuel options
  const allFuelOptions = fuelStations.flatMap(s => s.fuel_options);
  const avgFuelPrice = allFuelOptions.length > 0
    ? (allFuelOptions.reduce((sum, o) => sum + Number(o.price_per_liter), 0) / allFuelOptions.length).toFixed(2)
    : '0.00';

  return (
    <AppLayout>
      <PageHeader 
        title={`Welcome back${displayName ? ', ' + displayName : ''}!`}
        description="Your unified fuel and EV charging price tracker"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="EV Stations"
          value={evStations.length}
          subtitle="Tracked stations"
          icon={<Zap className="h-5 w-5" />}
          variant="ev"
        />
        <StatCard
          title="Fuel Stations"
          value={fuelStations.length}
          subtitle="Tracked stations"
          icon={<Fuel className="h-5 w-5" />}
          variant="fuel"
        />
        <StatCard
          title="Avg. EV Price"
          value={`₺${avgEvPrice}/kWh`}
          subtitle="Across all stations"
          icon={<TrendingDown className="h-5 w-5" />}
          variant="default"
        />
        <StatCard
          title="Avg. Fuel Price"
          value={`₺${avgFuelPrice}/L`}
          subtitle="Across all stations"
          icon={<TrendingDown className="h-5 w-5" />}
          variant="default"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-display">
              <Zap className="h-5 w-5 text-ev" />
              Cheapest EV Charging
            </CardTitle>
            <Link to="/ev-stations">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {cheapestEv ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{cheapestEv.station_name}</p>
                    <p className="text-sm text-muted-foreground">{cheapestEv.provider}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-ev">
                      ₺{Number(cheapestEv.price_per_kwh).toFixed(4)}
                    </p>
                    <p className="text-sm text-muted-foreground">per kWh</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {cheapestEv.city}, {cheapestEv.district}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No EV stations added yet</p>
                <Link to="/ev-stations/add">
                  <Button variant="outline" size="sm" className="mt-3">Add Station</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-display">
              <Fuel className="h-5 w-5 text-fuel" />
              Cheapest Fuel Prices
            </CardTitle>
            <Link to="/fuel-stations">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {cheapestGasoline || cheapestDiesel || cheapestLpg ? (
              <div className="space-y-3">
                {cheapestGasoline && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-fuel-light">
                    <div>
                      <p className="font-medium">{cheapestGasoline.station.station_name}</p>
                      <p className="text-sm text-muted-foreground">Gasoline</p>
                    </div>
                    <p className="text-xl font-display font-bold text-fuel">
                      ₺{cheapestGasoline.price.toFixed(2)}/L
                    </p>
                  </div>
                )}
                {cheapestDiesel && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <p className="font-medium">{cheapestDiesel.station.station_name}</p>
                      <p className="text-sm text-muted-foreground">Diesel</p>
                    </div>
                    <p className="text-xl font-display font-bold text-foreground">
                      ₺{cheapestDiesel.price.toFixed(2)}/L
                    </p>
                  </div>
                )}
                {cheapestLpg && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                    <div>
                      <p className="font-medium">{cheapestLpg.station.station_name}</p>
                      <p className="text-sm text-muted-foreground">LPG</p>
                    </div>
                    <p className="text-xl font-display font-bold text-success">
                      ₺{cheapestLpg.price.toFixed(2)}/L
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Fuel className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No fuel stations added yet</p>
                <Link to="/fuel-stations/add">
                  <Button variant="outline" size="sm" className="mt-3">Add Station</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link to="/ev-stations/add" className="block">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:bg-ev-light hover:border-ev">
                  <Zap className="h-6 w-6 text-ev" />
                  <span>Add EV Station</span>
                </Button>
              </Link>
              <Link to="/fuel-stations/add" className="block">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:bg-fuel-light hover:border-fuel">
                  <Fuel className="h-6 w-6 text-fuel" />
                  <span>Add Fuel Station</span>
                </Button>
              </Link>
              <Link to="/compare" className="block">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <TrendingDown className="h-6 w-6 text-primary" />
                  <span>Compare Prices</span>
                </Button>
              </Link>
              <Link to="/profile" className="block">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                  <span>View Profile</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
