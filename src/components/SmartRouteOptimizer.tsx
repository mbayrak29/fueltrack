import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Navigation, 
  MapPin, 
  Fuel, 
  Calculator, 
  Route, 
  CheckCircle2,
  Car,
  TrendingDown
} from 'lucide-react';

// Mock route data
const MOCK_ROUTES = [
  { from: 'istanbul', to: 'ankara', distance: 450, duration: '5h 30m' },
  { from: 'istanbul', to: 'izmir', distance: 480, duration: '5h 45m' },
  { from: 'ankara', to: 'izmir', distance: 580, duration: '6h 30m' },
  { from: 'istanbul', to: 'bursa', distance: 150, duration: '2h 15m' },
  { from: 'ankara', to: 'antalya', distance: 480, duration: '5h 45m' },
];

// Mock fuel stations along routes
const MOCK_STATIONS = [
  { id: 1, name: 'Shell Highway Station', location: 'Bolu', pricePerLiter: 42.50, distanceFromStart: 180 },
  { id: 2, name: 'BP Express', location: 'Düzce', pricePerLiter: 43.20, distanceFromStart: 120 },
  { id: 3, name: 'Total Energy', location: 'Sakarya', pricePerLiter: 41.80, distanceFromStart: 90 },
  { id: 4, name: 'Opet Service', location: 'Eskişehir', pricePerLiter: 42.00, distanceFromStart: 280 },
  { id: 5, name: 'Petrol Ofisi', location: 'Kütahya', pricePerLiter: 41.50, distanceFromStart: 350 },
];

