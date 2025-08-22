import { burnoutPredictor, type BurnoutPrediction } from '@/lib/ml/burnoutPredictor';
import { createSlackIntegration } from '@/lib/integrations/slack';
import { createSalesforceIntegration } from '@/lib/integrations/salesforce';
import { recommendationService, alertService } from '@/lib/database/services';
import type { User, WellbeingMetric, ProductivityMetric, Recommendation, WellbeingAlert } from '@/types';

export interface InterventionContext {
  user: User;
  wellbeingData: WellbeingMetric[];
  productivityData: ProductivityMetric[];
  burnoutPrediction: BurnoutPrediction;
  manager?: User | null;
}

export interface InterventionAction {
  type: 'slack_message' | 'manager_alert' | 'recommendation' | 'calendar_block' | 'workload_adjustment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionData?: any;
  scheduledFor?: Date;
}

export class InterventionEngine {
  private slackIntegration = createSlackIntegration();
  private salesforceIntegration = createSalesforceIntegration();

  async analyzeAndIntervene(context: InterventionContext): Promise<InterventionAction[]> {
    const actions: InterventionAction[] = [];
    const { user, burnoutPrediction } = context;

    // Determine intervention level based on risk
    if (burnoutPrediction.riskLevel === 'critical') {
      actions.push(...this.getCriticalInterventions(context));
    } else if (burnoutPrediction.riskLevel === 'high') {
      actions.push(...this.getHighRiskInterventions(context));
    } else if (burnoutPrediction.riskLevel === 'medium') {
      actions.push(...this.getMediumRiskInterventions(context));
    } else {
      actions.push(...this.getPreventiveInterventions(context));
    }

    // Execute actions
    await this.executeActions(actions, context);

    return actions;
  }

  private getCriticalInterventions(context: InterventionContext): InterventionAction[] {
    const { user, manager } = context;
    const actions: InterventionAction[] = [];

    // Immediate manager alert
    if (manager) {
      actions.push({
        type: 'manager_alert',
        priority: 'critical',
        message: `🚨 CRITICAL: ${user.name} is showing severe burnout risk. Immediate intervention required.`,
        actionData: {
          managerId: manager.id,
          userId: user.id,
          suggestedActions: [
            'Schedule immediate 1:1 meeting',
            'Consider temporary workload reduction',
            'Offer mental health resources',
            'Discuss time off options'
          ]
        }
      });
    }

    // Direct user support
    actions.push({
      type: 'slack_message',
      priority: 'critical',
      message: `Hi ${user.name}, I've noticed some concerning patterns in your wellbeing metrics. Your manager has been notified and will reach out soon. In the meantime, please consider taking a break and remember that support resources are available. 💙`,
      actionData: { userId: user.id }
    });

    // Create formal recommendation
    actions.push({
      type: 'recommendation',
      priority: 'critical',
      message: 'Immediate workload assessment and potential time off recommendation',
      actionData: {
        type: 'workload_adjustment',
        title: 'Critical Burnout Risk - Immediate Action Required',
        description: 'Employee showing critical burnout indicators. Recommend immediate workload review and potential time off.',
        userId: user.id
      }
    });

    return actions;
  }

  private getHighRiskInterventions(context: InterventionContext): InterventionAction[] {
    const { user, manager, burnoutPrediction } = context;
    const actions: InterventionAction[] = [];

    // Manager notification
    if (manager) {
      actions.push({
        type: 'manager_alert',
        priority: 'high',
        message: `⚠️ ${user.name} is showing high burnout risk (${Math.round(burnoutPrediction.riskScore * 100)}%). Please schedule a check-in within 48 hours.`,
        actionData: {
          managerId: manager.id,
          userId: user.id,
          suggestedActions: [
            'Schedule 1:1 meeting within 48 hours',
            'Review current workload and priorities',
            'Discuss work-life balance',
            'Offer flexible work arrangements'
          ]
        }
      });
    }

    // Personalized user message
    const topFactors = burnoutPrediction.factors
      .filter(f => f.impact > 0.2)
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 2);

    actions.push({
      type: 'slack_message',
      priority: 'high',
      message: `Hi ${user.name}, I've noticed some patterns that suggest you might be experiencing increased stress. ${topFactors.length > 0 ? `Particularly around ${topFactors.map(f => f.factor).join(' and ')}.` : ''} Your manager will be reaching out soon to check in. 🤗`,
      actionData: { userId: user.id }
    });

    // Create recommendations
    burnoutPrediction.recommendations.forEach(rec => {
      actions.push({
        type: 'recommendation',
        priority: 'high',
        message: rec,
        actionData: {
          type: 'wellness_resource',
          title: 'High Burnout Risk - Action Needed',
          description: rec,
          userId: user.id
        }
      });
    });

