-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('employee', 'manager', 'executive', 'admin');
CREATE TYPE metric_source AS ENUM ('survey', 'slack_analysis', 'calendar_analysis', 'ml_prediction');
CREATE TYPE alert_type AS ENUM ('burnout_risk', 'stress_spike', 'productivity_drop', 'engagement_low');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE recommendation_type AS ENUM ('break_reminder', 'workload_adjustment', 'team_check_in', 'wellness_resource', 'productivity_tip');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'employee',
    department VARCHAR(255) NOT NULL,
    manager_id UUID REFERENCES users(id),
    slack_user_id VARCHAR(255),
    salesforce_user_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellbeing metrics table
CREATE TABLE wellbeing_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    workload_satisfaction INTEGER CHECK (workload_satisfaction >= 1 AND workload_satisfaction <= 10),
    work_life_balance INTEGER CHECK (work_life_balance >= 1 AND work_life_balance <= 10),
    job_satisfaction INTEGER CHECK (job_satisfaction >= 1 AND job_satisfaction <= 10),
    burnout_risk DECIMAL(3,2) CHECK (burnout_risk >= 0 AND burnout_risk <= 1),
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    source metric_source NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, source)
);

-- Productivity metrics table
CREATE TABLE productivity_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    meeting_hours DECIMAL(4,2) DEFAULT 0,
    focus_time DECIMAL(4,2) DEFAULT 0,
    sales_activities INTEGER,
    crm_updates INTEGER,
    response_time DECIMAL(6,2) DEFAULT 0,
    collaboration_score DECIMAL(3,2) CHECK (collaboration_score >= 0 AND collaboration_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    manager_id UUID NOT NULL REFERENCES users(id),
    department VARCHAR(255) NOT NULL,
    health_score DECIMAL(3,2) CHECK (health_score >= 0 AND health_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members junction table
CREATE TABLE team_members (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- Wellbeing alerts table
CREATE TABLE wellbeing_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type alert_type NOT NULL,
    severity alert_severity NOT NULL,
    message TEXT NOT NULL,
    action_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Recommendations table
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type recommendation_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    action_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Slack data table
CREATE TABLE slack_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    message_count INTEGER DEFAULT 0,
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    response_time DECIMAL(6,2) DEFAULT 0,
    active_hours DECIMAL(4,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Salesforce data table
CREATE TABLE salesforce_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    activities_logged INTEGER DEFAULT 0,
    deals_progressed INTEGER DEFAULT 0,
    client_interactions INTEGER DEFAULT 0,
    pipeline_value DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Organization metrics table
CREATE TABLE organization_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_employees INTEGER NOT NULL,
    average_wellbeing DECIMAL(3,2),
    average_productivity DECIMAL(3,2),
    turnover_rate DECIMAL(5,4),
    engagement_score DECIMAL(3,2),
    burnout_risk DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intervention history table
CREATE TABLE intervention_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_wellbeing_metrics_user_date ON wellbeing_metrics(user_id, date);
CREATE INDEX idx_productivity_metrics_user_date ON productivity_metrics(user_id, date);
CREATE INDEX idx_wellbeing_alerts_user_created ON wellbeing_alerts(user_id, created_at);
CREATE INDEX idx_recommendations_user_created ON recommendations(user_id, created_at);
CREATE INDEX idx_slack_data_user_date ON slack_data(user_id, date);
CREATE INDEX idx_salesforce_data_user_date ON salesforce_data(user_id, date);
CREATE INDEX idx_intervention_history_user_created ON intervention_history(user_id, created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
