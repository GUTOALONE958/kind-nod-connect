-- Create a function to process visits atomically
CREATE OR REPLACE FUNCTION process_link_visit(
  p_slug TEXT,
  p_ip TEXT,
  p_user_agent TEXT,
  p_country TEXT,
  p_device TEXT,
  p_referrer TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_link RECORD;
  v_category RECORD;
  v_is_unique BOOLEAN;
  v_revenue DECIMAL(15, 4) := 0;
  v_visit_id UUID;
BEGIN
  -- 1. Find the link and its category
  SELECT l.*, c.cpm_rate, c.steps_count 
  INTO v_link 
  FROM public.links l
  JOIN public.categories c ON l.category_id = c.id
  WHERE l.short_slug = p_slug AND l.is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Link not found');
  END IF;

  -- 2. Check for uniqueness (24h window)
  SELECT NOT EXISTS (
    SELECT 1 FROM public.visits 
    WHERE link_id = v_link.id 
    AND ip_address = p_ip 
    AND created_at > now() - interval '24 hours'
  ) INTO v_is_unique;

  -- 3. Calculate revenue if unique
  IF v_is_unique THEN
    v_revenue := v_link.cpm_rate / 1000.0;
  END IF;

  -- 4. Record visit
  INSERT INTO public.visits (
    link_id, ip_address, user_agent, referrer, country_code, device_type, is_unique, revenue_generated
  ) VALUES (
    v_link.id, p_ip, p_user_agent, p_referrer, p_country, p_device, v_is_unique, v_revenue
  ) RETURNING id INTO v_visit_id;

  -- 5. Update link stats
  UPDATE public.links 
  SET 
    total_clicks = total_clicks + 1,
    unique_clicks = unique_clicks + (CASE WHEN v_is_unique THEN 1 ELSE 0 END),
    total_revenue = total_revenue + v_revenue,
    updated_at = now()
  WHERE id = v_link.id;

  -- 6. Update user balance
  IF v_revenue > 0 THEN
    UPDATE public.profiles 
    SET 
      balance = balance + v_revenue,
      updated_at = now()
    WHERE id = v_link.user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'original_url', v_link.original_url,
    'steps_count', v_link.steps_count,
    'visit_id', v_visit_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION process_link_visit(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION process_link_visit(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;
