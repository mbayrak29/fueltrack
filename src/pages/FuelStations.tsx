import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Fuel, MapPin, Trash2, Eye, Loader2 } from 'lucide-react';
import { useFuelStations, useDeleteFuelStation, FuelStation } from '@/hooks/useFuelStations';
import { useFuelType } from '@/contexts/FuelTypeContext';
import { FuelTypeSelector } from '@/components/FuelTypeSelector';
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

// Helper to get price for selected fuel type
function getPriceForType(station: FuelStation, fuelType: string): number | null {
  const option = station.fuel_options.find(o => o.fuel_type === fuelType);
  return option ? Number(option.price_per_liter) : null;
}

export default function FuelStations() {
  const { data: stations = [], isLoading } = useFuelStations();
  const { selectedFuelType } = useFuelType();
  const deleteStation = useDeleteFuelStation();

  // Filter stations that have the selected fuel type
  const filteredStations = stations.filter(s => 
    s.fuel_options.some(o => o.fuel_type === selectedFuelType)
  );

  // Sort by price for selected fuel type
  const sortedStations = [...filteredStations].sort((a, b) => {
    const priceA = getPriceForType(a, selectedFuelType) ?? Infinity;
    const priceB = getPriceForType(b, selectedFuelType) ?? Infinity;
    return priceA - priceB;
  });

  return (
    <AppLayout>
      <PageHeader 
        title="Fuel Stations"
        description="Manage your tracked fuel stations"
        action={
          <div className="flex items-center gap-4">
            <FuelTypeSelector />
            <Link to="/fuel-stations/add">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Station
              </Button>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sortedStations.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Fuel className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No stations with {fuelTypeLabels[selectedFuelType]}
            </h3>
            <p className="text-muted-foreground mb-6">
              {stations.length === 0 
                ? 'Add your first fuel station to start tracking prices'
                : `No stations offer ${fuelTypeLabels[selectedFuelType]}. Try a different fuel type.`
              }
            </p>
            <Link to="/fuel-stations/add">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Station
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedStations.map((station, index) => {
            const price = getPriceForType(station, selectedFuelType);
            return (
              <Card key={station.id} className="shadow-card hover:shadow-card-hover transition-all animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-fuel shrink-0">
                        <Fuel className="h-6 w-6 text-fuel-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{station.station_name}</h3>
                          {index === 0 && (
                            <Badge className="bg-fuel text-fuel-foreground">Cheapest</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{station.brand}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {station.city}, {station.district}
                        </div>
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {station.fuel_options.map(opt => (
                            <Badge 
                              key={opt.id} 
                              className={opt.fuel_type === selectedFuelType 
                                ? fuelTypeColors[opt.fuel_type] 
                                : 'bg-muted text-muted-foreground'
                              }
                            >
                              {fuelTypeLabels[opt.fuel_type]}: ₺{Number(opt.price_per_liter).toFixed(2)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-display font-bold text-fuel">
                        ₺{price?.toFixed(2) ?? '--'}
                      </p>
                      <p className="text-sm text-muted-foreground">per liter ({fuelTypeLabels[selectedFuelType]})</p>
                      <div className="flex gap-2 mt-4">
                        <Link to={`/fuel-stations/${station.id}`}>
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
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
