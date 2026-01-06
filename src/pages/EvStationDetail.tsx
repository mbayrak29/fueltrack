import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useEvStation } from '@/hooks/useEvStations';
import { format } from 'date-fns';

export default function EvStationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: station, isLoading } = useEvStation(id || '');

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
          <Link to="/ev-stations">
            <Button>Back to Stations</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/ev-stations')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Stations
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl gradient-ev shrink-0">
                  <Zap className="h-8 w-8 text-ev-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-display">{station.station_name}</CardTitle>
                  <p className="text-lg text-muted-foreground">{station.provider}</p>
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
                  <p className="text-sm text-muted-foreground mb-1">Charger Specs</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{station.charger_type || 'DC Fast'}</Badge>
                    <Badge variant="outline">{station.power_kw || 50} kW</Badge>
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

        <div>
          <Card className="shadow-card bg-ev-light border-ev/20">
            <CardHeader>
              <CardTitle className="font-display text-ev">Current Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-display font-bold text-ev">
                ₺{Number(station.price_per_kwh).toFixed(4)}
              </p>
              <p className="text-muted-foreground mt-1">per kWh</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
