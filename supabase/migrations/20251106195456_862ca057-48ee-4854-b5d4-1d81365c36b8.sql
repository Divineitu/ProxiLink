-- Create user role enum
CREATE TYPE public.app_role AS ENUM ('youth', 'vendor', 'ngo', 'admin');

-- Create profiles table (extended user information)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create vendor_profiles table (extends profiles for vendors)
CREATE TABLE public.vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  verification_status BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ngo_profiles table (extends profiles for NGOs)
CREATE TABLE public.ngo_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  organization_name TEXT NOT NULL,
  impact_area TEXT NOT NULL,
  description TEXT,
  verification_status BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create services table (opportunities/services posted by vendors)
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  service_type TEXT NOT NULL, -- 'job', 'service', 'product'
  category TEXT NOT NULL,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER DEFAULT 5000,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'expired'
  price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create events table (posted by NGOs)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'health', 'education', 'community', 'safety'
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER DEFAULT 5000,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL, -- 'service', 'event', 'message', 'system'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  related_id UUID, -- service_id or event_id
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for geospatial queries
CREATE INDEX idx_services_location ON public.services USING btree (location_lat, location_lng);
CREATE INDEX idx_events_location ON public.events USING btree (location_lat, location_lng);
CREATE INDEX idx_services_status ON public.services(status);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create function to check user roles (security definer to avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for vendor_profiles
CREATE POLICY "Anyone can view vendor profiles" ON public.vendor_profiles FOR SELECT USING (true);
CREATE POLICY "Vendors can update own profile" ON public.vendor_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Vendors can insert own profile" ON public.vendor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ngo_profiles
CREATE POLICY "Anyone can view NGO profiles" ON public.ngo_profiles FOR SELECT USING (true);
CREATE POLICY "NGOs can update own profile" ON public.ngo_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "NGOs can insert own profile" ON public.ngo_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (status = 'active');
CREATE POLICY "Vendors can insert services" ON public.services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vendors can update own services" ON public.services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Vendors can delete own services" ON public.services FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all services" ON public.services FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for events
CREATE POLICY "Anyone can view upcoming events" ON public.events FOR SELECT USING (status IN ('upcoming', 'ongoing'));
CREATE POLICY "NGOs can insert events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "NGOs can update own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "NGOs can delete own events" ON public.events FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all events" ON public.events FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_services
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_events
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();