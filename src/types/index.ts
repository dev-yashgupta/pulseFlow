// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  managerId?: string;
  slackUserId?: string;
  salesforceUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'employee' | 'manager' | 'executive' | 'admin';

// Wellbeing Types
export interface WellbeingMetric {
  id: string;
  userId: string;
  date: Date;
  stressLevel: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  workloadSatisfaction: number; // 1-10 scale
  workLifeBalance: number; // 1-10 scale
  jobSatisfaction: number; // 1-10 scale
  burnoutRisk: number; // 0-1 probability
  sentimentScore: number; // -1 to 1
  source: 'survey' | 'slack_analysis' | 'calendar_analysis' | 'ml_prediction';
}

export interface WellbeingAlert {
  id: string;
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  actionRequired: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export type AlertType = 'burnout_risk' | 'stress_spike' | 'productivity_drop' | 'engagement_low';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// Productivity Types
export interface ProductivityMetric {
  id: string;
  userId: string;
  date: Date;
  tasksCompleted: number;
  meetingHours: number;
  focusTime: number; // hours of uninterrupted work
  salesActivities?: number;
  crmUpdates?: number;
  responseTime: number; // average response time in hours
  collaborationScore: number; // 0-1 based on team interactions
}

// Team and Organization Types
export interface Team {
  id: string;
  name: string;
  managerId: string;
  department: string;
  members: string[]; // user IDs
  healthScore: number; // 0-1 aggregate team health
}

export interface OrganizationMetrics {
  date: Date;
  totalEmployees: number;
  averageWellbeing: number;
  averageProductivity: number;
  turnoverRate: number;
  engagementScore: number;
  burnoutRisk: number;
}

// Integration Types
export interface SlackData {
  userId: string;
  messageCount: number;
  sentimentScore: number;
  responseTime: number;
  activeHours: number;
  date: Date;
}

export interface SalesforceData {
  userId: string;
  activitiesLogged: number;
  dealsProgressed: number;
  clientInteractions: number;
  pipelineValue: number;
  date: Date;
}

// Dashboard Types
export interface DashboardData {
  user: User;
  wellbeingTrend: WellbeingMetric[];
  productivityTrend: ProductivityMetric[];
  alerts: WellbeingAlert[];
  teamHealth?: Team;
  recommendations: Recommendation[];
}

export interface Recommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  createdAt: Date;
}

export type RecommendationType = 
  | 'break_reminder' 
  | 'workload_adjustment' 
  | 'team_check_in' 
  | 'wellness_resource' 
  | 'productivity_tip';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CorrelationData {
  wellbeing: number;
  productivity: number;
  date: string;
}
