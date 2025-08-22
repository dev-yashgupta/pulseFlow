import { WebClient } from '@slack/web-api';
import { sentimentAnalyzer } from '@/lib/ml/sentimentAnalysis';
import type { SlackData } from '@/types';

export interface SlackMessage {
  text: string;
  user: string;
  ts: string;
  channel: string;
  thread_ts?: string;
}

export interface SlackUserInfo {
  id: string;
  name: string;
  real_name: string;
  email: string;
  is_bot: boolean;
  deleted: boolean;
}

export class SlackIntegration {
  private client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  async getUserInfo(userId: string): Promise<SlackUserInfo | null> {
    try {
      const result = await this.client.users.info({ user: userId });
      if (result.ok && result.user) {
        return {
          id: result.user.id!,
          name: result.user.name!,
          real_name: result.user.real_name || result.user.name!,
          email: result.user.profile?.email || '',
          is_bot: result.user.is_bot || false,
          deleted: result.user.deleted || false
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching Slack user info:', error);
      return null;
    }
  }

  async getUserMessages(userId: string, days: number = 7): Promise<SlackMessage[]> {
    try {
      const oldest = Math.floor((Date.now() - (days * 24 * 60 * 60 * 1000)) / 1000);
      const messages: SlackMessage[] = [];

      // Get user's conversations
      const conversations = await this.client.conversations.list({
        types: 'public_channel,private_channel,mpim,im',
        limit: 100
      });

      if (conversations.ok && conversations.channels) {
        for (const channel of conversations.channels) {
          try {
            const history = await this.client.conversations.history({
              channel: channel.id!,
              oldest: oldest.toString(),
              limit: 100
            });

            if (history.ok && history.messages) {
              const userMessages = history.messages.filter(
                msg => msg.user === userId && msg.text && !msg.bot_id
              );

              messages.push(...userMessages.map(msg => ({
                text: msg.text!,
                user: msg.user!,
                ts: msg.ts!,
                channel: channel.id!,
                thread_ts: msg.thread_ts
              })));
            }
          } catch (error) {
            // Skip channels we can't access
            continue;
          }
        }
      }

      return messages;
    } catch (error) {
      console.error('Error fetching Slack messages:', error);
      return [];
    }
  }

  async analyzeUserActivity(userId: string, days: number = 7): Promise<SlackData> {
    const messages = await this.getUserMessages(userId, days);
    const messageTexts = messages.map(m => m.text);
    
    // Analyze sentiment
    const sentiment = sentimentAnalyzer.analyzeBatch(messageTexts);
    
    // Calculate response time (simplified - would need more sophisticated analysis)
    const avgResponseTime = this.calculateAverageResponseTime(messages);
    
    // Calculate active hours
    const activeHours = this.calculateActiveHours(messages);
    
    return {
      userId,
      date: new Date(),
      messageCount: messages.length,
      sentimentScore: sentiment.score,
      responseTime: avgResponseTime,
      activeHours
    };
  }

  private calculateAverageResponseTime(messages: SlackMessage[]): number {
    // Simplified calculation - in production would analyze conversation threads
    // For now, return a mock value based on message frequency
    if (messages.length === 0) return 0;
    
    const timestamps = messages.map(m => parseFloat(m.ts) * 1000);
    timestamps.sort((a, b) => a - b);
    
    let totalGaps = 0;
    let gapCount = 0;
    
    for (let i = 1; i < timestamps.length; i++) {
      const gap = timestamps[i] - timestamps[i - 1];
      if (gap < 4 * 60 * 60 * 1000) { // Less than 4 hours (likely same conversation)
        totalGaps += gap;
        gapCount++;
      }
    }
    
    return gapCount > 0 ? (totalGaps / gapCount) / (1000 * 60 * 60) : 0; // Convert to hours
  }

  private calculateActiveHours(messages: SlackMessage[]): number {
    if (messages.length === 0) return 0;
    
    const hours = new Set<number>();
    
    messages.forEach(msg => {
      const date = new Date(parseFloat(msg.ts) * 1000);
      hours.add(date.getHours());
    });
    
    return hours.size;
  }

  async sendMessage(channel: string, text: string): Promise<boolean> {
    try {
      const result = await this.client.chat.postMessage({
        channel,
        text
      });
      return result.ok || false;
    } catch (error) {
      console.error('Error sending Slack message:', error);
      return false;
    }
  }

  async sendDirectMessage(userId: string, text: string): Promise<boolean> {
    try {
      // Open DM channel
      const dm = await this.client.conversations.open({
        users: userId
      });
      
      if (dm.ok && dm.channel) {
        return await this.sendMessage(dm.channel.id!, text);
      }
      return false;
    } catch (error) {
      console.error('Error sending Slack DM:', error);
      return false;
    }
  }

  async createAlert(userId: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<boolean> {
    const emoji = {
      low: '💙',
      medium: '💛',
      high: '🧡',
      critical: '🚨'
    };

    const alertMessage = `${emoji[severity]} *Wellbeing Alert*\n\n${message}\n\n_This is an automated message from PulseFlow._`;
    
    return await this.sendDirectMessage(userId, alertMessage);
  }
}

// Factory function to create Slack integration
export function createSlackIntegration(): SlackIntegration | null {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.warn('SLACK_BOT_TOKEN not configured');
    return null;
  }
  return new SlackIntegration(token);
}

// Mock data generator for development
export function generateMockSlackData(userId: string, days: number = 7): SlackData[] {
  const data: SlackData[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      userId,
      date,
      messageCount: Math.floor(Math.random() * 50) + 10,
      sentimentScore: (Math.random() - 0.5) * 1.5, // -0.75 to 0.75
      responseTime: Math.random() * 4 + 0.5, // 0.5 to 4.5 hours
      activeHours: Math.floor(Math.random() * 8) + 4 // 4 to 12 hours
    });
  }
  
  return data.reverse(); // Oldest first
}
