-- 1. Table Alterations
DO $$ 
BEGIN
    -- Fix Categories
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='description') THEN
        ALTER TABLE public.categories ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='time_per_step') THEN
        ALTER TABLE public.categories ADD COLUMN time_per_step INTEGER DEFAULT 10;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='ads_per_page') THEN
        ALTER TABLE public.categories ADD COLUMN ads_per_page INTEGER DEFAULT 2;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='updated_at') THEN
        ALTER TABLE public.categories ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- Rename columns if they still have old names
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='steps_count') THEN
        ALTER TABLE public.categories RENAME COLUMN steps_count TO step_count;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='cpm_rate') THEN
        ALTER TABLE public.categories RENAME COLUMN cpm_rate TO cpm_value;
    END IF;

    -- Ensure unique constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_key') THEN
        ALTER TABLE public.categories ADD CONSTRAINT categories_name_key UNIQUE (name);
    END IF;

    -- Subdomains
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subdomains' AND column_name='category_id') THEN
        ALTER TABLE public.subdomains ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
    END IF;

    -- Links
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='links' AND column_name='category_id') THEN
        ALTER TABLE public.links ADD COLUMN category_id UUID REFERENCES public.categories(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='links' AND column_name='subdomain_id') THEN
        ALTER TABLE public.links ADD COLUMN subdomain_id UUID REFERENCES public.subdomains(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='links' AND column_name='password_hash') THEN
        ALTER TABLE public.links ADD COLUMN password_hash TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='links' AND column_name='is_premium') THEN
        ALTER TABLE public.links ADD COLUMN is_premium BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='links' AND column_name='expires_at') THEN
        ALTER TABLE public.links ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='links' AND column_name='settings') THEN
        ALTER TABLE public.links ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. New Tables
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS & Policies
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage admin_logs') THEN
        CREATE POLICY "Admins manage admin_logs" ON public.admin_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
    END IF;
END $$;

-- 4. Seed Data
INSERT INTO public.categories (name, description, step_count, time_per_step, ads_per_page, cpm_value)
VALUES 
('Fácil', '5 páginas, menos anúncios', 5, 5, 1, 5.00),
('Médio', '10 páginas, CPM médio', 10, 10, 2, 15.00),
('Difícil', '15 páginas, CPM alto', 15, 15, 3, 35.00),
('Ultra', '20 páginas, monetização agressiva', 20, 20, 4, 75.00)
ON CONFLICT (name) DO UPDATE SET 
    step_count = EXCLUDED.step_count,
    time_per_step = EXCLUDED.time_per_step,
    ads_per_page = EXCLUDED.ads_per_page,
    cpm_value = EXCLUDED.cpm_value;
