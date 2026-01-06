import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Fuel, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useFuelStation } from '@/hooks/useFuelStations';
import { format } from 'date-fns';

const fuelTypeLabels: Record<string, string> = {
  gasoline: 'Gasoline',
  diesel: 'Diesel',
  lpg: 'LPG',
};

const fuelTypeColors: Record<string, string> = {
  gasoline: 'bg-fuel text-fuel-foreground',
  diesel: 'bg-foreground text-background',
  lpg: 'bg-success text-success-foreground',
};

export default function FuelStationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: station, isLoading } = useFuelStation(id || '');

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!station) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Station not found</h2>
          <p className="text-muted-foreground mb-4">The station you're looking for doesn't exist.</p>
          <Link to="/fuel-stations">
            <Button>Back to Stations</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/fuel-stations')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Stations
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl gradient-fuel shrink-0">
                  <Fuel className="h-8 w-8 text-fuel-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-display">{station.station_name}</CardTitle>
                  <p className="text-lg text-muted-foreground">{station.brand}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{station.city}, {station.district}</span>
                  </div>
                  {station.address && (
                    <p className="text-sm text-muted-foreground mt-1">{station.address}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available Fuel Types</p>
                  <div className="flex gap-2 flex-wrap">
                    {station.fuel_options.map(opt => (
                      <Badge key={opt.id} className={fuelTypeColors[opt.fuel_type]}>
                        {fuelTypeLabels[opt.fuel_type]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {station.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-foreground">{station.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Added {format(new Date(station.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-card bg-fuel-light border-fuel/20">
            <CardHeader>
              <CardTitle className="font-display text-fuel">Current Prices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {station.fuel_options.length > 0 ? (
                station.fuel_options.map(opt => (
                  <div key={opt.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <Badge className={fuelTypeColors[opt.fuel_type]}>
                      {fuelTypeLabels[opt.fuel_type]}
                    </Badge>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-fuel">
                        ₺{Number(opt.price_per_liter).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">per liter</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No prices available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
