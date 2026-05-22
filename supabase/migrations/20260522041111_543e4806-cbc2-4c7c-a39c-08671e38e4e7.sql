-- Tables creation
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false, -- For API access
  balance DECIMAL(15, 4) DEFAULT 0,
  total_withdrawn DECIMAL(15, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Easy, Medium, Hard, etc.
  steps_count INTEGER NOT NULL DEFAULT 5,
  cpm_rate DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  ad_density TEXT DEFAULT 'low', -- low, medium, high, ultra
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.subdomains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_slug TEXT NOT NULL UNIQUE,
  subdomain_id UUID REFERENCES public.subdomains(id),
  category_id UUID REFERENCES public.categories(id),
  title TEXT,
  password TEXT, -- Optional password protection
  expires_at TIMESTAMPTZ,
  is_private BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  total_clicks BIGINT DEFAULT 0,
  unique_clicks BIGINT DEFAULT 0,
  total_revenue DECIMAL(15, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id), -- If visitor is logged in
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country_code TEXT,
  device_type TEXT, -- mobile, desktop, tablet
  is_unique BOOLEAN DEFAULT true,
  is_valid BOOLEAN DEFAULT true, -- For anti-fraud
  revenue_generated DECIMAL(15, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(15, 4) NOT NULL,
  payment_method TEXT NOT NULL, -- PIX, etc.
  payment_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  name TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ads_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT DEFAULT 'adsterra',
  ad_type TEXT, -- popunder, banner, interstitial, etc.
  script_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.fraud_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  link_id UUID REFERENCES public.links(id),
  ip_address TEXT,
  reason TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can read/update their own, admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: Everyone can read, admins can CRUD
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Subdomains: Everyone can read, admins can CRUD
CREATE POLICY "Anyone can view active subdomains" ON public.subdomains FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage subdomains" ON public.subdomains FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Links: Users manage their own, everyone can select (for redirection)
CREATE POLICY "Users can manage own links" ON public.links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active links" ON public.links FOR SELECT USING (is_active = true);

-- Visits: Admins view all, users view own link visits
CREATE POLICY "Users can view own link visits" ON public.visits FOR SELECT USING (EXISTS (SELECT 1 FROM public.links WHERE id = link_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all visits" ON public.visits FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Withdrawals: Users manage own, admins view/update all
CREATE POLICY "Users can manage own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all withdrawals" ON public.withdrawals FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- API Tokens: Users manage own, admins view
CREATE POLICY "Users manage own tokens" ON public.api_tokens FOR ALL USING (auth.uid() = user_id);

-- Ads Config: Public read, admin CRUD
CREATE POLICY "Anyone can read active ads" ON public.ads_config FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage ads" ON public.ads_config FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Settings: Public read, admin CRUD
CREATE POLICY "Anyone can read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_links_modtime BEFORE UPDATE ON public.links FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_withdrawals_modtime BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to handle new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Initial Data
INSERT INTO public.categories (name, steps_count, cpm_rate, ad_density) VALUES
('Easy', 3, 2.50, 'low'),
('Medium', 6, 5.00, 'medium'),
('Hard', 10, 10.00, 'high'),
('Extreme', 15, 20.00, 'ultra');

INSERT INTO public.subdomains (domain, is_default) VALUES ('go.yourdomain.com', true);
