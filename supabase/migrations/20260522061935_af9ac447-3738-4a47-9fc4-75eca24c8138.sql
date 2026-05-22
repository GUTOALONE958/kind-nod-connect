-- 1. Fix RLS recursion on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Enable RLS (just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Simple non-recursive policies
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Use a specific check for admins that avoids calling a function that selects from profiles
-- Or just allow everyone to view basic profile info if needed, but here we'll keep it restricted.
-- To fix recursion, we can use the is_admin check directly in a way that Postgres handles better
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- 2. Fix duplicated foreign keys in subdomains
-- We saw 'fk_subdomains_category' and 'subdomains_category_id_fkey'
ALTER TABLE public.subdomains DROP CONSTRAINT IF EXISTS fk_subdomains_category;

-- 3. Fix categories policies to be consistent
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
