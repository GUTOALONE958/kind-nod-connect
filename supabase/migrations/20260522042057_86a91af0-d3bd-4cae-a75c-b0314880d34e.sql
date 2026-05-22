-- Profiles enhancement
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS api_limit_per_minute INTEGER DEFAULT 60;

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(15, 4) NOT NULL,
  type TEXT NOT NULL, -- 'earning', 'withdrawal', 'referral_bonus'
  status TEXT DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  commission_earned DECIMAL(15, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions table for security tracking
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users manage own sessions" ON public.sessions FOR ALL USING (auth.uid() = user_id);

-- Admins can view everything
CREATE POLICY "Admins manage transactions" ON public.transactions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins manage referrals" ON public.referrals FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_links_slug ON public.links(short_slug);
CREATE INDEX IF NOT EXISTS idx_visits_link_id ON public.visits(link_id);
CREATE INDEX IF NOT EXISTS idx_visits_ip_created ON public.visits(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Trigger for referral bonus (example logic)
CREATE OR REPLACE FUNCTION public.handle_referral_commission()
RETURNS trigger AS $$
BEGIN
  -- Simple logic: give 10% of earnings to referrer? 
  -- Actually, let's just log the connection for now.
  UPDATE public.profiles SET referral_count = referral_count + 1 WHERE id = NEW.referrer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_referral_created
  AFTER INSERT ON public.referrals
  FOR EACH ROW EXECUTE PROCEDURE public.handle_referral_commission();
