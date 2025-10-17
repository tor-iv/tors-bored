export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          is_admin: boolean
          notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          is_admin?: boolean
          notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          is_admin?: boolean
          notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      auctions: {
        Row: {
          id: string
          title: string
          description: string | null
          start_date: string
          end_date: string
          status: 'upcoming' | 'active' | 'ended'
          featured_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_date: string
          end_date: string
          status: 'upcoming' | 'active' | 'ended'
          featured_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string
          status?: 'upcoming' | 'active' | 'ended'
          featured_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          id: string
          auction_id: string | null
          title: string
          description: string | null
          images: string[]
          starting_bid: number
          current_bid: number
          highest_bidder: string | null
          dimensions: Json | null
          techniques: string[]
          weight: number | null
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auction_id?: string | null
          title: string
          description?: string | null
          images?: string[]
          starting_bid: number
          current_bid?: number
          highest_bidder?: string | null
          dimensions?: Json | null
          techniques?: string[]
          weight?: number | null
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auction_id?: string | null
          title?: string
          description?: string | null
          images?: string[]
          starting_bid?: number
          current_bid?: number
          highest_bidder?: string | null
          dimensions?: Json | null
          techniques?: string[]
          weight?: number | null
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_highest_bidder_fkey"
            columns: ["highest_bidder"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      bids: {
        Row: {
          id: string
          item_id: string
          user_id: string
          amount: number
          stripe_payment_intent_id: string | null
          status: 'pending' | 'confirmed' | 'outbid' | 'won'
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          amount: number
          stripe_payment_intent_id?: string | null
          status: 'pending' | 'confirmed' | 'outbid' | 'won'
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string
          amount?: number
          stripe_payment_intent_id?: string | null
          status?: 'pending' | 'confirmed' | 'outbid' | 'won'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      commissions: {
        Row: {
          id: string
          user_id: string
          email: string
          name: string
          description: string
          images: string[]
          budget: number | null
          timeline: string | null
          status: 'submitted' | 'reviewing' | 'accepted' | 'declined' | 'in_progress' | 'completed'
          admin_notes: string | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          name: string
          description: string
          images?: string[]
          budget?: number | null
          timeline?: string | null
          status: 'submitted' | 'reviewing' | 'accepted' | 'declined' | 'in_progress' | 'completed'
          admin_notes?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          name?: string
          description?: string
          images?: string[]
          budget?: number | null
          timeline?: string | null
          status?: 'submitted' | 'reviewing' | 'accepted' | 'declined' | 'in_progress' | 'completed'
          admin_notes?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
