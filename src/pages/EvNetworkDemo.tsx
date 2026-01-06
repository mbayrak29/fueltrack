import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, MapPin, Clock, Battery } from 'lucide-react';

interface EvStation {
  id: number;
  brand: string;
  location: string;
  pricePerKwh: number;
  chargingSpeed: number;
  availability: 'available' | 'busy' | 'offline';
  connectorTypes: string[];
}

const mockEvStations: EvStation[] = [
  {
    id: 1,
    brand: 'Tesla Supercharger',
    location: 'Zorlu Center, Beşiktaş',
    pricePerKwh: 8.50,
    chargingSpeed: 250,
    availability: 'available',
    connectorTypes: ['Tesla', 'CCS'],
  },
  {
    id: 2,
    brand: 'Trugo',
    location: 'Kadıköy Marina',
    pricePerKwh: 7.25,
    chargingSpeed: 150,
    availability: 'available',
    connectorTypes: ['CCS', 'CHAdeMO'],
  },
  {
    id: 3,
    brand: 'ZES',
    location: 'Beşiktaş Square',
    pricePerKwh: 6.90,
    chargingSpeed: 120,
    availability: 'busy',
    connectorTypes: ['CCS', 'Type 2'],
  },
  {
    id: 4,
    brand: 'Eşarj',
    location: 'Ataşehir Business District',
    pricePerKwh: 7.00,
    chargingSpeed: 180,
    availability: 'available',
    connectorTypes: ['CCS', 'CHAdeMO', 'Type 2'],
  },
  {
    id: 5,
    brand: 'Tesla Supercharger',
    location: 'Istinye Park Mall',
    pricePerKwh: 8.50,
    chargingSpeed: 250,
    availability: 'offline',
    connectorTypes: ['Tesla', 'CCS'],
  },
  {
    id: 6,
    brand: 'Trugo',
    location: 'Levent Metro Station',
    pricePerKwh: 7.25,
    chargingSpeed: 150,
    availability: 'available',
    connectorTypes: ['CCS', 'CHAdeMO'],
  },
];

const getAvailabilityColor = (availability: string) => {
  switch (availability) {
    case 'available':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'busy':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'offline':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getBrandColor = (brand: string) => {
  if (brand.includes('Tesla')) return 'from-red-500/20 to-red-600/10';
  if (brand.includes('Trugo')) return 'from-blue-500/20 to-blue-600/10';
  if (brand.includes('ZES')) return 'from-orange-500/20 to-orange-600/10';
  if (brand.includes('Eşarj')) return 'from-green-500/20 to-green-600/10';
  return 'from-primary/20 to-primary/10';
};

export default function EvNetworkDemo() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="EV Charging Demo Network"
          description="Explore our unified EV charging network with real brand examples"
        />

        <div className="flex items-center justify-center">
          <Badge variant="outline" className="text-sm px-4 py-1">
            Demo / Example Data — Not Real-Time
          </Badge>
        </div>

        {/* Map-style Layout */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-ev/10 to-ev/5">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-ev" />
              Istanbul EV Charging Map View
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative bg-gradient-to-br from-muted/50 to-muted h-[300px] flex items-center justify-center">
              {/* Mock map visualization */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-6 grid-rows-4 h-full gap-1 p-4">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="bg-primary/20 rounded" />
                  ))}
                </div>
              </div>
              
              {/* Station markers */}
              {mockEvStations.slice(0, 4).map((station, index) => (
                <div
                  key={station.id}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${20 + (index % 2) * 40 + Math.random() * 10}%`,
                    top: `${20 + Math.floor(index / 2) * 40 + Math.random() * 10}%`,
                  }}
                >
                  <div className={`p-2 rounded-full bg-gradient-to-br ${getBrandColor(station.brand)} border-2 border-ev shadow-lg`}>
                    <Zap className="h-5 w-5 text-ev" />
                  </div>
                  <span className="text-xs mt-1 bg-background/90 px-2 py-0.5 rounded shadow">
                    {station.brand.split(' ')[0]}
                  </span>
                </div>
              ))}
              
              <div className="z-10 text-center bg-background/80 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-muted-foreground text-sm">Interactive map visualization</p>
                <p className="text-xs text-muted-foreground">(Demo UI only)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Station List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockEvStations.map((station) => (
            <Card key={station.id} className={`overflow-hidden transition-all hover:shadow-md`}>
              <div className={`h-2 bg-gradient-to-r ${getBrandColor(station.brand)}`} />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-4 w-4 text-ev" />
                      {station.brand}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {station.location}
                    </p>
                  </div>
                  <Badge className={getAvailabilityColor(station.availability)}>
                    {station.availability}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-ev/10">
                      <Battery className="h-4 w-4 text-ev" />
                    </div>
                    <div>
                      <p className="font-semibold">₺{station.pricePerKwh.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">per kWh</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-ev/10">
                      <Clock className="h-4 w-4 text-ev" />
                    </div>
                    <div>
                      <p className="font-semibold">{station.chargingSpeed} kW</p>
                      <p className="text-xs text-muted-foreground">max speed</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {station.connectorTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          * Demo / Example Data — Brand names are used for illustration purposes only. 
          No real-time data or official partnerships implied.
        </p>
      </div>
    </AppLayout>
  );
}
