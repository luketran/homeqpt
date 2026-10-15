// Kiểu dữ liệu DB — khớp supabase/migrations/0001_init.sql.
// Có thể thay bằng `supabase gen types typescript` khi cần.

export type UserRole = "admin" | "tenant";
export type RoomStatus = "vacant" | "occupied";
export type InvoiceStatus = "unpaid" | "paid";

export interface ExtraCharge {
  name: string;
  amount: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          code: string;
          name: string | null;
          price: number;
          area: number | null;
          status: RoomStatus;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name?: string | null;
          price?: number;
          area?: number | null;
          status?: RoomStatus;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rooms"]["Insert"]>;
        Relationships: [];
      };
      tenants: {
        Row: {
          id: string;
          profile_id: string | null;
          room_id: string | null;
          full_name: string;
          phone: string | null;
          id_number: string | null;
          move_in_date: string | null;
          move_out_date: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          room_id?: string | null;
          full_name: string;
          phone?: string | null;
          id_number?: string | null;
          move_in_date?: string | null;
          move_out_date?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: number;
          electricity_price: number;
          water_price: number;
          management_fee: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          electricity_price?: number;
          water_price?: number;
          management_fee?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
      meter_readings: {
        Row: {
          id: string;
          room_id: string;
          period_year: number;
          period_month: number;
          elec_old: number;
          elec_new: number;
          water_old: number;
          water_new: number;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          period_year: number;
          period_month: number;
          elec_old?: number;
          elec_new?: number;
          water_old?: number;
          water_new?: number;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["meter_readings"]["Insert"]>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          room_id: string;
          period_year: number;
          period_month: number;
          room_price: number;
          elec_amount: number;
          water_amount: number;
          management_fee: number;
          extra_charges: ExtraCharge[];
          total: number;
          status: InvoiceStatus;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          period_year: number;
          period_month: number;
          room_price?: number;
          elec_amount?: number;
          water_amount?: number;
          management_fee?: number;
          extra_charges?: ExtraCharge[];
          total?: number;
          status?: InvoiceStatus;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: { Args: Record<never, never>; Returns: boolean };
      my_room_ids: { Args: Record<never, never>; Returns: string[] };
    };
    Enums: {
      user_role: UserRole;
      room_status: RoomStatus;
      invoice_status: InvoiceStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}
