-- Create tables table for wedding table management
CREATE TABLE public.wedding_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INT NOT NULL UNIQUE,
  table_name TEXT,
  capacity INT DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guests table
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  qr_code TEXT UNIQUE NOT NULL,
  table_id UUID REFERENCES public.wedding_tables(id),
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  plus_one BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wedding_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Public read policies for check-in and guest page (simple app, no auth)
CREATE POLICY "Anyone can read tables" ON public.wedding_tables FOR SELECT USING (true);
CREATE POLICY "Anyone can read guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert guests" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update guests" ON public.guests FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete guests" ON public.guests FOR DELETE USING (true);
CREATE POLICY "Anyone can insert tables" ON public.wedding_tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tables" ON public.wedding_tables FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete tables" ON public.wedding_tables FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_guests_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default tables
INSERT INTO public.wedding_tables (table_number, table_name, capacity) VALUES
(1, 'Table des Mariés', 8),
(2, 'Famille Proche', 10),
(3, 'Amis d''enfance', 10),
(4, 'Collègues', 10),
(5, 'Table 5', 10);