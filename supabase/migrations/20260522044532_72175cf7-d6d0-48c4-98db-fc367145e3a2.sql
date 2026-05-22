-- 1. Zero out categories CPM
UPDATE public.categories SET cpm_value = 0.00;

-- 2. Ensure we have a default subdomain
INSERT INTO public.subdomains (domain, is_default, is_active)
VALUES ('go.alphalink.com', true, true)
ON CONFLICT (domain) DO UPDATE SET is_default = true;
