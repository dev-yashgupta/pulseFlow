import { supabase, createBrowserSupabaseClient } from './supabase';
import type {
  User,
  WellbeingMetric,
  ProductivityMetric,
  WellbeingAlert,
  Recommendation,
  Team,
  SlackData,
  SalesforceData
} from '@/types';

// Helper function to get Supabase client
function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase not configured. Please check your environment variables.');
  }
  return supabase;
}

// User services
export const userService = {
  async getUser(id: string): Promise<User | null> {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) return null;
    return data;
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTeamMembers(managerId: string): Promise<User[]> {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select('*')
      .eq('manager_id', managerId);
    
    if (error) throw error;
    return data || [];
  }
};

// Wellbeing services
export const wellbeingService = {
  async getWellbeingMetrics(userId: string, days: number = 30): Promise<WellbeingMetric[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await getSupabaseClient()
      .from('wellbeing_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createWellbeingMetric(metric: Partial<WellbeingMetric>): Promise<WellbeingMetric> {
    const { data, error } = await getSupabaseClient()
      .from('wellbeing_metrics')
      .insert(metric)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getLatestWellbeingScore(userId: string): Promise<number> {
    const { data, error } = await getSupabaseClient()
      .from('wellbeing_metrics')
      .select('stress_level, energy_level, workload_satisfaction, work_life_balance, job_satisfaction')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return 0;
    
    const scores = [
      data.stress_level,
      data.energy_level,
      data.workload_satisfaction,
      data.work_life_balance,
      data.job_satisfaction
    ];
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  },

  async getBurnoutRisk(userId: string): Promise<number> {
    const { data, error } = await getSupabaseClient()
      .from('wellbeing_metrics')
      .select('burnout_risk')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return 0;
    return data.burnout_risk;
  }
};

// Productivity services
export const productivityService = {
  async getProductivityMetrics(userId: string, days: number = 30): Promise<ProductivityMetric[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await getSupabaseClient()
      .from('productivity_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createProductivityMetric(metric: Partial<ProductivityMetric>): Promise<ProductivityMetric> {
    const { data, error } = await getSupabaseClient()
      .from('productivity_metrics')
      .insert(metric)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAverageProductivity(userId: string, days: number = 7): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await getSupabaseClient()
      .from('productivity_metrics')
      .select('tasks_completed, focus_time, collaboration_score')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0]);
    
    if (error || !data || data.length === 0) return 0;
    
    const avgTasks = data.reduce((sum, d) => sum + d.tasks_completed, 0) / data.length;
    const avgFocus = data.reduce((sum, d) => sum + d.focus_time, 0) / data.length;
    const avgCollab = data.reduce((sum, d) => sum + d.collaboration_score, 0) / data.length;
    
    // Normalize and combine scores (simplified calculation)
    return (avgTasks / 10 + avgFocus / 8 + avgCollab) / 3;
  }
};

// Alert services
export const alertService = {
  async getActiveAlerts(userId: string): Promise<WellbeingAlert[]> {
    const { data, error } = await getSupabaseClient()
      .from('wellbeing_alerts')
      .select('*')
      .eq('user_id', userId)
      .is('resolved_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createAlert(alert: Partial<WellbeingAlert>): Promise<WellbeingAlert> {
    const { data, error } = await getSupabaseClient()
      .from('wellbeing_alerts')
      .insert(alert)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async resolveAlert(alertId: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('wellbeing_alerts')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', alertId);
    
    if (error) throw error;
  }
};

// Recommendation services
export const recommendationService = {
  async getRecommendations(userId: string): Promise<Recommendation[]> {
    const { data, error } = await getSupabaseClient()
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .is('completed_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createRecommendation(recommendation: Partial<Recommendation>): Promise<Recommendation> {
    const { data, error } = await getSupabaseClient()
      .from('recommendations')
      .insert(recommendation)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async completeRecommendation(recommendationId: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('recommendations')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', recommendationId);
    
    if (error) throw error;
  }
};

// Team services
export const teamService = {
  async getTeam(teamId: string): Promise<Team | null> {
    const { data, error } = await getSupabaseClient()
      .from('teams')
      .select(`
        *,
        team_members (
          user_id,
          users (*)
        )
      `)
      .eq('id', teamId)
      .single();
    
    if (error) return null;
    return data;
  },

  async getTeamsByManager(managerId: string): Promise<Team[]> {
    const { data, error } = await getSupabaseClient()
      .from('teams')
      .select('*')
      .eq('manager_id', managerId);
    
    if (error) throw error;
    return data || [];
  },

  async updateTeamHealth(teamId: string, healthScore: number): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('teams')
      .update({ health_score: healthScore })
      .eq('id', teamId);
    
    if (error) throw error;
  }
};
