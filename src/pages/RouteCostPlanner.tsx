import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Fuel, Calculator, Route, Star, Zap } from 'lucide-react';
import { getCityList, getDistance, CityName } from '@/lib/cityDistances';

type VehicleType = 'gasoline' | 'diesel' | 'lpg' | 'ev';

interface FuelStop {
  id: number;
  name: string;
  brand: string;
  distance: number;
  price: number;
  isBestPrice: boolean;
}

interface RouteResult {
  totalDistance: number;
  fuelNeeded: number;
  totalCost: number;
  fuelType: VehicleType;
  stops: FuelStop[];
}

// Mock fuel prices by brand
const mockFuelPrices: Record<string, Record<string, number>> = {
  gasoline: {
    'Shell': 42.85,
    'BP': 42.50,
    'Petrol Ofisi': 41.90,
    'Opet': 42.15,
  },
  diesel: {
    'Shell': 44.20,
    'BP': 43.95,
    'Petrol Ofisi': 43.40,
    'Opet': 43.75,
  },
  lpg: {
    'Shell': 18.50,
    'BP': 18.25,
    'Petrol Ofisi': 17.90,
    'Opet': 18.10,
  },
  ev: {
    'Tesla Supercharger': 4.50,
    'Trugo': 5.20,
    'ZES': 4.80,
    'Eşarj': 5.00,
  },
};

// Average consumption values
const defaultConsumption: Record<VehicleType, number> = {
  gasoline: 7.5,  // L/100km
  diesel: 6.0,    // L/100km
  lpg: 10.0,      // L/100km
  ev: 18.0,       // kWh/100km
};

const vehicleTypeLabels: Record<VehicleType, string> = {
  gasoline: 'Gasoline',
  diesel: 'Diesel',
  lpg: 'LPG',
  ev: 'Electric (EV)',
};

const consumptionUnits: Record<VehicleType, string> = {
  gasoline: 'L/100km',
  diesel: 'L/100km',
  lpg: 'L/100km',
  ev: 'kWh/100km',
};

export default function RouteCostPlanner() {
  const [startCity, setStartCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType | ''>('');
  const [consumption, setConsumption] = useState('');
  const [result, setResult] = useState<RouteResult | null>(null);
  const [error, setError] = useState('');

  const cities = getCityList();

  const handleVehicleTypeChange = (type: VehicleType) => {
    setVehicleType(type);
    setConsumption(defaultConsumption[type].toString());
  };

  const calculateRoute = () => {
    setError('');
    
    if (!startCity || !destinationCity || !vehicleType || !consumption) {
      setError('Please fill in all fields');
      return;
    }

    if (startCity === destinationCity) {
      setError('Start and destination cities must be different');
      return;
    }

    const distance = getDistance(startCity, destinationCity);
    if (distance === null) {
      setError('Distance data not available for this route');
      return;
    }

    const consumptionValue = parseFloat(consumption);
    const fuelNeeded = (distance * consumptionValue) / 100;

    const prices = mockFuelPrices[vehicleType];
    const brands = Object.keys(prices);
    
    // Find best price
    const bestBrand = brands.reduce((a, b) => prices[a] < prices[b] ? a : b);
    
    // Generate mock stops along the route
    const stops: FuelStop[] = brands.map((brand, index) => ({
      id: index + 1,
      name: `${brand} - ${startCity} Highway`,
      brand,
      distance: Math.floor((distance / brands.length) * (index + 0.5)),
      price: prices[brand],
      isBestPrice: brand === bestBrand,
    }));

    // Calculate total cost using best price
    const bestPrice = prices[bestBrand];
    const totalCost = fuelNeeded * bestPrice;

    setResult({
      totalDistance: distance,
      fuelNeeded: Math.round(fuelNeeded * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      fuelType: vehicleType,
      stops: stops.sort((a, b) => a.distance - b.distance),
    });
  };

  const isEv = vehicleType === 'ev';
  const unitLabel = isEv ? 'kWh' : 'liters';
  const priceLabel = isEv ? 'per kWh' : 'per liter';

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Route Cost Planner"
          description="Calculate the most cost-effective trip between Turkish cities"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start City</Label>
                  <Select value={startCity} onValueChange={setStartCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city} disabled={city === destinationCity}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Destination City</Label>
                  <Select value={destinationCity} onValueChange={setDestinationCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city} disabled={city === startCity}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {startCity && destinationCity && startCity !== destinationCity && (
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-sm text-muted-foreground">Estimated Distance</p>
                  <p className="text-2xl font-bold text-primary">
                    {getDistance(startCity, destinationCity)} km
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Vehicle / Fuel Type</Label>
                <Select 
                  value={vehicleType} 
                  onValueChange={(v) => handleVehicleTypeChange(v as VehicleType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">
                      <span className="flex items-center gap-2">
                        <Fuel className="h-4 w-4" /> Gasoline
                      </span>
                    </SelectItem>
                    <SelectItem value="diesel">
                      <span className="flex items-center gap-2">
                        <Fuel className="h-4 w-4" /> Diesel
                      </span>
                    </SelectItem>
                    <SelectItem value="lpg">
                      <span className="flex items-center gap-2">
                        <Fuel className="h-4 w-4" /> LPG
                      </span>
                    </SelectItem>
                    <SelectItem value="ev">
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Electric (EV)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Vehicle Consumption ({vehicleType ? consumptionUnits[vehicleType] : 'L/100km'})
                </Label>
                <div className="relative">
                  {isEv ? (
                    <Zap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  ) : (
                    <Fuel className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                  <Input
                    type="number"
                    placeholder={vehicleType ? `e.g., ${defaultConsumption[vehicleType]}` : 'e.g., 7.5'}
                    className="pl-10"
                    value={consumption}
                    onChange={(e) => setConsumption(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button 
                className="w-full mt-4" 
                onClick={calculateRoute}
                disabled={!startCity || !destinationCity || !vehicleType || !consumption}
              >
                <Route className="h-4 w-4 mr-2" />
                Calculate Route Cost
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-4">
            {result ? (
              <>
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Route className="h-5 w-5 text-primary" />
                      Route Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Badge className={isEv ? 'bg-ev text-ev-foreground' : 'bg-fuel text-fuel-foreground'}>
                        {vehicleTypeLabels[result.fuelType]}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{result.totalDistance}</p>
                        <p className="text-sm text-muted-foreground">km total</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{result.fuelNeeded}</p>
                        <p className="text-sm text-muted-foreground">{unitLabel} needed</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">₺{result.totalCost}</p>
                        <p className="text-sm text-muted-foreground">estimated cost</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {isEv ? (
                        <Zap className="h-5 w-5 text-ev" />
                      ) : (
                        <Fuel className="h-5 w-5 text-fuel" />
                      )}
                      Recommended {isEv ? 'Charging' : 'Fuel'} Stops
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.stops.map((stop) => (
                      <div
                        key={stop.id}
                        className={`p-4 rounded-lg border ${
                          stop.isBestPrice 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{stop.name}</h4>
                              {stop.isBestPrice && (
                                <Badge className="bg-primary text-primary-foreground">
                                  <Star className="h-3 w-3 mr-1" />
                                  Stop Here for Best Price
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {stop.distance} km from start
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">₺{stop.price.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{priceLabel}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground text-center">
                  * Demo data only. Prices and distances are for illustration purposes.
                </p>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[300px]">
                <div className="text-center text-muted-foreground">
                  <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select start and destination cities,</p>
                  <p>then click "Calculate Route Cost"</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
