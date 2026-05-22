-- 1. Create a function to check if the current user is an admin
-- Using SECURITY DEFINER to bypass RLS and avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Fix profiles RLS policies
-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a new non-recursive policy for admins
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

-- 3. Fix withdrawals RLS policies
DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON public.withdrawals;

CREATE POLICY "Admins can manage all withdrawals" 
ON public.withdrawals 
FOR ALL 
USING (is_admin());

-- 4. Fix redundant foreign keys on links table
-- Based on the query results:
-- links_category_id_fkey vs fk_links_category
-- links_subdomain_id_fkey vs fk_links_subdomain
-- links_user_id_fkey vs fk_links_user

-- Drop the redundant/conflicting keys
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS fk_links_category;
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS fk_links_subdomain;
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS fk_links_user;

-- Ensure the remaining ones have proper ON DELETE rules if needed, 
-- but for now, just removing the duplicates should fix the embedding error.
-- The ones starting with 'links_' seem to be the older ones, let's keep them if they are correct.
-- Actually, the 'fk_links_' ones usually have ON DELETE CASCADE or SET NULL, which might be preferred.
-- Let's check the constraint definitions again to be sure which ones to keep.
-- Keep: links_user_id_fkey (CASCADE), links_subdomain_id_fkey, links_category_id_fkey.
