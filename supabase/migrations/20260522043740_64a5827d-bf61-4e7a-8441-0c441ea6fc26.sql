-- Update process_link_visit with new schema
CREATE OR REPLACE FUNCTION public.process_link_visit(
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
  v_revenue_per_step DECIMAL(15, 4) := 0;
  v_visit_id UUID;
BEGIN
  -- 1. Find the link and its category
  SELECT l.*, c.cpm_value, c.step_count 
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

  -- 3. Revenue is now per step. We'll grant the first step revenue immediately.
  -- Total CPM / Total Steps
  IF v_is_unique THEN
    v_revenue_per_step := (v_link.cpm_value / 1000.0) / v_link.step_count;
  END IF;

  -- 4. Record visit (Start)
  INSERT INTO public.visits (
    link_id, ip_address, user_agent, referrer, country_code, device_type, is_unique, revenue_generated
  ) VALUES (
    v_link.id, p_ip, p_user_agent, p_referrer, p_country, p_device, v_is_unique, v_revenue_per_step
  ) RETURNING id INTO v_visit_id;

  -- 5. Update link stats (Initial)
  UPDATE public.links 
  SET 
    total_clicks = total_clicks + 1,
    unique_clicks = unique_clicks + (CASE WHEN v_is_unique THEN 1 ELSE 0 END),
    total_revenue = total_revenue + v_revenue_per_step,
    updated_at = now()
  WHERE id = v_link.id;

  -- 6. Update user balance
  IF v_revenue_per_step > 0 THEN
    UPDATE public.profiles 
    SET 
      balance = balance + v_revenue_per_step,
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
    'step_count', v_link.step_count,
    'visit_id', v_visit_id,
    'revenue_per_step', v_revenue_per_step
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to register additional step views
CREATE OR REPLACE FUNCTION public.register_step_view(
  p_visit_id UUID,
  p_step_number INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_visit RECORD;
  v_link RECORD;
  v_category RECORD;
  v_revenue_per_step DECIMAL(15, 4);
BEGIN
  -- 1. Find the visit and link
  SELECT v.* INTO v_visit FROM public.visits v WHERE v.id = p_visit_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Visit not found');
  END IF;

  SELECT l.*, c.cpm_value, c.step_count 
  INTO v_link 
  FROM public.links l
  JOIN public.categories c ON l.category_id = c.id
  WHERE l.id = v_visit.link_id;

  -- 2. Calculate revenue if unique
  IF v_visit.is_unique THEN
    v_revenue_per_step := (v_link.cpm_value / 1000.0) / v_link.step_count;
    
    -- Update visit revenue
    UPDATE public.visits SET revenue_generated = revenue_generated + v_revenue_per_step WHERE id = p_visit_id;
    
    -- Update link total revenue
    UPDATE public.links SET total_revenue = total_revenue + v_revenue_per_step WHERE id = v_link.id;
    
    -- Update user balance
    UPDATE public.profiles SET balance = balance + v_revenue_per_step WHERE id = v_link.user_id;

    -- Log transaction
    INSERT INTO public.transactions (user_id, amount, type, description)
    VALUES (v_link.user_id, v_revenue_per_step, 'earning', 'Visit Step ' || p_step_number || ': ' || v_link.short_slug);
  END IF;

  RETURN jsonb_build_object('success', true, 'revenue_added', COALESCE(v_revenue_per_step, 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.register_step_view(UUID, INTEGER) TO authenticated, anon;
