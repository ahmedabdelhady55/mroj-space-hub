
ALTER TABLE public.bookings ADD COLUMN payment_method text NOT NULL DEFAULT 'cash';
ALTER TABLE public.bookings ADD COLUMN payment_status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.loyalty_settings ADD COLUMN vodafone_cash_number text NOT NULL DEFAULT '';
