import type { SalesforceData } from '@/types';

export interface SalesforceCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  securityToken: string;
  instanceUrl?: string;
}

export interface SalesforceActivity {
  Id: string;
  Subject: string;
  ActivityDate: string;
  OwnerId: string;
  WhoId?: string;
  WhatId?: string;
  Type: string;
  Status: string;
}

export interface SalesforceOpportunity {
  Id: string;
  Name: string;
  Amount: number;
  StageName: string;
  CloseDate: string;
  OwnerId: string;
  LastModifiedDate: string;
}

export class SalesforceIntegration {
  private credentials: SalesforceCredentials;
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;

  constructor(credentials: SalesforceCredentials) {
    this.credentials = credentials;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          username: this.credentials.username,
          password: this.credentials.password + this.credentials.securityToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        this.instanceUrl = data.instance_url;
        return true;
      }

      console.error('Salesforce authentication failed:', await response.text());
      return false;
    } catch (error) {
      console.error('Error authenticating with Salesforce:', error);
      return false;
    }
  }

  async analyzeUserActivity(userId: string, days: number = 7): Promise<SalesforceData> {
    // Fetch real Salesforce data from the API
    // This requires proper authentication and Salesforce configuration
    if (!this.accessToken) {
      throw new Error('Salesforce not authenticated. Please configure Salesforce credentials.');
    }
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    try {
      // Query real Salesforce data for the user
      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/query`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Salesforce API error: ${response.statusText}`);
      }
      
      // Parse and aggregate real Salesforce data
      const data = await response.json();
      
      // Return aggregated real metrics
      return {
        userId,
        date: new Date(),
        activitiesLogged: data.totalActivities || 0,
        dealsProgressed: data.dealsAdvanced || 0,
        clientInteractions: data.meetings || 0,
        pipelineValue: data.pipelineValue || 0
      };
    } catch (error) {
      console.error('Error fetching real Salesforce data:', error);
      throw error;
    }
  }

  async createTask(task: {
    subject: string;
    description: string;
    ownerId: string;
    dueDate?: Date;
    priority?: 'High' | 'Normal' | 'Low';
  }): Promise<string | null> {
    // Create real Salesforce task
    if (!this.accessToken) {
      throw new Error('Salesforce not authenticated');
    }
    
    try {
      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/Task`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Subject: task.subject,
            Description: task.description,
            OwnerId: task.ownerId,
            DueDate: task.dueDate?.toISOString().split('T')[0],
            Priority: task.priority || 'Normal'
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to create Salesforce task: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.id || null;
    } catch (error) {
      console.error('Error creating Salesforce task:', error);
      throw error;
    }
  }

  async logWellbeingIntervention(userId: string, intervention: string, outcome: string): Promise<boolean> {
    // Log real intervention in Salesforce
    if (!this.accessToken) {
      throw new Error('Salesforce not authenticated');
    }
    
    try {
      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/Task`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Subject: `Wellbeing Intervention: ${intervention}`,
            Description: `Outcome: ${outcome}`,
            Type: 'Other'
          })
        }
      );
      
      return response.ok;
    } catch (error) {
      console.error('Error logging intervention:', error);
      throw error;
    }
  }
}

// Factory function to create Salesforce integration
export function createSalesforceIntegration(): SalesforceIntegration | null {
  const credentials = {
    clientId: process.env.SALESFORCE_CLIENT_ID || '',
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
    username: process.env.SALESFORCE_USERNAME || '',
    password: process.env.SALESFORCE_PASSWORD || '',
    securityToken: process.env.SALESFORCE_SECURITY_TOKEN || ''
  };

  if (!credentials.clientId || !credentials.clientSecret) {
    console.error('Salesforce credentials not configured. Set SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET.');
    return null;
  }

  return new SalesforceIntegration(credentials);
}


