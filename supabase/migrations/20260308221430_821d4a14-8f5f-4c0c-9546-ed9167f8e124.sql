-- Create storage bucket for room images
INSERT INTO storage.buckets (id, name, public) VALUES ('room-images', 'room-images', true);

-- Allow anyone to read room images
CREATE POLICY "Anyone can read room images" ON storage.objects FOR SELECT USING (bucket_id = 'room-images');

-- Allow admins to upload room images
CREATE POLICY "Admins can upload room images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'room-images' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete room images
CREATE POLICY "Admins can delete room images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'room-images' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Add public_area_price column to loyalty_settings
ALTER TABLE public.loyalty_settings ADD COLUMN public_area_price_per_hour numeric NOT NULL DEFAULT 30;