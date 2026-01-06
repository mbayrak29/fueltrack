-- Create fuel_options table to support multiple fuel types per station
CREATE TABLE public.fuel_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fuel_station_id UUID NOT NULL REFERENCES public.fuel_stations(id) ON DELETE CASCADE,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('gasoline', 'diesel', 'lpg')),
  price_per_liter NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(fuel_station_id, fuel_type)
);

-- Enable RLS
ALTER TABLE public.fuel_options ENABLE ROW LEVEL SECURITY;

-- RLS policies for fuel_options (via parent fuel_station ownership)
CREATE POLICY "Users can view fuel options of their stations"
ON public.fuel_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.fuel_stations fs 
    WHERE fs.id = fuel_station_id AND fs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert fuel options for their stations"
ON public.fuel_options
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.fuel_stations fs 
    WHERE fs.id = fuel_station_id AND fs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update fuel options of their stations"
ON public.fuel_options
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.fuel_stations fs 
    WHERE fs.id = fuel_station_id AND fs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete fuel options of their stations"
ON public.fuel_options
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.fuel_stations fs 
    WHERE fs.id = fuel_station_id AND fs.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_fuel_options_updated_at
BEFORE UPDATE ON public.fuel_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data: create fuel_options from existing fuel_stations
INSERT INTO public.fuel_options (fuel_station_id, fuel_type, price_per_liter)
SELECT id, fuel_type, price_per_liter FROM public.fuel_stations
WHERE fuel_type IS NOT NULL AND price_per_liter IS NOT NULL;

-- Make fuel_type and price_per_liter nullable (we keep them for backward compatibility but they are now deprecated)
ALTER TABLE public.fuel_stations ALTER COLUMN fuel_type DROP NOT NULL;
ALTER TABLE public.fuel_stations ALTER COLUMN price_per_liter DROP NOT NULL;