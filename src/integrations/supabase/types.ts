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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      booking_orders: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          item_name: string
          item_price: number
          quantity: number
          status: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          item_name: string
          item_price: number
          quantity?: number
          status?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          item_name?: string
          item_price?: number
          quantity?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_orders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          area_cost: number
          booking_type: string
          created_at: string
          deposit_amount: number
          deposit_paid: boolean
          details: string
          id: string
          orders_cost: number
          payment_method: string
          payment_status: string
          person_count: number | null
          points_earned: number
          room_name: string | null
          status: string
          total_cost: number
          type: string
          user_id: string
        }
        Insert: {
          area_cost?: number
          booking_type?: string
          created_at?: string
          deposit_amount?: number
          deposit_paid?: boolean
          details?: string
          id?: string
          orders_cost?: number
          payment_method?: string
          payment_status?: string
          person_count?: number | null
          points_earned?: number
          room_name?: string | null
          status?: string
          total_cost?: number
          type: string
          user_id: string
        }
        Update: {
          area_cost?: number
          booking_type?: string
          created_at?: string
          deposit_amount?: number
          deposit_paid?: boolean
          details?: string
          id?: string
          orders_cost?: number
          payment_method?: string
          payment_status?: string
          person_count?: number | null
          points_earned?: number
          room_name?: string | null
          status?: string
          total_cost?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          image_url: string
          sort_order: number
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          image_url: string
          sort_order?: number
          title?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      loyalty_settings: {
        Row: {
          amount_for_points: number
          daily_code: string
          id: string
          min_redeem_points: number
          point_value: number
          points_per_amount: number
          public_area_price_per_hour: number
          updated_at: string
          vodafone_cash_number: string
        }
        Insert: {
          amount_for_points?: number
          daily_code?: string
          id?: string
          min_redeem_points?: number
          point_value?: number
          points_per_amount?: number
          public_area_price_per_hour?: number
          updated_at?: string
          vodafone_cash_number?: string
        }
        Update: {
          amount_for_points?: number
          daily_code?: string
          id?: string
          min_redeem_points?: number
          point_value?: number
          points_per_amount?: number
          public_area_price_per_hour?: number
          updated_at?: string
          vodafone_cash_number?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
          points: number
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          phone: string
          points?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
          points?: number
        }
        Relationships: []
      }
      rooms: {
        Row: {
          available: boolean
          capacity: number
          created_at: string
          deposit_amount: number
          id: string
          image_url: string | null
          name: string
          price_per_hour: number
        }
        Insert: {
          available?: boolean
          capacity?: number
          created_at?: string
          deposit_amount?: number
          id?: string
          image_url?: string | null
          name: string
          price_per_hour?: number
        }
        Update: {
          available?: boolean
          capacity?: number
          created_at?: string
          deposit_amount?: number
          id?: string
          image_url?: string | null
          name?: string
          price_per_hour?: number
        }
        Relationships: []
      }
      staff_permissions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          permissions: Json
          role_label: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          permissions?: Json
          role_label?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          permissions?: Json
          role_label?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
