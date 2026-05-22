import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: Request) {
  const { slug, visitorData } = await req.json();

  try {
    // 1. Get link
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('*, categories(*)')
      .eq('short_slug', slug)
      .single();

    if (linkError || !link) {
      return new Response(JSON.stringify({ error: 'Link not found' }), { status: 404 });
    }

    // 2. Anti-fraud checks (simple version for now)
    // Check if IP already visited recently
    const { data: recentVisit } = await supabase
      .from('visits')
      .select('id')
      .eq('link_id', link.id)
      .eq('ip_address', visitorData.ip)
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    const isUnique = !recentVisit || recentVisit.length === 0;

    // 3. Record visit
    const revenue = isUnique ? (link.categories.cpm_rate / 1000) : 0;
    
    await supabase.from('visits').insert({
      link_id: link.id,
      ip_address: visitorData.ip,
      user_agent: visitorData.userAgent,
      country_code: visitorData.country,
      is_unique: isUnique,
      revenue_generated: revenue,
      is_valid: true // In production, run more complex checks
    });

    // 4. Update link stats
    await supabase.rpc('increment_link_stats', { 
      link_id: link.id, 
      revenue_inc: revenue,
      unique_inc: isUnique ? 1 : 0
    });

    // 5. Update user balance
    if (revenue > 0) {
      await supabase.rpc('increment_user_balance', {
        user_id: link.user_id,
        amount: revenue
      });
    }

    return new Response(JSON.stringify({ success: true, steps: link.categories.steps_count }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
