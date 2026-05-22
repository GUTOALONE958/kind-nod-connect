export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_config: {
        Row: {
          ad_type: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          provider: string | null
          script_code: string | null
        }
        Insert: {
          ad_type?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          provider?: string | null
          script_code?: string | null
        }
        Update: {
          ad_type?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider?: string | null
          script_code?: string | null
        }
        Relationships: []
      }
      api_tokens: {
        Row: {
          created_at: string | null
          id: string
          last_used_at: string | null
          name: string | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string | null
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          ad_density: string | null
          ads_per_page: number | null
          cpm_value: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          step_count: number
          time_per_step: number | null
          updated_at: string | null
        }
        Insert: {
          ad_density?: string | null
          ads_per_page?: number | null
          cpm_value?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          step_count?: number
          time_per_step?: number | null
          updated_at?: string | null
        }
        Update: {
          ad_density?: string | null
          ads_per_page?: number | null
          cpm_value?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          step_count?: number
          time_per_step?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fraud_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          link_id: string | null
          reason: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          link_id?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          link_id?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_logs_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          category_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          is_private: boolean | null
          original_url: string
          password: string | null
          password_hash: string | null
          settings: Json | null
          short_slug: string
          subdomain_id: string | null
          title: string | null
          total_clicks: number | null
          total_revenue: number | null
          unique_clicks: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          is_private?: boolean | null
          original_url: string
          password?: string | null
          password_hash?: string | null
          settings?: Json | null
          short_slug: string
          subdomain_id?: string | null
          title?: string | null
          total_clicks?: number | null
          total_revenue?: number | null
          unique_clicks?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          is_private?: boolean | null
          original_url?: string
          password?: string | null
          password_hash?: string | null
          settings?: Json | null
          short_slug?: string
          subdomain_id?: string | null
          title?: string | null
          total_clicks?: number | null
          total_revenue?: number | null
          unique_clicks?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_subdomain_id_fkey"
            columns: ["subdomain_id"]
            isOneToOne: false
            referencedRelation: "subdomains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          api_limit_per_minute: number | null
          avatar_url: string | null
          balance: number | null
          created_at: string | null
          display_name: string | null
          id: string
          is_admin: boolean | null
          is_verified: boolean | null
          referral_count: number | null
          referrer_id: string | null
          total_withdrawn: number | null
          updated_at: string | null
        }
        Insert: {
          api_limit_per_minute?: number | null
          avatar_url?: string | null
          balance?: number | null
          created_at?: string | null
          display_name?: string | null
          id: string
          is_admin?: boolean | null
          is_verified?: boolean | null
          referral_count?: number | null
          referrer_id?: string | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Update: {
          api_limit_per_minute?: number | null
          avatar_url?: string | null
          balance?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_verified?: boolean | null
          referral_count?: number | null
          referrer_id?: string | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          commission_earned: number | null
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          commission_earned?: number | null
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          commission_earned?: number | null
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          last_activity: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      subdomains: {
        Row: {
          category_id: string | null
          created_at: string | null
          domain: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "subdomains_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          country_code: string | null
          created_at: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          is_unique: boolean | null
          is_valid: boolean | null
          link_id: string
          referrer: string | null
          revenue_generated: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_unique?: boolean | null
          is_valid?: boolean | null
          link_id: string
          referrer?: string | null
          revenue_generated?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_unique?: boolean | null
          is_valid?: boolean | null
          link_id?: string
          referrer?: string | null
          revenue_generated?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string | null
          id: string
          payment_details: Json
          payment_method: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string | null
          id?: string
          payment_details: Json
          payment_method: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          payment_details?: Json
          payment_method?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_link_stats: {
        Args: { link_id: string; revenue_inc: number; unique_inc: number }
        Returns: undefined
      }
      increment_user_balance: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
      process_link_visit: {
        Args: {
          p_country: string
          p_device: string
          p_ip: string
          p_referrer: string
          p_slug: string
          p_user_agent: string
        }
        Returns: Json
      }
      register_step_view: {
        Args: { p_step_number: number; p_visit_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