    return actions;
  }

  private getMediumRiskInterventions(context: InterventionContext): InterventionAction[] {
    const { user, burnoutPrediction } = context;
    const actions: InterventionAction[] = [];

    // Gentle check-in message
    actions.push({
      type: 'slack_message',
      priority: 'medium',
      message: `Hey ${user.name}! 👋 Just checking in - how are you feeling about your workload lately? Remember to take breaks and reach out if you need support. You're doing great! 💪`,
      actionData: { userId: user.id }
    });

    // Proactive recommendations
    actions.push({
      type: 'recommendation',
      priority: 'medium',
      message: 'Consider scheduling regular breaks and reviewing work priorities',
      actionData: {
        type: 'productivity_tip',
        title: 'Wellbeing Check-in',
        description: 'Your metrics suggest it might be a good time to review your work-life balance and consider some stress management techniques.',
        userId: user.id
      }
    });

    // Schedule follow-up
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 7);
    
    actions.push({
      type: 'recommendation',
      priority: 'low',
      message: 'Schedule follow-up wellbeing check',
      actionData: {
        type: 'team_check_in',
        title: 'Weekly Wellbeing Follow-up',
        description: 'Follow up on wellbeing status and any changes in stress levels.',
        userId: user.id
      },
      scheduledFor: followUpDate
    });

    return actions;
  }

  private getPreventiveInterventions(context: InterventionContext): InterventionAction[] {
    const { user, burnoutPrediction } = context;
    const actions: InterventionAction[] = [];

    // Positive reinforcement
    if (burnoutPrediction.trend === 'improving') {
      actions.push({
        type: 'slack_message',
        priority: 'low',
        message: `Great job, ${user.name}! 🎉 Your wellbeing metrics are looking positive. Keep up the excellent work-life balance! 🌟`,
        actionData: { userId: user.id }
      });
    }

    // Preventive tips
    actions.push({
      type: 'recommendation',
      priority: 'low',
      message: 'Continue current wellbeing practices and consider sharing tips with team',
      actionData: {
        type: 'wellness_resource',
        title: 'Maintain Your Wellbeing',
        description: 'Your wellbeing metrics look great! Consider sharing your successful strategies with teammates.',
        userId: user.id
      }
    });

    return actions;
  }

  private async executeActions(actions: InterventionAction[], context: InterventionContext): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'slack_message':
            await this.sendSlackMessage(action, context);
            break;
          case 'manager_alert':
            await this.sendManagerAlert(action, context);
            break;
          case 'recommendation':
            await this.createRecommendation(action, context);
            break;
          case 'calendar_block':
            await this.createCalendarBlock(action, context);
            break;
          case 'workload_adjustment':
            await this.logWorkloadAdjustment(action, context);
            break;
        }
      } catch (error) {
        console.error(`Failed to execute intervention action ${action.type}:`, error);
      }
    }
  }

  private async sendSlackMessage(action: InterventionAction, context: InterventionContext): Promise<void> {
    if (!this.slackIntegration || !context.user.slackUserId) return;

    await this.slackIntegration.sendDirectMessage(
      context.user.slackUserId,
      action.message
    );
  }

  private async sendManagerAlert(action: InterventionAction, context: InterventionContext): Promise<void> {
    const { manager } = context;
    if (!this.slackIntegration || !manager?.slackUserId) return;

    // Send Slack message to manager
    await this.slackIntegration.sendDirectMessage(
      manager.slackUserId,
      action.message
    );

    // Create alert in database
    await alertService.createAlert({
      userId: context.user.id,
      type: 'burnout_risk',
      severity: action.priority as any,
      message: action.message,
      actionRequired: true
    });
  }

  private async createRecommendation(action: InterventionAction, context: InterventionContext): Promise<void> {
    await recommendationService.createRecommendation({
      userId: context.user.id,
      type: action.actionData.type,
      title: action.actionData.title,
      description: action.actionData.description,
      priority: action.priority as 'low' | 'medium' | 'high'
    });
  }

  private async createCalendarBlock(action: InterventionAction, context: InterventionContext): Promise<void> {
    // This would integrate with calendar APIs (Google Calendar, Outlook, etc.)
    // For now, just log the action
    console.log(`Calendar block created for ${context.user.name}: ${action.message}`);
  }

  private async logWorkloadAdjustment(action: InterventionAction, context: InterventionContext): Promise<void> {
    // Log workload adjustment in Salesforce or other systems
    if (this.salesforceIntegration && context.user.salesforceUserId) {
      // Mock implementation - in production would call actual Salesforce API
      console.log(`Logging workload adjustment for user ${context.user.salesforceUserId}: ${action.message}`);
    }
  }

  // Batch processing for multiple users
  async processBatchInterventions(users: User[]): Promise<void> {
    for (const user of users) {
      try {
        // This would fetch real data for each user
        const mockContext: InterventionContext = {
          user,
          wellbeingData: [],
          productivityData: [],
          burnoutPrediction: burnoutPredictor.predict({
            wellbeingMetrics: [],
            productivityMetrics: [],
            userProfile: {
              role: user.role,
              department: user.department,
              tenure: 12 // Mock tenure
            }
          })
        };

        await this.analyzeAndIntervene(mockContext);
      } catch (error) {
        console.error(`Failed to process interventions for user ${user.id}:`, error);
      }
    }
  }
}

// Singleton instance
export const interventionEngine = new InterventionEngine();
