-- Fix search_path and revoke public execute for update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;

-- Fix search_path and revoke public execute for handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Add missing policies for tables that have RLS enabled but no policies
CREATE POLICY "Admins can manage fraud logs" ON public.fraud_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Users can view own fraud logs" ON public.fraud_logs FOR SELECT USING (auth.uid() = user_id);

-- api_tokens already has "Users manage own tokens", adding admin view
CREATE POLICY "Admins can view all tokens" ON public.api_tokens FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
