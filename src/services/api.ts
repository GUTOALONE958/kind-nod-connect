import { supabase } from "@/integrations/supabase/client";

export const linkService = {
  async getLinkBySlug(slug: string) {
    const { data, error } = await supabase
      .from("links")
      .select("*, categories(*), subdomains(*)")
      .eq("short_slug", slug)
      .eq("is_active", true)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createLink(linkData: any) {
    const { data, error } = await supabase
      .from("links")
      .insert([linkData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserLinks(userId: string) {
    const { data, error } = await supabase
      .from("links")
      .select("*, categories(name), subdomains(domain)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

export const visitService = {
  async recordVisit(visitData: any) {
    const { data, error } = await supabase
      .from("visits")
      .insert([visitData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) throw error;
    return data;
  }
};
