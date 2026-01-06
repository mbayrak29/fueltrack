import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EvStation {
  id: string;
  user_id: string;
  station_name: string;
  provider: string;
  city: string;
  district: string;
  address?: string;
  price_per_kwh: number;
  charger_type?: string;
  power_kw?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEvStationInput {
  station_name: string;
  provider: string;
  city: string;
  district: string;
  address?: string;
  price_per_kwh: number;
  charger_type?: string;
  power_kw?: number;
  notes?: string;
}

export function useEvStations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ev-stations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ev_stations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EvStation[];
    },
    enabled: !!user,
  });
}

export function useEvStation(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ev-station', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ev_stations')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as EvStation | null;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateEvStation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateEvStationInput) => {
      const { data, error } = await supabase
        .from('ev_stations')
        .insert([{ ...input, user_id: user!.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ev-stations'] });
      toast.success('EV station added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add EV station: ' + error.message);
    },
  });
}

export function useDeleteEvStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ev_stations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ev-stations'] });
      toast.success('EV station deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete EV station: ' + error.message);
    },
  });
}
