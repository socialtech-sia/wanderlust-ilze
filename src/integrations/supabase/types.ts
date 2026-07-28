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
      blog_posts: {
        Row: {
          content_en: string | null
          content_es: string | null
          content_lv: string | null
          created_at: string
          excerpt_en: string | null
          excerpt_es: string | null
          excerpt_lv: string | null
          featured_image_id: string | null
          id: string
          meta_description_en: string | null
          meta_description_es: string | null
          meta_description_lv: string | null
          meta_title_en: string | null
          meta_title_es: string | null
          meta_title_lv: string | null
          published_at: string | null
          slug_en: string | null
          slug_es: string | null
          slug_lv: string | null
          status: string
          tags: string[] | null
          title_en: string | null
          title_es: string | null
          title_lv: string | null
          updated_at: string
        }
        Insert: {
          content_en?: string | null
          content_es?: string | null
          content_lv?: string | null
          created_at?: string
          excerpt_en?: string | null
          excerpt_es?: string | null
          excerpt_lv?: string | null
          featured_image_id?: string | null
          id?: string
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_description_lv?: string | null
          meta_title_en?: string | null
          meta_title_es?: string | null
          meta_title_lv?: string | null
          published_at?: string | null
          slug_en?: string | null
          slug_es?: string | null
          slug_lv?: string | null
          status?: string
          tags?: string[] | null
          title_en?: string | null
          title_es?: string | null
          title_lv?: string | null
          updated_at?: string
        }
        Update: {
          content_en?: string | null
          content_es?: string | null
          content_lv?: string | null
          created_at?: string
          excerpt_en?: string | null
          excerpt_es?: string | null
          excerpt_lv?: string | null
          featured_image_id?: string | null
          id?: string
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_description_lv?: string | null
          meta_title_en?: string | null
          meta_title_es?: string | null
          meta_title_lv?: string | null
          published_at?: string | null
          slug_en?: string | null
          slug_es?: string | null
          slug_lv?: string | null
          status?: string
          tags?: string[] | null
          title_en?: string | null
          title_es?: string | null
          title_lv?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_featured_image_id_fkey"
            columns: ["featured_image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          admin_notes: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_country: string | null
          customer_email: string
          customer_language:
            | Database["public"]["Enums"]["booking_language"]
            | null
          customer_name: string
          customer_phone: string | null
          final_price_eur: number | null
          id: string
          notes: string | null
          notification_error: string | null
          notification_sent_at: string | null
          persons_count: number
          quoted_price_eur: number | null
          reference_code: string
          requested_date: string
          requested_time: string | null
          service_id: string
          service_snapshot: Json | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_country?: string | null
          customer_email: string
          customer_language?:
            | Database["public"]["Enums"]["booking_language"]
            | null
          customer_name: string
          customer_phone?: string | null
          final_price_eur?: number | null
          id?: string
          notes?: string | null
          notification_error?: string | null
          notification_sent_at?: string | null
          persons_count?: number
          quoted_price_eur?: number | null
          reference_code?: string
          requested_date: string
          requested_time?: string | null
          service_id: string
          service_snapshot?: Json | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_country?: string | null
          customer_email?: string
          customer_language?:
            | Database["public"]["Enums"]["booking_language"]
            | null
          customer_name?: string
          customer_phone?: string | null
          final_price_eur?: number | null
          id?: string
          notes?: string | null
          notification_error?: string | null
          notification_sent_at?: string | null
          persons_count?: number
          quoted_price_eur?: number | null
          reference_code?: string
          requested_date?: string
          requested_time?: string | null
          service_id?: string
          service_snapshot?: Json | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          id: string
          language: string | null
          last_message_at: string
          message_count: number
          session_id: string
          started_at: string
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          id?: string
          language?: string | null
          last_message_at?: string
          message_count?: number
          session_id: string
          started_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          id?: string
          language?: string | null
          last_message_at?: string
          message_count?: number
          session_id?: string
          started_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          role: string
          session_id: string | null
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role: string
          session_id?: string | null
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role?: string
          session_id?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          language: string | null
          message: string
          name: string
          notification_error: string | null
          notification_sent_at: string | null
          phone: string | null
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          language?: string | null
          message: string
          name: string
          notification_error?: string | null
          notification_sent_at?: string | null
          phone?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          language?: string | null
          message?: string
          name?: string
          notification_error?: string | null
          notification_sent_at?: string | null
          phone?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      enter_gauja_categories: {
        Row: {
          color_hex: string | null
          description_en: string | null
          description_es: string | null
          description_lv: string | null
          icon_name: string | null
          key: Database["public"]["Enums"]["enter_gauja_category"]
          name_en: string | null
          name_es: string | null
          name_lv: string | null
          sort_order: number
        }
        Insert: {
          color_hex?: string | null
          description_en?: string | null
          description_es?: string | null
          description_lv?: string | null
          icon_name?: string | null
          key: Database["public"]["Enums"]["enter_gauja_category"]
          name_en?: string | null
          name_es?: string | null
          name_lv?: string | null
          sort_order?: number
        }
        Update: {
          color_hex?: string | null
          description_en?: string | null
          description_es?: string | null
          description_lv?: string | null
          icon_name?: string | null
          key?: Database["public"]["Enums"]["enter_gauja_category"]
          name_en?: string | null
          name_es?: string | null
          name_lv?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer_en: string | null
          answer_es: string | null
          answer_lv: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          question_en: string | null
          question_es: string | null
          question_lv: string
          sort_order: number
        }
        Insert: {
          answer_en?: string | null
          answer_es?: string | null
          answer_lv: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question_en?: string | null
          question_es?: string | null
          question_lv: string
          sort_order?: number
        }
        Update: {
          answer_en?: string | null
          answer_es?: string | null
          answer_lv?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question_en?: string | null
          question_es?: string | null
          question_lv?: string
          sort_order?: number
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_en: string | null
          alt_es: string | null
          alt_lv: string | null
          bucket: string
          caption_en: string | null
          caption_es: string | null
          caption_lv: string | null
          created_at: string
          file_size_bytes: number | null
          height: number | null
          id: string
          mime_type: string | null
          storage_path: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_en?: string | null
          alt_es?: string | null
          alt_lv?: string | null
          bucket?: string
          caption_en?: string | null
          caption_es?: string | null
          caption_lv?: string | null
          created_at?: string
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          storage_path: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_en?: string | null
          alt_es?: string | null
          alt_lv?: string | null
          bucket?: string
          caption_en?: string | null
          caption_es?: string | null
          caption_lv?: string | null
          created_at?: string
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          storage_path?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      profile: {
        Row: {
          avatar_storage_path: string | null
          bio_en: string | null
          bio_es: string | null
          bio_lv: string | null
          certifications: Json | null
          created_at: string
          email: string | null
          full_name: string
          hero_image_storage_path: string | null
          id: string
          languages_spoken: string[] | null
          phone: string | null
          role_en: string | null
          role_es: string | null
          role_lv: string | null
          short_bio_en: string | null
          short_bio_es: string | null
          short_bio_lv: string | null
          updated_at: string
          whatsapp: string | null
          years_of_experience: number | null
        }
        Insert: {
          avatar_storage_path?: string | null
          bio_en?: string | null
          bio_es?: string | null
          bio_lv?: string | null
          certifications?: Json | null
          created_at?: string
          email?: string | null
          full_name: string
          hero_image_storage_path?: string | null
          id?: string
          languages_spoken?: string[] | null
          phone?: string | null
          role_en?: string | null
          role_es?: string | null
          role_lv?: string | null
          short_bio_en?: string | null
          short_bio_es?: string | null
          short_bio_lv?: string | null
          updated_at?: string
          whatsapp?: string | null
          years_of_experience?: number | null
        }
        Update: {
          avatar_storage_path?: string | null
          bio_en?: string | null
          bio_es?: string | null
          bio_lv?: string | null
          certifications?: Json | null
          created_at?: string
          email?: string | null
          full_name?: string
          hero_image_storage_path?: string | null
          id?: string
          languages_spoken?: string[] | null
          phone?: string | null
          role_en?: string | null
          role_es?: string | null
          role_lv?: string | null
          short_bio_en?: string | null
          short_bio_es?: string | null
          short_bio_lv?: string | null
          updated_at?: string
          whatsapp?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description_en: string | null
          description_es: string | null
          description_lv: string | null
          difficulty: Database["public"]["Enums"]["service_difficulty"] | null
          duration_minutes: number | null
          enter_gauja_categories:
            | Database["public"]["Enums"]["enter_gauja_category"][]
            | null
          gallery_image_ids: string[] | null
          hero_image_storage_path: string | null
          id: string
          is_active: boolean
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          max_persons: number | null
          meta_description_en: string | null
          meta_description_es: string | null
          meta_description_lv: string | null
          meta_title_en: string | null
          meta_title_es: string | null
          meta_title_lv: string | null
          min_persons: number | null
          price_from_eur: number | null
          price_per_person: boolean | null
          short_description_en: string | null
          short_description_es: string | null
          short_description_lv: string | null
          slug_en: string | null
          slug_es: string | null
          slug_lv: string | null
          sort_order: number
          title_en: string | null
          title_es: string | null
          title_lv: string
          transfer_from: string | null
          transfer_to: string | null
          type: Database["public"]["Enums"]["service_type"]
          updated_at: string
          vehicle_info: string | null
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          description_lv?: string | null
          difficulty?: Database["public"]["Enums"]["service_difficulty"] | null
          duration_minutes?: number | null
          enter_gauja_categories?:
            | Database["public"]["Enums"]["enter_gauja_category"][]
            | null
          gallery_image_ids?: string[] | null
          hero_image_storage_path?: string | null
          id?: string
          is_active?: boolean
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          max_persons?: number | null
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_description_lv?: string | null
          meta_title_en?: string | null
          meta_title_es?: string | null
          meta_title_lv?: string | null
          min_persons?: number | null
          price_from_eur?: number | null
          price_per_person?: boolean | null
          short_description_en?: string | null
          short_description_es?: string | null
          short_description_lv?: string | null
          slug_en?: string | null
          slug_es?: string | null
          slug_lv?: string | null
          sort_order?: number
          title_en?: string | null
          title_es?: string | null
          title_lv: string
          transfer_from?: string | null
          transfer_to?: string | null
          type: Database["public"]["Enums"]["service_type"]
          updated_at?: string
          vehicle_info?: string | null
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          description_lv?: string | null
          difficulty?: Database["public"]["Enums"]["service_difficulty"] | null
          duration_minutes?: number | null
          enter_gauja_categories?:
            | Database["public"]["Enums"]["enter_gauja_category"][]
            | null
          gallery_image_ids?: string[] | null
          hero_image_storage_path?: string | null
          id?: string
          is_active?: boolean
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          max_persons?: number | null
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_description_lv?: string | null
          meta_title_en?: string | null
          meta_title_es?: string | null
          meta_title_lv?: string | null
          min_persons?: number | null
          price_from_eur?: number | null
          price_per_person?: boolean | null
          short_description_en?: string | null
          short_description_es?: string | null
          short_description_lv?: string | null
          slug_en?: string | null
          slug_es?: string | null
          slug_lv?: string | null
          sort_order?: number
          title_en?: string | null
          title_es?: string | null
          title_lv?: string
          transfer_from?: string | null
          transfer_to?: string | null
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
          vehicle_info?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_country: string | null
          author_name: string
          created_at: string
          id: string
          is_active: boolean
          rating: number
          service_id: string | null
          sort_order: number
          text_en: string | null
          text_es: string | null
          text_lv: string | null
          updated_at: string
        }
        Insert: {
          author_country?: string | null
          author_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          rating?: number
          service_id?: string | null
          sort_order?: number
          text_en?: string | null
          text_es?: string | null
          text_lv?: string | null
          updated_at?: string
        }
        Update: {
          author_country?: string | null
          author_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          rating?: number
          service_id?: string | null
          sort_order?: number
          text_en?: string | null
          text_es?: string | null
          text_lv?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_booking: {
        Args: {
          p_customer_country: string
          p_customer_email: string
          p_customer_language: string
          p_customer_name: string
          p_customer_phone: string
          p_notes: string
          p_persons_count: number
          p_requested_date: string
          p_requested_time: string
          p_service_id: string
          p_service_snapshot: Json
        }
        Returns: {
          id: string
          reference_code: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_language: "lv" | "en" | "es"
      booking_status:
        | "pending"
        | "confirmed"
        | "declined"
        | "completed"
        | "cancelled"
        | "no_show"
      enter_gauja_category:
        | "action"
        | "nature"
        | "history"
        | "culture"
        | "getaround"
      service_difficulty: "easy" | "medium" | "hard"
      service_type: "excursion" | "hiking" | "transfer"
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
      app_role: ["admin", "moderator", "user"],
      booking_language: ["lv", "en", "es"],
      booking_status: [
        "pending",
        "confirmed",
        "declined",
        "completed",
        "cancelled",
        "no_show",
      ],
      enter_gauja_category: [
        "action",
        "nature",
        "history",
        "culture",
        "getaround",
      ],
      service_difficulty: ["easy", "medium", "hard"],
      service_type: ["excursion", "hiking", "transfer"],
    },
  },
} as const
