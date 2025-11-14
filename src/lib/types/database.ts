export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      buildings: {
        Row: {
          id: string;
          name: string;
          address: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["buildings"]["Insert"]>;
      };
      floors: {
        Row: {
          id: string;
          building_id: string;
          floor_number: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          building_id: string;
          floor_number: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["floors"]["Insert"]>;
      };
      units: {
        Row: {
          id: string;
          building_id: string;
          floor_id: string | null;
          unit_number: string;
          tenant_name: string | null;
          tenant_contact: Json | null;
          public_id: string;
          is_blocked: boolean;
          blocked_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          building_id: string;
          floor_id?: string | null;
          unit_number: string;
          tenant_name?: string | null;
          tenant_contact?: Json | null;
          public_id?: string;
          is_blocked?: boolean;
          blocked_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["units"]["Insert"]>;
      };
      complaint_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category_group: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category_group?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["complaint_categories"]["Insert"]>;
      };
      users: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string | null;
          email: string;
          role: "SUPER_ADMIN" | "ADMIN" | "MANAGEMENT" | "SERVICE_WORKER";
          is_active: boolean;
          service_worker_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          full_name?: string | null;
          email: string;
          role: "SUPER_ADMIN" | "ADMIN" | "MANAGEMENT" | "SERVICE_WORKER";
          is_active?: boolean;
          service_worker_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      complaints: {
        Row: {
          id: string;
          unit_id: string;
          building_id: string;
          status:
            | "NEW"
            | "ASSIGNED"
            | "IN_PROGRESS"
            | "MANAGEMENT_RESOLVED"
            | "PENDING_TENANT_CONFIRMATION"
            | "REOPENED"
            | "REJECTED"
            | "CLOSED";
          tenant_name: string | null;
          tenant_contact: Json | null;
          description: string | null;
          attachments: Json | null;
          rejected_reason: string | null;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
          is_tenant_notified: boolean;
        };
        Insert: {
          id?: string;
          unit_id: string;
          building_id: string;
          status?:
            | "NEW"
            | "ASSIGNED"
            | "IN_PROGRESS"
            | "MANAGEMENT_RESOLVED"
            | "PENDING_TENANT_CONFIRMATION"
            | "REOPENED"
            | "REJECTED"
            | "CLOSED";
          tenant_name?: string | null;
          tenant_contact?: Json | null;
          description?: string | null;
          attachments?: Json | null;
          rejected_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
          is_tenant_notified?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["complaints"]["Insert"]>;
      };
      complaint_category_links: {
        Row: {
          complaint_id: string;
          category_id: string;
        };
        Insert: {
          complaint_id: string;
          category_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["complaint_category_links"]["Insert"]>;
      };
      complaint_assignments: {
        Row: {
          id: string;
          complaint_id: string;
          worker_id: string;
          assigned_by: string | null;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          complaint_id: string;
          worker_id: string;
          assigned_by?: string | null;
          assigned_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["complaint_assignments"]["Insert"]>;
      };
      complaint_status_logs: {
        Row: {
          id: string;
          complaint_id: string;
          old_status:
            | "NEW"
            | "ASSIGNED"
            | "IN_PROGRESS"
            | "MANAGEMENT_RESOLVED"
            | "PENDING_TENANT_CONFIRMATION"
            | "REOPENED"
            | "REJECTED"
            | "CLOSED"
            | null;
          new_status:
            | "NEW"
            | "ASSIGNED"
            | "IN_PROGRESS"
            | "MANAGEMENT_RESOLVED"
            | "PENDING_TENANT_CONFIRMATION"
            | "REOPENED"
            | "REJECTED"
            | "CLOSED";
          changed_by: string | null;
          changed_at: string;
          note: string | null;
        };
        Insert: {
          id?: string;
          complaint_id: string;
          old_status?:
            | "NEW"
            | "ASSIGNED"
            | "IN_PROGRESS"
            | "MANAGEMENT_RESOLVED"
            | "PENDING_TENANT_CONFIRMATION"
            | "REOPENED"
            | "REJECTED"
            | "CLOSED"
            | null;
          new_status:
            | "NEW"
            | "ASSIGNED"
            | "IN_PROGRESS"
            | "MANAGEMENT_RESOLVED"
            | "PENDING_TENANT_CONFIRMATION"
            | "REOPENED"
            | "REJECTED"
            | "CLOSED";
          changed_by?: string | null;
          changed_at?: string;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["complaint_status_logs"]["Insert"]>;
      };
      complaint_messages: {
        Row: {
          id: string;
          complaint_id: string;
          sender_id: string | null;
          sender_type: "TENANT" | "STAFF" | "SYSTEM";
          message_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          complaint_id: string;
          sender_id?: string | null;
          sender_type: "TENANT" | "STAFF" | "SYSTEM";
          message_text: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["complaint_messages"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          payload: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          payload: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Views: {
      complaint_overview: {
        Row: {
          id: string;
          status:
            | "NEW"
            | "ASSIGNED"
            | "IN_PROGRESS"
            | "MANAGEMENT_RESOLVED"
            | "PENDING_TENANT_CONFIRMATION"
            | "REOPENED"
            | "REJECTED"
            | "CLOSED";
          description: string | null;
          created_at: string;
          updated_at: string;
          building_name: string;
          unit_number: string;
          public_id: string;
          categories: string[];
          worker_names: string[];
          aging_seconds: number;
        };
      };
      worker_dashboard_view: {
        Row: {
          worker_id: string;
          complaint_id: string;
          status:
            | "NEW"
            | "ASSIGNED"
            | "IN_PROGRESS"
            | "MANAGEMENT_RESOLVED"
            | "PENDING_TENANT_CONFIRMATION"
            | "REOPENED"
            | "REJECTED"
            | "CLOSED";
          created_at: string;
          building_name: string;
          unit_number: string;
          categories: string[];
        };
      };
    };
    Functions: {
      admin_dashboard_metrics: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_worker_dashboard: {
        Args: {
          p_worker_id: string;
        };
        Returns: Database["public"]["Views"]["worker_dashboard_view"]["Row"];
      };
    };
    Enums: {
      user_role: "SUPER_ADMIN" | "ADMIN" | "MANAGEMENT" | "SERVICE_WORKER";
      complaint_status:
        | "NEW"
        | "ASSIGNED"
        | "IN_PROGRESS"
        | "MANAGEMENT_RESOLVED"
        | "PENDING_TENANT_CONFIRMATION"
        | "REOPENED"
        | "REJECTED"
        | "CLOSED";
      sender_type: "TENANT" | "STAFF" | "SYSTEM";
    };
  };
};
