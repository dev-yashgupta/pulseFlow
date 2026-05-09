import { createSalesforceIntegration, type SalesforceIntegration } from './salesforce';
import { wellbeingService, productivityService } from '@/lib/database/services';
import type { User, WellbeingMetric, ProductivityMetric } from '@/types';

export interface SalesforceWellbeingReport {
  userId: string;
  reportDate: Date;
  wellbeingScore: number;
  productivityScore: number;
  burnoutRisk: number;
  interventionsCount: number;
  salesPerformance: {
    activitiesLogged: number;
    dealsProgressed: number;
    pipelineValue: number;
    performanceRating: 'excellent' | 'good' | 'average' | 'needs_improvement';
  };
  recommendations: string[];
}

export interface TeamWellbeingDashboard {
  teamId: string;
  teamName: string;
  managerId: string;
  reportPeriod: {
    start: Date;
    end: Date;
  };
  metrics: {
    averageWellbeing: number;
    averageProductivity: number;
    totalInterventions: number;
    atRiskEmployees: number;
    turnoverRisk: number;
  };
  memberReports: SalesforceWellbeingReport[];
}

export class SalesforceWellbeingReporter {
  private salesforce: SalesforceIntegration | null;

  constructor() {
    this.salesforce = createSalesforceIntegration();
  }

  async generateUserReport(
    user: User,
    wellbeingData: WellbeingMetric[],
    productivityData: ProductivityMetric[]
  ): Promise<SalesforceWellbeingReport> {
    
    // Calculate wellbeing score
    const latestWellbeing = wellbeingData[wellbeingData.length - 1];
    const wellbeingScore = latestWellbeing 
      ? (latestWellbeing.stressLevel + latestWellbeing.energyLevel + 
         latestWellbeing.workLifeBalance + latestWellbeing.jobSatisfaction) / 4
      : 0;

    // Calculate productivity score
    const latestProductivity = productivityData[productivityData.length - 1];
    const productivityScore = latestProductivity
      ? (latestProductivity.tasksCompleted / 10 + 
         latestProductivity.focusTime / 8 + 
         latestProductivity.collaborationScore) / 3 * 10
      : 0;

    // Get Salesforce performance data
    const salesPerformance = await this.getSalesPerformance(user.salesforceUserId || '');

    // Generate recommendations
    const recommendations = this.generateRecommendations(wellbeingScore, productivityScore, salesPerformance);

    const report: SalesforceWellbeingReport = {
      userId: user.id,
      reportDate: new Date(),
      wellbeingScore,
      productivityScore,
      burnoutRisk: latestWellbeing?.burnoutRisk || 0,
      interventionsCount: 0, // Would be fetched from intervention history
      salesPerformance,
      recommendations
    };

    // Log report to Salesforce
    await this.logReportToSalesforce(report, user);

    return report;
  }

  async generateTeamDashboard(
    teamId: string,
    teamName: string,
    managerId: string,
    members: User[],
    startDate: Date,
    endDate: Date
  ): Promise<TeamWellbeingDashboard> {
    
    const memberReports: SalesforceWellbeingReport[] = [];
    let totalWellbeing = 0;
    let totalProductivity = 0;
    let totalInterventions = 0;
    let atRiskCount = 0;

    // Generate reports for each team member
    for (const member of members) {
      // Fetch real wellbeing and productivity data from database
      const wellbeingData = await wellbeingService.getWellbeingMetrics(member.id, 30);
      const productivityData = await productivityService.getProductivityMetrics(member.id, 30);
      
      const report = await this.generateUserReport(member, wellbeingData, productivityData);
      memberReports.push(report);

      totalWellbeing += report.wellbeingScore;
      totalProductivity += report.productivityScore;
      totalInterventions += report.interventionsCount;
      
      if (report.burnoutRisk > 0.6) {
        atRiskCount++;
      }
    }

    const dashboard: TeamWellbeingDashboard = {
      teamId,
      teamName,
      managerId,
      reportPeriod: { start: startDate, end: endDate },
      metrics: {
        averageWellbeing: members.length > 0 ? totalWellbeing / members.length : 0,
        averageProductivity: members.length > 0 ? totalProductivity / members.length : 0,
        totalInterventions,
        atRiskEmployees: atRiskCount,
        turnoverRisk: atRiskCount / members.length
      },
      memberReports
    };

    // Create Salesforce dashboard record
    await this.createSalesforceDashboard(dashboard);

    return dashboard;
  }

  private async getSalesPerformance(salesforceUserId: string) {
    if (!this.salesforce || !salesforceUserId) {
      throw new Error('Salesforce integration not configured. Please set up Salesforce credentials.');
    }

    try {
      const data = await this.salesforce.analyzeUserActivity(salesforceUserId, 30);
      
      // Calculate performance rating based on metrics
      let rating: 'excellent' | 'good' | 'average' | 'needs_improvement' = 'average';
      
      if (data.activitiesLogged > 15 && data.dealsProgressed > 3 && data.pipelineValue > 75000) {
        rating = 'excellent';
      } else if (data.activitiesLogged > 10 && data.dealsProgressed > 1 && data.pipelineValue > 50000) {
        rating = 'good';
      } else if (data.activitiesLogged < 5 || data.pipelineValue < 25000) {
        rating = 'needs_improvement';
      }

      return {
        activitiesLogged: data.activitiesLogged,
        dealsProgressed: data.dealsProgressed,
        pipelineValue: data.pipelineValue,
        performanceRating: rating
      };
    } catch (error) {
      console.error('Error fetching Salesforce performance data:', error);
      return {
        activitiesLogged: 0,
        dealsProgressed: 0,
        pipelineValue: 0,
        performanceRating: 'needs_improvement' as const
      };
    }
  }

