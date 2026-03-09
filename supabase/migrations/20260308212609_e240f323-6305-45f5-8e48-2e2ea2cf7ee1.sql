
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_per_hour NUMERIC NOT NULL DEFAULT 90,
  capacity INTEGER NOT NULL DEFAULT 4,
  available BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read rooms" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon can read rooms" ON public.rooms FOR SELECT TO anon USING (true);

-- Menu items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL DEFAULT 'مشروبات ساخنة',
  description TEXT DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read menu" ON public.menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon can read menu" ON public.menu_items FOR SELECT TO anon USING (true);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('public', 'private')),
  details TEXT NOT NULL DEFAULT '',
  area_cost NUMERIC NOT NULL DEFAULT 0,
  orders_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  room_name TEXT,
  person_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Booking orders (items ordered during a booking)
CREATE TABLE public.booking_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  item_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own booking orders" ON public.booking_orders FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_orders.booking_id AND bookings.user_id = auth.uid())
);
CREATE POLICY "Users can insert own booking orders" ON public.booking_orders FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_orders.booking_id AND bookings.user_id = auth.uid())
);

-- Loyalty settings (admin-managed)
CREATE TABLE public.loyalty_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  points_per_amount INTEGER NOT NULL DEFAULT 10,
  amount_for_points NUMERIC NOT NULL DEFAULT 100,
  min_redeem_points INTEGER NOT NULL DEFAULT 50,
  point_value NUMERIC NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.loyalty_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon can read settings" ON public.loyalty_settings FOR SELECT TO anon USING (true);

-- Insert default loyalty settings
INSERT INTO public.loyalty_settings (points_per_amount, amount_for_points, min_redeem_points, point_value) VALUES (10, 100, 50, 1);

-- Insert default menu items
INSERT INTO public.menu_items (name, price, category, description) VALUES
  ('قهوة أمريكانو', 35, 'مشروبات ساخنة', 'قهوة محمصة طازجة'),
  ('لاتيه', 45, 'مشروبات ساخنة', 'إسبريسو مع حليب مخفوق'),
  ('شاي أخضر', 25, 'مشروبات ساخنة', 'شاي أخضر مع نعناع'),
  ('آيس موكا', 55, 'مشروبات باردة', 'موكا مثلجة بالشوكولاتة'),
  ('عصير مانجو', 40, 'مشروبات باردة', 'عصير مانجو طبيعي'),
  ('برجر كلاسيك', 85, 'وجبات رئيسية', 'لحم بقري مع جبنة شيدر'),
  ('كلوب ساندويتش', 75, 'وجبات رئيسية', 'دجاج مشوي مع خضروات'),
  ('كرواسون شوكولاتة', 30, 'وجبات خفيفة', 'كرواسون طازج محشو'),
  ('كيك ريد فيلفيت', 45, 'وجبات خفيفة', 'كيك طبقات فاخر');

-- Admin role setup
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin policies for rooms
CREATE POLICY "Admins can insert rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update rooms" ON public.rooms FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete rooms" ON public.rooms FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for menu_items
CREATE POLICY "Admins can insert menu" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update menu" ON public.menu_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete menu" ON public.menu_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for loyalty_settings
CREATE POLICY "Admins can update settings" ON public.loyalty_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for bookings (read all)
CREATE POLICY "Admins can read all bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin can read all profiles
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), COALESCE(NEW.raw_user_meta_data->>'phone', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
