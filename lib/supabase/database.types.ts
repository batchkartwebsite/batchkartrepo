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
      admin_users: {
        Row: {
          created_at: string
          id: string
          last_ip: unknown
          last_login_at: string | null
          permissions: Json
          profile_id: string
          security_pin_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_ip?: unknown
          last_login_at?: string | null
          permissions?: Json
          profile_id: string
          security_pin_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_ip?: unknown
          last_login_at?: string | null
          permissions?: Json
          profile_id?: string
          security_pin_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          changes: Json
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          changes?: Json
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          changes?: Json
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          city: string | null
          contact_phone: string | null
          created_at: string
          curriculum: Json
          deleted_at: string | null
          description: string | null
          discounted_fee: number | null
          duration_months: number | null
          exam: string | null
          fee: number | null
          fee_type: Database["public"]["Enums"]["fee_type"]
          id: string
          institute_name: string | null
          language: Database["public"]["Enums"]["batch_language"]
          mode: Database["public"]["Enums"]["batch_mode"]
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          name: string
          published_at: string | null
          reviewed_by: string | null
          scholarship_available: boolean
          search_vector: unknown
          seats_left: number | null
          seats_total: number | null
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["batch_status"]
          submitted_by: string | null
          teacher: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          contact_phone?: string | null
          created_at?: string
          curriculum?: Json
          deleted_at?: string | null
          description?: string | null
          discounted_fee?: number | null
          duration_months?: number | null
          exam?: string | null
          fee?: number | null
          fee_type?: Database["public"]["Enums"]["fee_type"]
          id?: string
          institute_name?: string | null
          language?: Database["public"]["Enums"]["batch_language"]
          mode?: Database["public"]["Enums"]["batch_mode"]
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          name: string
          published_at?: string | null
          reviewed_by?: string | null
          scholarship_available?: boolean
          search_vector?: unknown
          seats_left?: number | null
          seats_total?: number | null
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["batch_status"]
          submitted_by?: string | null
          teacher?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          contact_phone?: string | null
          created_at?: string
          curriculum?: Json
          deleted_at?: string | null
          description?: string | null
          discounted_fee?: number | null
          duration_months?: number | null
          exam?: string | null
          fee?: number | null
          fee_type?: Database["public"]["Enums"]["fee_type"]
          id?: string
          institute_name?: string | null
          language?: Database["public"]["Enums"]["batch_language"]
          mode?: Database["public"]["Enums"]["batch_mode"]
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          name?: string
          published_at?: string | null
          reviewed_by?: string | null
          scholarship_available?: boolean
          search_vector?: unknown
          seats_left?: number | null
          seats_total?: number | null
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["batch_status"]
          submitted_by?: string | null
          teacher?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          city_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          city_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      queries: {
        Row: {
          batch_id: string | null
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          phone: string
          status: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          phone: string
          status?: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "queries_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      batch_contact_status: "contacted" | "applied"
      batch_language: "english" | "hindi" | "hinglish" | "regional"
      batch_mode: "online" | "offline" | "hybrid"
      batch_status: "active" | "inactive" | "archived"
      blog_status: "draft" | "published"
      claim_status: "unclaimed" | "pending" | "claimed"
      discount_reason:
        | "financial_need"
        | "merit"
        | "first_generation"
        | "sibling"
        | "switching"
        | "other"
      discount_request_status: "pending" | "approved" | "rejected"
      faq_parent_type: "coaching" | "batch"
      fee_type: "one_time" | "emi"
      member_role: "owner" | "manager" | "editor"
      member_status: "invited" | "active" | "suspended"
      moderation_status: "draft" | "pending" | "published" | "rejected"
      newsletter_status: "subscribed" | "unsubscribed"
      notification_type:
        | "welcome"
        | "requirement_submitted"
        | "requirement_updated"
        | "discount_approved"
        | "discount_rejected"
        | "batch_recommendation"
        | "review_status"
        | "admin"
        | "system"
      report_status: "open" | "reviewing" | "resolved" | "dismissed"
      requirement_status: "active" | "paused" | "archived" | "deleted"
      review_status: "pending" | "approved" | "rejected"
      settings_group: "seo" | "homepage" | "general"
      user_role: "student" | "coaching_admin" | "admin"
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
    Enums: {
      batch_contact_status: ["contacted", "applied"],
      batch_language: ["english", "hindi", "hinglish", "regional"],
      batch_mode: ["online", "offline", "hybrid"],
      batch_status: ["active", "inactive", "archived"],
      blog_status: ["draft", "published"],
      claim_status: ["unclaimed", "pending", "claimed"],
      discount_reason: [
        "financial_need",
        "merit",
        "first_generation",
        "sibling",
        "switching",
        "other",
      ],
      discount_request_status: ["pending", "approved", "rejected"],
      faq_parent_type: ["coaching", "batch"],
      fee_type: ["one_time", "emi"],
      member_role: ["owner", "manager", "editor"],
      member_status: ["invited", "active", "suspended"],
      moderation_status: ["draft", "pending", "published", "rejected"],
      newsletter_status: ["subscribed", "unsubscribed"],
      notification_type: [
        "welcome",
        "requirement_submitted",
        "requirement_updated",
        "discount_approved",
        "discount_rejected",
        "batch_recommendation",
        "review_status",
        "admin",
        "system",
      ],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      requirement_status: ["active", "paused", "archived", "deleted"],
      review_status: ["pending", "approved", "rejected"],
      settings_group: ["seo", "homepage", "general"],
      user_role: ["student", "coaching_admin", "admin"],
    },
  },
} as const
