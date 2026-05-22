-- Add foreign key constraints to links table
ALTER TABLE public.links
ADD CONSTRAINT fk_links_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_links_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_links_subdomain FOREIGN KEY (subdomain_id) REFERENCES public.subdomains(id) ON DELETE SET NULL;

-- Add foreign key constraints to withdrawals table
ALTER TABLE public.withdrawals
ADD CONSTRAINT fk_withdrawals_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraints to subdomains table
ALTER TABLE public.subdomains
ADD CONSTRAINT fk_subdomains_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
