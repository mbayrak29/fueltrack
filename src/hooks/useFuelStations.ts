import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FuelOption {
  id: string;
  fuel_station_id: string;
  fuel_type: 'gasoline' | 'diesel' | 'lpg';
  price_per_liter: number;
  created_at: string;
  updated_at: string;
}

export interface FuelStation {
  id: string;
  user_id: string;
  station_name: string;
  brand: string;
  city: string;
  district: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  fuel_options: FuelOption[];
}

export interface CreateFuelStationInput {
  station_name: string;
  brand: string;
  city: string;
  district: string;
  address?: string;
  notes?: string;
  fuel_options: {
    fuel_type: 'gasoline' | 'diesel' | 'lpg';
    price_per_liter: number;
  }[];
}

export function useFuelStations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['fuel-stations', user?.id],
    queryFn: async () => {
      // Fetch stations
      const { data: stations, error: stationsError } = await supabase
        .from('fuel_stations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (stationsError) throw stationsError;

      // Fetch all fuel options for user's stations
      const stationIds = stations.map(s => s.id);
      if (stationIds.length === 0) return [] as FuelStation[];

      const { data: fuelOptions, error: optionsError } = await supabase
        .from('fuel_options')
        .select('*')
        .in('fuel_station_id', stationIds);

      if (optionsError) throw optionsError;

      // Combine stations with their fuel options
      return stations.map(station => ({
        ...station,
        fuel_options: (fuelOptions || []).filter(opt => opt.fuel_station_id === station.id) as FuelOption[],
      })) as FuelStation[];
    },
    enabled: !!user,
  });
}

export function useFuelStation(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['fuel-station', id],
    queryFn: async () => {
      const { data: station, error: stationError } = await supabase
        .from('fuel_stations')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (stationError) throw stationError;
      if (!station) return null;

      const { data: fuelOptions, error: optionsError } = await supabase
        .from('fuel_options')
        .select('*')
        .eq('fuel_station_id', id);

      if (optionsError) throw optionsError;

      return {
        ...station,
        fuel_options: (fuelOptions || []) as FuelOption[],
      } as FuelStation;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateFuelStation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateFuelStationInput) => {
      // Create the station first
      const { data: station, error: stationError } = await supabase
        .from('fuel_stations')
        .insert([{
          station_name: input.station_name,
          brand: input.brand,
          city: input.city,
          district: input.district,
          address: input.address,
          notes: input.notes,
          user_id: user!.id,
        }])
        .select()
        .single();
      
      if (stationError) throw stationError;

      // Create fuel options
      if (input.fuel_options.length > 0) {
        const { error: optionsError } = await supabase
          .from('fuel_options')
          .insert(input.fuel_options.map(opt => ({
            fuel_station_id: station.id,
            fuel_type: opt.fuel_type,
            price_per_liter: opt.price_per_liter,
          })));

        if (optionsError) throw optionsError;
      }

      return station;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-stations'] });
      toast.success('Fuel station added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add fuel station: ' + error.message);
    },
  });
}

export function useUpdateFuelOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, price_per_liter }: { id: string; price_per_liter: number }) => {
      const { data, error } = await supabase
        .from('fuel_options')
        .update({ price_per_liter })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-stations'] });
      queryClient.invalidateQueries({ queryKey: ['fuel-station'] });
      toast.success('Price updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update price: ' + error.message);
    },
  });
}

export function useAddFuelOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { fuel_station_id: string; fuel_type: 'gasoline' | 'diesel' | 'lpg'; price_per_liter: number }) => {
      const { data, error } = await supabase
        .from('fuel_options')
        .insert([input])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-stations'] });
      queryClient.invalidateQueries({ queryKey: ['fuel-station'] });
      toast.success('Fuel type added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add fuel type: ' + error.message);
    },
  });
}

export function useDeleteFuelStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fuel_stations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-stations'] });
      toast.success('Fuel station deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete fuel station: ' + error.message);
    },
  });
}
