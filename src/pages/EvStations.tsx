import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Zap, MapPin, Trash2, Eye, Loader2 } from 'lucide-react';
import { useEvStations, useDeleteEvStation } from '@/hooks/useEvStations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function EvStations() {
  const { data: stations = [], isLoading } = useEvStations();
  const deleteStation = useDeleteEvStation();

  const sortedStations = [...stations].sort((a, b) => Number(a.price_per_kwh) - Number(b.price_per_kwh));

  return (
    <AppLayout>
      <PageHeader 
        title="EV Charging Stations"
        description="Manage your tracked EV charging stations"
        action={
          <Link to="/ev-stations/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Station
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : stations.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Zap className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No EV stations yet</h3>
            <p className="text-muted-foreground mb-6">Add your first EV charging station to start tracking prices</p>
            <Link to="/ev-stations/add">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Station
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedStations.map((station, index) => (
            <Card key={station.id} className="shadow-card hover:shadow-card-hover transition-all animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-ev shrink-0">
                      <Zap className="h-6 w-6 text-ev-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{station.station_name}</h3>
                        {index === 0 && (
                          <Badge className="bg-ev text-ev-foreground">Cheapest</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{station.provider}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {station.city}, {station.district}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline">{station.charger_type || 'DC Fast'}</Badge>
                        <Badge variant="outline">{station.power_kw || 50} kW</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-display font-bold text-ev">
                      ₺{Number(station.price_per_kwh).toFixed(4)}
                    </p>
                    <p className="text-sm text-muted-foreground">per kWh</p>
                    <div className="flex gap-2 mt-4">
                      <Link to={`/ev-stations/${station.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Station</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{station.station_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteStation.mutate(station.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
