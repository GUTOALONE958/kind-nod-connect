CREATE OR REPLACE FUNCTION public.process_link_visit(p_slug text, p_ip text, p_user_agent text, p_country text, p_device text, p_referrer text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_link RECORD;
  v_is_unique BOOLEAN;
  v_revenue_per_step DECIMAL(15, 4) := 0;
  v_visit_id UUID;
  v_step_count INT;
BEGIN
  -- 1. Find the link and its category (using LEFT JOIN)
  SELECT l.*, c.cpm_value, c.step_count 
  INTO v_link 
  FROM public.links l
  LEFT JOIN public.categories c ON l.category_id = c.id
  WHERE l.short_slug = p_slug AND l.is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Link not found');
  END IF;

  v_step_count := COALESCE(v_link.step_count, 1);

  -- 2. Check for uniqueness (24h window)
  SELECT NOT EXISTS (
    SELECT 1 FROM public.visits 
    WHERE link_id = v_link.id 
    AND ip_address = p_ip 
    AND created_at > now() - interval '24 hours'
  ) INTO v_is_unique;

  -- 3. Revenue calculation
  IF v_is_unique AND v_link.cpm_value IS NOT NULL AND v_step_count > 0 THEN
    v_revenue_per_step := (v_link.cpm_value / 1000.0) / v_step_count;
  END IF;

  -- 4. Record visit (Start)
  INSERT INTO public.visits (
    link_id, ip_address, user_agent, referrer, country_code, device_type, is_unique, revenue_generated, user_id
  ) VALUES (
    v_link.id, p_ip, p_user_agent, p_referrer, p_country, p_device, v_is_unique, v_revenue_per_step, v_link.user_id
  ) RETURNING id INTO v_visit_id;

  -- 5. Update link stats (Initial)
  UPDATE public.links 
  SET 
    total_clicks = COALESCE(total_clicks, 0) + 1,
    unique_clicks = COALESCE(unique_clicks, 0) + (CASE WHEN v_is_unique THEN 1 ELSE 0 END),
    total_revenue = COALESCE(total_revenue, 0) + v_revenue_per_step,
    updated_at = now()
  WHERE id = v_link.id;

  -- 6. Update user balance
  IF v_revenue_per_step > 0 THEN
    UPDATE public.profiles 
    SET 
      balance = COALESCE(balance, 0) + v_revenue_per_step,
      updated_at = now()
    WHERE id = v_link.user_id;
    
    -- Log transaction
    INSERT INTO public.transactions (user_id, amount, type, description)
    VALUES (v_link.user_id, v_revenue_per_step, 'earning', 'Visit Step 1: ' || p_slug);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'link_id', v_link.id,
    'original_url', v_link.original_url,
    'step_count', v_step_count,
    'visit_id', v_visit_id,
    'revenue_per_step', v_revenue_per_step
  );
END;
$function$
;