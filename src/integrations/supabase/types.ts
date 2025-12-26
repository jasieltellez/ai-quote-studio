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
      agency_settings: {
        Row: {
          address: string | null
          agency_name: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          agency_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          agency_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      agent_features: {
        Row: {
          base_cost: number
          base_price: number
          created_at: string
          description: string | null
          id: string
          is_editable: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_cost?: number
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_editable?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_cost?: number
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_editable?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_templates: {
        Row: {
          base_cost: number
          base_price: number
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_cost?: number
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_cost?: number
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotation_agent_features: {
        Row: {
          base_cost: number
          base_price: number
          description: string | null
          id: string
          name: string
          quotation_agent_id: string
        }
        Insert: {
          base_cost?: number
          base_price?: number
          description?: string | null
          id?: string
          name: string
          quotation_agent_id: string
        }
        Update: {
          base_cost?: number
          base_price?: number
          description?: string | null
          id?: string
          name?: string
          quotation_agent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_agent_features_quotation_agent_id_fkey"
            columns: ["quotation_agent_id"]
            isOneToOne: false
            referencedRelation: "quotation_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_agents: {
        Row: {
          created_at: string
          custom_cost: number
          custom_price: number
          description: string | null
          id: string
          name: string
          quantity: number
          quotation_id: string
        }
        Insert: {
          created_at?: string
          custom_cost?: number
          custom_price?: number
          description?: string | null
          id?: string
          name: string
          quantity?: number
          quotation_id: string
        }
        Update: {
          created_at?: string
          custom_cost?: number
          custom_price?: number
          description?: string | null
          id?: string
          name?: string
          quantity?: number
          quotation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_agents_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_company: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          date: string
          discount: number
          id: string
          implementation_cost: number
          implementation_price: number
          monthly_maintenance_cost: number
          monthly_maintenance_price: number
          notes: string | null
          profit: number
          status: Database["public"]["Enums"]["quotation_status"]
          total_cost: number
          total_price: number
          updated_at: string
          user_id: string
          valid_until: string
        }
        Insert: {
          client_company?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          date?: string
          discount?: number
          id?: string
          implementation_cost?: number
          implementation_price?: number
          monthly_maintenance_cost?: number
          monthly_maintenance_price?: number
          notes?: string | null
          profit?: number
          status?: Database["public"]["Enums"]["quotation_status"]
          total_cost?: number
          total_price?: number
          updated_at?: string
          user_id: string
          valid_until?: string
        }
        Update: {
          client_company?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          date?: string
          discount?: number
          id?: string
          implementation_cost?: number
          implementation_price?: number
          monthly_maintenance_cost?: number
          monthly_maintenance_price?: number
          notes?: string | null
          profit?: number
          status?: Database["public"]["Enums"]["quotation_status"]
          total_cost?: number
          total_price?: number
          updated_at?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: []
      }
      template_features: {
        Row: {
          base_cost: number
          base_price: number
          feature_id: string
          id: string
          template_id: string
        }
        Insert: {
          base_cost?: number
          base_price?: number
          feature_id: string
          id?: string
          template_id: string
        }
        Update: {
          base_cost?: number
          base_price?: number
          feature_id?: string
          id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "agent_features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_features_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      quotation_status: "draft" | "sent" | "accepted" | "rejected"
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
      quotation_status: ["draft", "sent", "accepted", "rejected"],
    },
  },
} as const