  private generateRecommendations(
    wellbeingScore: number,
    productivityScore: number,
    salesPerformance: any
  ): string[] {
    const recommendations: string[] = [];

    // Wellbeing-based recommendations
    if (wellbeingScore < 5) {
      recommendations.push('Schedule immediate wellbeing check-in with manager');
      recommendations.push('Consider workload adjustment or temporary support');
    } else if (wellbeingScore < 7) {
      recommendations.push('Monitor stress levels and encourage work-life balance');
      recommendations.push('Provide access to wellness resources');
    }

    // Productivity-based recommendations
    if (productivityScore < 5) {
      recommendations.push('Review current processes and identify bottlenecks');
      recommendations.push('Provide additional training or tools');
    }

    // Sales performance recommendations
    if (salesPerformance.performanceRating === 'needs_improvement') {
      recommendations.push('Provide sales coaching and mentorship');
      recommendations.push('Review territory assignment and lead quality');
    } else if (salesPerformance.performanceRating === 'excellent') {
      recommendations.push('Consider for leadership development opportunities');
      recommendations.push('Share best practices with team');
    }

    // Correlation-based recommendations
    if (wellbeingScore < 6 && salesPerformance.performanceRating === 'needs_improvement') {
      recommendations.push('Address wellbeing concerns as they may be impacting sales performance');
    }

    return recommendations;
  }

  private async logReportToSalesforce(report: SalesforceWellbeingReport, user: User): Promise<void> {
    if (!this.salesforce || !user.salesforceUserId) return;

    try {
      // Create a custom task in Salesforce to track the wellbeing report
      const taskData = {
        subject: `Wellbeing Report - ${user.name}`,
        description: `
Wellbeing Report Generated: ${report.reportDate.toISOString()}

Wellbeing Score: ${report.wellbeingScore.toFixed(1)}/10
Productivity Score: ${report.productivityScore.toFixed(1)}/10
Burnout Risk: ${(report.burnoutRisk * 100).toFixed(1)}%

Sales Performance:
- Activities Logged: ${report.salesPerformance.activitiesLogged}
- Deals Progressed: ${report.salesPerformance.dealsProgressed}
- Pipeline Value: $${report.salesPerformance.pipelineValue.toLocaleString()}
- Performance Rating: ${report.salesPerformance.performanceRating}

Recommendations:
${report.recommendations.map(r => `- ${r}`).join('\n')}

Generated by PulseFlow Wellbeing Analytics
        `,
        ownerId: user.salesforceUserId || '',
        priority: (report.burnoutRisk > 0.6 ? 'High' : 'Normal') as 'High' | 'Normal' | 'Low'
      };

      await this.salesforce.createTask(taskData);
    } catch (error) {
      console.error('Error logging report to Salesforce:', error);
    }
  }

  private async createSalesforceDashboard(dashboard: TeamWellbeingDashboard): Promise<void> {
    if (!this.salesforce) return;

    try {
      // Create a summary task for the team manager
      const taskData = {
        subject: `Team Wellbeing Dashboard - ${dashboard.teamName}`,
        description: `
Team Wellbeing Dashboard
Period: ${dashboard.reportPeriod.start.toDateString()} - ${dashboard.reportPeriod.end.toDateString()}

Team Metrics:
- Average Wellbeing: ${dashboard.metrics.averageWellbeing.toFixed(1)}/10
- Average Productivity: ${dashboard.metrics.averageProductivity.toFixed(1)}/10
- Total Interventions: ${dashboard.metrics.totalInterventions}
- At-Risk Employees: ${dashboard.metrics.atRiskEmployees}
- Turnover Risk: ${(dashboard.metrics.turnoverRisk * 100).toFixed(1)}%

Team Size: ${dashboard.memberReports.length} members

${dashboard.metrics.atRiskEmployees > 0 ?
  `⚠️ ATTENTION REQUIRED: ${dashboard.metrics.atRiskEmployees} team member(s) showing high burnout risk` :
  '✅ Team wellbeing metrics are within healthy ranges'
}

Generated by PulseFlow Team Analytics
        `,
        ownerId: dashboard.managerId,
        priority: (dashboard.metrics.atRiskEmployees > 0 ? 'High' : 'Normal') as 'High' | 'Normal' | 'Low'
      };

      await this.salesforce.createTask(taskData);
    } catch (error) {
      console.error('Error creating Salesforce dashboard:', error);
    }
  }

  async trackInterventionOutcome(
    userId: string,
    interventionType: string,
    outcome: 'successful' | 'partially_successful' | 'unsuccessful',
    notes: string
  ): Promise<void> {
    if (!this.salesforce) return;

    try {
      await this.salesforce.logWellbeingIntervention(
        userId,
        interventionType,
        `Outcome: ${outcome}\nNotes: ${notes}`
      );
    } catch (error) {
      console.error('Error tracking intervention outcome:', error);
    }
  }
}

// Singleton instance
export const salesforceReporter = new SalesforceWellbeingReporter();
