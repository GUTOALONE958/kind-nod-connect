CREATE OR REPLACE FUNCTION increment_link_stats(link_id UUID, revenue_inc DECIMAL, unique_inc INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.links
  SET 
    total_clicks = total_clicks + 1,
    unique_clicks = unique_clicks + unique_inc,
    total_revenue = total_revenue + revenue_inc,
    updated_at = now()
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION increment_user_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    balance = balance + amount,
    updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION increment_link_stats(UUID, DECIMAL, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_user_balance(UUID, DECIMAL) FROM PUBLIC;
