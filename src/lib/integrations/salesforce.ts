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
    // Mock implementation for demo
    return {
      userId,
      date: new Date(),
      activitiesLogged: Math.floor(Math.random() * 15) + 5,
      dealsProgressed: Math.floor(Math.random() * 3),
      clientInteractions: Math.floor(Math.random() * 10) + 2,
      pipelineValue: Math.floor(Math.random() * 100000) + 10000
    };
  }

  async createTask(task: {
    subject: string;
    description: string;
    ownerId: string;
    dueDate?: Date;
    priority?: 'High' | 'Normal' | 'Low';
  }): Promise<string | null> {
    // Mock implementation
    console.log(`Creating Salesforce task: ${task.subject}`);
    return 'mock-task-id';
  }

  async logWellbeingIntervention(userId: string, intervention: string, outcome: string): Promise<boolean> {
    // Mock implementation
    console.log(`Logging intervention for ${userId}: ${intervention} - ${outcome}`);
    return true;
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

  if (!credentials.clientId) {
    console.warn('Salesforce credentials not configured');
    return null;
  }

  return new SalesforceIntegration(credentials);
}

// Mock data generator for development
export function generateMockSalesforceData(userId: string, days: number = 7): SalesforceData[] {
  const data: SalesforceData[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    data.push({
      userId,
      date,
      activitiesLogged: Math.floor(Math.random() * 15) + 5,
      dealsProgressed: Math.floor(Math.random() * 3),
      clientInteractions: Math.floor(Math.random() * 10) + 2,
      pipelineValue: Math.floor(Math.random() * 100000) + 10000
    });
  }

  return data.reverse();
}