export function SmartRouteOptimizer() {
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [fuelConsumption, setFuelConsumption] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);

  const routeData = useMemo(() => {
    if (!currentLocation || !destination) return null;
    
    const fromNormalized = currentLocation.toLowerCase().trim();
    const toNormalized = destination.toLowerCase().trim();
    
    // Find matching route or generate mock data
    const matchedRoute = MOCK_ROUTES.find(
      r => (r.from.includes(fromNormalized) || fromNormalized.includes(r.from)) &&
           (r.to.includes(toNormalized) || toNormalized.includes(r.to))
    ) || MOCK_ROUTES.find(
      r => (r.to.includes(fromNormalized) || fromNormalized.includes(r.to)) &&
           (r.from.includes(toNormalized) || toNormalized.includes(r.from))
    );

    if (matchedRoute) {
      return matchedRoute;
    }

    // Generate random mock data for unmatched routes
    const distance = Math.floor(Math.random() * 400) + 100;
    const hours = Math.floor(distance / 80);
    const minutes = Math.floor((distance % 80) / 80 * 60);
    return {
      from: currentLocation,
      to: destination,
      distance,
      duration: `${hours}h ${minutes}m`
    };
  }, [currentLocation, destination]);

  const calculations = useMemo(() => {
    if (!routeData || !fuelConsumption || Number(fuelConsumption) <= 0) return null;

    const consumption = Number(fuelConsumption);
    const totalFuelNeeded = (routeData.distance * consumption) / 100;
    
    // Find the cheapest station along the route
    const cheapestStation = [...MOCK_STATIONS].sort((a, b) => a.pricePerLiter - b.pricePerLiter)[0];
    const averagePrice = MOCK_STATIONS.reduce((sum, s) => sum + s.pricePerLiter, 0) / MOCK_STATIONS.length;
    
    const estimatedCostCheapest = totalFuelNeeded * cheapestStation.pricePerLiter;
    const estimatedCostAverage = totalFuelNeeded * averagePrice;
    const savings = estimatedCostAverage - estimatedCostCheapest;

    // Get recommended stops (cheapest 2 stations)
    const recommendedStops = [...MOCK_STATIONS]
      .sort((a, b) => a.pricePerLiter - b.pricePerLiter)
      .slice(0, 2);

    return {
      totalFuelNeeded: totalFuelNeeded.toFixed(1),
      estimatedCost: estimatedCostCheapest.toFixed(2),
      savings: savings.toFixed(2),
      recommendedStops,
      averagePrice: averagePrice.toFixed(2)
    };
  }, [routeData, fuelConsumption]);

  const handleCalculate = () => {
    if (currentLocation && destination && fuelConsumption) {
      setIsCalculated(true);
    }
  };

  const handleReset = () => {
    setCurrentLocation('');
    setDestination('');
    setFuelConsumption('');
    setIsCalculated(false);
  };

  return (
    <Card className="shadow-card border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 font-display text-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Navigation className="h-5 w-5" />
          </div>
          Smart Route & Fuel Optimization
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Plan your journey and find the most cost-effective fuel stops
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="current-location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-success" />
              Current Location
            </Label>
            <Input
              id="current-location"
              placeholder="e.g., Istanbul"
              value={currentLocation}
              onChange={(e) => {
                setCurrentLocation(e.target.value);
                setIsCalculated(false);
              }}
              className="bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-destructive" />
              Destination
            </Label>
            <Input
              id="destination"
              placeholder="e.g., Ankara"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setIsCalculated(false);
              }}
              className="bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fuel-consumption" className="flex items-center gap-2">
              <Car className="h-4 w-4 text-fuel" />
              Fuel Consumption (L/100km)
            </Label>
            <Input
              id="fuel-consumption"
              type="number"
              min="1"
              max="30"
              step="0.1"
              placeholder="e.g., 7.5"
              value={fuelConsumption}
              onChange={(e) => {
                setFuelConsumption(e.target.value);
                setIsCalculated(false);
              }}
              className="bg-background"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleCalculate}
            disabled={!currentLocation || !destination || !fuelConsumption}
            className="gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calculate Route
          </Button>
          {isCalculated && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>

        {/* Results Section */}
        {isCalculated && routeData && calculations && (
          <>
            <Separator />
            
            {/* Route Summary */}
            <div className="rounded-xl bg-muted/50 p-4 space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Route className="h-5 w-5 text-primary" />
                Route Summary
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-background p-3 text-center">
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {routeData.distance} km
                  </p>
                </div>
                <div className="rounded-lg bg-background p-3 text-center">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {routeData.duration}
                  </p>
                </div>
                <div className="rounded-lg bg-background p-3 text-center">
                  <p className="text-sm text-muted-foreground">Fuel Needed</p>
                  <p className="text-2xl font-display font-bold text-fuel">
                    {calculations.totalFuelNeeded} L
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="rounded-xl bg-success/10 border border-success/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-medium text-success">
                  <TrendingDown className="h-5 w-5" />
                  Estimated Fuel Cost
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success">
                  Save ₺{calculations.savings}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold text-success">
                  ₺{calculations.estimatedCost}
                </span>
                <span className="text-muted-foreground">
                  (at best station)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                vs. ₺{(Number(calculations.totalFuelNeeded) * Number(calculations.averagePrice)).toFixed(2)} at average price
              </p>
            </div>

            {/* Recommended Stops */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Fuel className="h-5 w-5 text-fuel" />
                Recommended Fuel Stops
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {calculations.recommendedStops.map((station, index) => (
                  <div 
                    key={station.id}
                    className="relative rounded-xl border-2 border-fuel/30 bg-fuel-light p-4 hover:border-fuel/50 transition-colors"
                  >
                    <Badge 
                      className="absolute -top-2 -right-2 bg-fuel text-fuel-foreground"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Stop Here
                    </Badge>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuel text-fuel-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{station.name}</p>
                          <p className="text-sm text-muted-foreground">{station.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-fuel/20">
                        <span className="text-sm text-muted-foreground">
                          {station.distanceFromStart} km from start
                        </span>
                        <span className="text-xl font-display font-bold text-fuel">
                          ₺{station.pricePerLiter.toFixed(2)}/L
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
