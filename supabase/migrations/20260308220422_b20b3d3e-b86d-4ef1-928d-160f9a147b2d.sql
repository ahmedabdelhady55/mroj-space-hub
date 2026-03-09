ALTER TABLE public.booking_orders ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Add admin policies for booking_orders
CREATE POLICY "Admins can read all booking orders"
ON public.booking_orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update booking orders"
ON public.booking_orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));