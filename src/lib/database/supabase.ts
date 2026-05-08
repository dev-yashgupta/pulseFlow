import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client-side Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Browser client for client components
export function createBrowserSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server client for server components and API routes
export async function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Admin client for server-side operations (lazy initialized)
let supabaseAdminInstance: any = null;

export function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase admin credentials not configured');
      return null;
    }
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminInstance;
}

export const supabaseAdmin = getSupabaseAdmin();

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'employee' | 'manager' | 'executive' | 'admin';
          department: string;
          manager_id: string | null;
          slack_user_id: string | null;
          salesforce_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'employee' | 'manager' | 'executive' | 'admin';
          department: string;
          manager_id?: string | null;
          slack_user_id?: string | null;
          salesforce_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'employee' | 'manager' | 'executive' | 'admin';
          department?: string;
          manager_id?: string | null;
          slack_user_id?: string | null;
          salesforce_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wellbeing_metrics: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          stress_level: number;
          energy_level: number;
          workload_satisfaction: number;
          work_life_balance: number;
          job_satisfaction: number;
          burnout_risk: number;
          sentiment_score: number;
          source: 'survey' | 'slack_analysis' | 'calendar_analysis' | 'ml_prediction';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          stress_level: number;
          energy_level: number;
          workload_satisfaction: number;
          work_life_balance: number;
          job_satisfaction: number;
          burnout_risk: number;
          sentiment_score: number;
          source: 'survey' | 'slack_analysis' | 'calendar_analysis' | 'ml_prediction';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          stress_level?: number;
          energy_level?: number;
          workload_satisfaction?: number;
          work_life_balance?: number;
          job_satisfaction?: number;
          burnout_risk?: number;
          sentiment_score?: number;
          source?: 'survey' | 'slack_analysis' | 'calendar_analysis' | 'ml_prediction';
          created_at?: string;
        };
      };
      productivity_metrics: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          tasks_completed: number;
          meeting_hours: number;
          focus_time: number;
          sales_activities: number | null;
          crm_updates: number | null;
          response_time: number;
          collaboration_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          tasks_completed: number;
          meeting_hours: number;
          focus_time: number;
          sales_activities?: number | null;
          crm_updates?: number | null;
          response_time: number;
          collaboration_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          tasks_completed?: number;
          meeting_hours?: number;
          focus_time?: number;
          sales_activities?: number | null;
          crm_updates?: number | null;
          response_time?: number;
          collaboration_score?: number;
          created_at?: string;
        };
      };
    };
  };
}
