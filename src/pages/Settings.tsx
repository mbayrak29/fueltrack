import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, Shield, Trash2, Download, Zap, Fuel } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvStations } from '@/hooks/useEvStations';
import { useFuelStations } from '@/hooks/useFuelStations';
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
import { toast } from 'sonner';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { data: evStations = [] } = useEvStations();
  const { data: fuelStations = [] } = useFuelStations();

  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    weeklyDigest: false,
    newStations: true,
  });

  const handleExportData = () => {
    const data = {
      evStations,
      fuelStations,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fueltrack-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Settings"
        description="Manage your app preferences and account"
      />

      <div className="max-w-2xl space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="font-display">Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="priceAlerts" className="font-medium">Price Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when prices change significantly</p>
              </div>
              <Switch
                id="priceAlerts"
                checked={notifications.priceAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, priceAlerts: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weeklyDigest" className="font-medium">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Receive a weekly summary of price trends</p>
              </div>
              <Switch
                id="weeklyDigest"
                checked={notifications.weeklyDigest}
                onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newStations" className="font-medium">New Stations</Label>
                <p className="text-sm text-muted-foreground">Get notified about new stations in your area</p>
              </div>
              <Switch
                id="newStations"
                checked={notifications.newStations}
                onCheckedChange={(checked) => setNotifications({ ...notifications, newStations: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle className="font-display">Data Management</CardTitle>
            </div>
            <CardDescription>Export or manage your tracking data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Your Data</p>
                <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {evStations.length} EV stations
                  </span>
                  <span className="flex items-center gap-1">
                    <Fuel className="h-3 w-3" />
                    {fuelStations.length} Fuel stations
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="font-display">Account</CardTitle>
            </div>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Signed in account</p>
              </div>
              <Badge variant="outline" className="text-success border-success">Active</Badge>
            </div>

            <Separator />

            <div className="pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign Out</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to sign out? You'll need to sign in again to access your data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={signOut}>
                      Sign Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-muted">
          <CardContent className="p-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-display font-semibold text-foreground mb-1">FuelTrack v1.0.0</p>
              <p>Unified Fuel & EV Charge Tracker</p>
              <p className="mt-2">© 2024 FuelTrack. All rights reserved.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
