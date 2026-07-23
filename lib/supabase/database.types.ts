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
      batch_contacts: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["batch_contact_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["batch_contact_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["batch_contact_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_contacts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_contacts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          branch_id: string | null
          coaching_id: string
          created_at: string
          curriculum: Json
          deleted_at: string | null
          discounted_fee: number | null
          duration_months: number | null
          exam_id: string
          fee: number | null
          fee_type: Database["public"]["Enums"]["fee_type"]
          id: string
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
          branch_id?: string | null
          coaching_id: string
          created_at?: string
          curriculum?: Json
          deleted_at?: string | null
          discounted_fee?: number | null
          duration_months?: number | null
          exam_id: string
          fee?: number | null
          fee_type?: Database["public"]["Enums"]["fee_type"]
          id?: string
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
          branch_id?: string | null
          coaching_id?: string
          created_at?: string
          curriculum?: Json
          deleted_at?: string | null
          discounted_fee?: number | null
          duration_months?: number | null
          exam_id?: string
          fee?: number | null
          fee_type?: Database["public"]["Enums"]["fee_type"]
          id?: string
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
            foreignKeyName: "batches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "coaching_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_coaching_id_fkey"
            columns: ["coaching_id"]
            isOneToOne: false
            referencedRelation: "coaching_institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exam_categories"
            referencedColumns: ["id"]
          },
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
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          reading_time: number | null
          seo: Json
          slug: string
          status: Database["public"]["Enums"]["blog_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_time?: number | null
          seo?: Json
          slug: string
          status?: Database["public"]["Enums"]["blog_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_time?: number | null
          seo?: Json
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: string
          is_popular: boolean
          latitude: number | null
          longitude: number | null
          name: string
          slug: string
          state_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_popular?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          slug: string
          state_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_popular?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          slug?: string
          state_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_branches: {
        Row: {
          address: string | null
          city_id: string
          coaching_id: string
          created_at: string
          id: string
          is_primary: boolean
          latitude: number | null
          longitude: number | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city_id: string
          coaching_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city_id?: string
          coaching_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_branches_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_branches_coaching_id_fkey"
            columns: ["coaching_id"]
            isOneToOne: false
            referencedRelation: "coaching_institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_claims: {
        Row: {
          admin_note: string | null
          coaching_id: string | null
          created_at: string
          document_id: string | null
          id: string
          profile_id: string
          reviewed_by: string | null
          status: Database["public"]["Enums"]["discount_request_status"]
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          coaching_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          profile_id: string
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["discount_request_status"]
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          coaching_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          profile_id?: string
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["discount_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_claims_coaching_id_fkey"
            columns: ["coaching_id"]
            isOneToOne: false
            referencedRelation: "coaching_institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_claims_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "student_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_claims_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_claims_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_faculty: {
        Row: {
          bio: string | null
          coaching_id: string
          created_at: string
          experience_years: number | null
          id: string
          name: string
          photo_url: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          coaching_id: string
          created_at?: string
          experience_years?: number | null
          id?: string
          name: string
          photo_url?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          coaching_id?: string
          created_at?: string
          experience_years?: number | null
          id?: string
          name?: string
          photo_url?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_faculty_coaching_id_fkey"
            columns: ["coaching_id"]
            isOneToOne: false
            referencedRelation: "coaching_institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_institutes: {
        Row: {
          claim_status: Database["public"]["Enums"]["claim_status"]
          contact_email: string | null
          contact_phone: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_verified: boolean
          logo_url: string | null
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          name: string
          published_at: string | null
          rating_avg: number
          rating_count: number
          reviewed_by: string | null
          seo: Json
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          claim_status?: Database["public"]["Enums"]["claim_status"]
          contact_email?: string | null
          contact_phone?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean
          logo_url?: string | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          name: string
          published_at?: string | null
          rating_avg?: number
          rating_count?: number
          reviewed_by?: string | null
          seo?: Json
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          claim_status?: Database["public"]["Enums"]["claim_status"]
          contact_email?: string | null
          contact_phone?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean
          logo_url?: string | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          name?: string
          published_at?: string | null
          rating_avg?: number
          rating_count?: number
          reviewed_by?: string | null
          seo?: Json
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_institutes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_institutes_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_member_branches: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          member_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          member_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_member_branches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "coaching_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_member_branches_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "coaching_members"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_members: {
        Row: {
          all_branches: boolean
          coaching_id: string
          created_at: string
          id: string
          invited_by: string | null
          member_role: Database["public"]["Enums"]["member_role"]
          profile_id: string
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
        }
        Insert: {
          all_branches?: boolean
          coaching_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          member_role?: Database["public"]["Enums"]["member_role"]
          profile_id: string
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Update: {
          all_branches?: boolean
          coaching_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          member_role?: Database["public"]["Enums"]["member_role"]
          profile_id?: string
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_members_coaching_id_fkey"
            columns: ["coaching_id"]
            isOneToOne: false
            referencedRelation: "coaching_institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_requests: {
        Row: {
          admin_note: string | null
          batch_id: string | null
          created_at: string
          document_id: string | null
          id: string
          reason_text: string | null
          reason_type: Database["public"]["Enums"]["discount_reason"]
          reviewed_by: string | null
          status: Database["public"]["Enums"]["discount_request_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          batch_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          reason_text?: string | null
          reason_type: Database["public"]["Enums"]["discount_reason"]
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["discount_request_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          batch_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          reason_text?: string | null
          reason_type?: Database["public"]["Enums"]["discount_reason"]
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["discount_request_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_requests_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "student_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discounts: {
        Row: {
          amount: number | null
          batch_id: string | null
          coaching_id: string
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          percent: number | null
          title: string
          updated_at: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          amount?: number | null
          batch_id?: string | null
          coaching_id: string
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          percent?: number | null
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          amount?: number | null
          batch_id?: string | null
          coaching_id?: string
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          percent?: number | null
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discounts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discounts_coaching_id_fkey"
            columns: ["coaching_id"]
            isOneToOne: false
            referencedRelation: "coaching_institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          seo: Json
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          seo?: Json
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          seo?: Json
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "exam_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          parent_id: string
          parent_type: Database["public"]["Enums"]["faq_parent_type"]
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          parent_id: string
          parent_type: Database["public"]["Enums"]["faq_parent_type"]
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          parent_id?: string
          parent_type?: Database["public"]["Enums"]["faq_parent_type"]
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          folder: string | null
          height: number | null
          id: string
          size: number | null
          type: string | null
          updated_at: string
          uploader_id: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          folder?: string | null
          height?: number | null
          id?: string
          size?: number | null
          type?: string | null
          updated_at?: string
          uploader_id?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          folder?: string | null
          height?: number | null
          id?: string
          size?: number | null
          type?: string | null
          updated_at?: string
          uploader_id?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          status: Database["public"]["Enums"]["newsletter_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          status?: Database["public"]["Enums"]["newsletter_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          status?: Database["public"]["Enums"]["newsletter_status"]
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
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
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          reason: string
          reporter_id: string | null
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          reason: string
          reporter_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          reason?: string
          reporter_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_posts: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          city_id: string | null
          created_at: string
          description: string | null
          exam_id: string | null
          id: string
          language: Database["public"]["Enums"]["batch_language"] | null
          mode: Database["public"]["Enums"]["batch_mode"] | null
          status: Database["public"]["Enums"]["requirement_status"]
          student_id: string
          study_start_date: string | null
          target_year: number | null
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          city_id?: string | null
          created_at?: string
          description?: string | null
          exam_id?: string | null
          id?: string
          language?: Database["public"]["Enums"]["batch_language"] | null
          mode?: Database["public"]["Enums"]["batch_mode"] | null
          status?: Database["public"]["Enums"]["requirement_status"]
          student_id: string
          study_start_date?: string | null
          target_year?: number | null
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          city_id?: string | null
          created_at?: string
          description?: string | null
          exam_id?: string | null
          id?: string
          language?: Database["public"]["Enums"]["batch_language"] | null
          mode?: Database["public"]["Enums"]["batch_mode"] | null
          status?: Database["public"]["Enums"]["requirement_status"]
          student_id?: string
          study_start_date?: string | null
          target_year?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_posts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_posts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exam_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_posts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_id: string
          body: string | null
          coaching_id: string
          created_at: string
          id: string
          is_verified: boolean
          rating: number
          status: Database["public"]["Enums"]["review_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          body?: string | null
          coaching_id: string
          created_at?: string
          id?: string
          is_verified?: boolean
          rating: number
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string | null
          coaching_id?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          rating?: number
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_coaching_id_fkey"
            columns: ["coaching_id"]
            isOneToOne: false
            referencedRelation: "coaching_institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_batches: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_batches_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_batches_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          group: Database["public"]["Enums"]["settings_group"]
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          group?: Database["public"]["Enums"]["settings_group"]
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          group?: Database["public"]["Enums"]["settings_group"]
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      states: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_documents: {
        Row: {
          created_at: string
          file_size: number | null
          file_url: string
          id: string
          is_verified: boolean
          owner_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          file_url: string
          id?: string
          is_verified?: boolean
          owner_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_verified?: boolean
          owner_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_preferences: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          contact_time: string | null
          created_at: string
          fee_type: Database["public"]["Enums"]["fee_type"] | null
          id: string
          language: Database["public"]["Enums"]["batch_language"] | null
          preferred_city_id: string | null
          preferred_coaching: string | null
          profile_id: string
          study_mode: Database["public"]["Enums"]["batch_mode"] | null
          study_start_date: string | null
          target_exam_id: string | null
          target_year: number | null
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          contact_time?: string | null
          created_at?: string
          fee_type?: Database["public"]["Enums"]["fee_type"] | null
          id?: string
          language?: Database["public"]["Enums"]["batch_language"] | null
          preferred_city_id?: string | null
          preferred_coaching?: string | null
          profile_id: string
          study_mode?: Database["public"]["Enums"]["batch_mode"] | null
          study_start_date?: string | null
          target_exam_id?: string | null
          target_year?: number | null
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          contact_time?: string | null
          created_at?: string
          fee_type?: Database["public"]["Enums"]["fee_type"] | null
          id?: string
          language?: Database["public"]["Enums"]["batch_language"] | null
          preferred_city_id?: string | null
          preferred_coaching?: string | null
          profile_id?: string
          study_mode?: Database["public"]["Enums"]["batch_mode"] | null
          study_start_date?: string | null
          target_exam_id?: string | null
          target_year?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_preferences_preferred_city_id_fkey"
            columns: ["preferred_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_preferences_target_exam_id_fkey"
            columns: ["target_exam_id"]
            isOneToOne: false
            referencedRelation: "exam_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          exam: string | null
          id: string
          is_featured: boolean
          name: string
          quote: string
          rating: number | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          exam?: string | null
          id?: string
          is_featured?: boolean
          name: string
          quote: string
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          exam?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          quote?: string
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_expired_requirements: { Args: never; Returns: undefined }
      can_manage_branch: {
        Args: { target_branch: string; target_coaching: string }
        Returns: boolean
      }
      current_profile_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_active_member_of: {
        Args: { target_coaching: string }
        Returns: boolean
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
