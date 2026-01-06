import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Calendar, Loader2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useEvStations } from '@/hooks/useEvStations';
import { useFuelStations } from '@/hooks/useFuelStations';
import { format } from 'date-fns';

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: evStations = [] } = useEvStations();
  const { data: fuelStations = [] } = useFuelStations();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    await updateProfile.mutateAsync({ full_name: fullName });
    setIsEditing(false);
  };

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Profile"
        description="Manage your account information"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{profile?.full_name || 'No name set'}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{profile?.full_name || 'Not set'}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => {
                    setFullName(profile?.full_name || '');
                    setIsEditing(true);
                  }}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Created</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : 'Unknown'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.updated_at ? format(new Date(profile.updated_at), 'MMMM d, yyyy') : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-ev-light">
                <span className="text-sm font-medium">EV Stations</span>
                <span className="text-2xl font-display font-bold text-ev">{evStations.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-fuel-light">
                <span className="text-sm font-medium">Fuel Stations</span>
                <span className="text-2xl font-display font-bold text-fuel">{fuelStations.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium">Total Tracked</span>
                <span className="text-2xl font-display font-bold text-foreground">{evStations.length + fuelStations.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
