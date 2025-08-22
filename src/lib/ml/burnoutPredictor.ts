import type { WellbeingMetric, ProductivityMetric, SlackData, SalesforceData } from '@/types';

export interface BurnoutPredictionInput {
  wellbeingMetrics: WellbeingMetric[];
  productivityMetrics: ProductivityMetric[];
  slackData?: SlackData[];
  salesforceData?: SalesforceData[];
  userProfile: {
    role: string;
    department: string;
    tenure: number; // months
  };
}

export interface BurnoutPrediction {
  riskScore: number; // 0-1 probability
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  factors: BurnoutFactor[];
  recommendations: string[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface BurnoutFactor {
  factor: string;
  impact: number; // -1 to 1 (negative = protective, positive = risk)
  weight: number; // 0-1 importance
  description: string;
}

export class BurnoutPredictor {
  private weights = {
    stress: 0.25,
    energy: 0.20,
    workload: 0.15,
    workLifeBalance: 0.15,
    jobSatisfaction: 0.10,
    productivity: 0.10,
    social: 0.05
  };

  predict(input: BurnoutPredictionInput): BurnoutPrediction {
    const factors = this.calculateFactors(input);
    const riskScore = this.calculateRiskScore(factors);
    const riskLevel = this.getRiskLevel(riskScore);
    const confidence = this.calculateConfidence(input);
    const trend = this.calculateTrend(input);
    const recommendations = this.generateRecommendations(factors, riskLevel);

    return {
      riskScore,
      riskLevel,
      confidence,
      factors,
      recommendations,
      trend
    };
  }

  private calculateFactors(input: BurnoutPredictionInput): BurnoutFactor[] {
    const factors: BurnoutFactor[] = [];
    const recent = input.wellbeingMetrics.slice(-7); // Last 7 days
    const productivity = input.productivityMetrics.slice(-7);

    if (recent.length === 0) {
      return factors;
    }

    // Stress factor
    const avgStress = recent.reduce((sum, m) => sum + m.stressLevel, 0) / recent.length;
    factors.push({
      factor: 'stress',
      impact: this.normalizeScore(avgStress, 1, 10) - 0.5, // Convert to -0.5 to 0.5 range
      weight: this.weights.stress,
      description: `Average stress level: ${avgStress.toFixed(1)}/10`
    });

    // Energy factor
    const avgEnergy = recent.reduce((sum, m) => sum + m.energyLevel, 0) / recent.length;
    factors.push({
      factor: 'energy',
      impact: 0.5 - this.normalizeScore(avgEnergy, 1, 10), // Inverted - low energy = high risk
      weight: this.weights.energy,
      description: `Average energy level: ${avgEnergy.toFixed(1)}/10`
    });

    // Workload satisfaction
    const avgWorkload = recent.reduce((sum, m) => sum + m.workloadSatisfaction, 0) / recent.length;
    factors.push({
      factor: 'workload',
      impact: 0.5 - this.normalizeScore(avgWorkload, 1, 10),
      weight: this.weights.workload,
      description: `Workload satisfaction: ${avgWorkload.toFixed(1)}/10`
    });

    // Work-life balance
    const avgBalance = recent.reduce((sum, m) => sum + m.workLifeBalance, 0) / recent.length;
    factors.push({
      factor: 'workLifeBalance',
      impact: 0.5 - this.normalizeScore(avgBalance, 1, 10),
      weight: this.weights.workLifeBalance,
      description: `Work-life balance: ${avgBalance.toFixed(1)}/10`
    });

    // Job satisfaction
    const avgSatisfaction = recent.reduce((sum, m) => sum + m.jobSatisfaction, 0) / recent.length;
    factors.push({
      factor: 'jobSatisfaction',
      impact: 0.5 - this.normalizeScore(avgSatisfaction, 1, 10),
      weight: this.weights.jobSatisfaction,
      description: `Job satisfaction: ${avgSatisfaction.toFixed(1)}/10`
    });

    // Productivity factor
    if (productivity.length > 0) {
      const avgProductivity = productivity.reduce((sum, p) => sum + p.collaborationScore, 0) / productivity.length;
      const avgFocus = productivity.reduce((sum, p) => sum + p.focusTime, 0) / productivity.length;
      
      factors.push({
        factor: 'productivity',
        impact: avgProductivity < 0.3 || avgFocus < 2 ? 0.3 : -0.1, // Low productivity = risk
        weight: this.weights.productivity,
        description: `Productivity indicators: ${(avgProductivity * 100).toFixed(0)}% collaboration, ${avgFocus.toFixed(1)}h focus time`
      });
    }

    // Social/communication factor (from Slack data)
    if (input.slackData && input.slackData.length > 0) {
      const recentSlack = input.slackData.slice(-7);
      const avgSentiment = recentSlack.reduce((sum, s) => sum + s.sentimentScore, 0) / recentSlack.length;
      const avgMessages = recentSlack.reduce((sum, s) => sum + s.messageCount, 0) / recentSlack.length;
      
      factors.push({
        factor: 'social',
        impact: avgSentiment < -0.2 || avgMessages < 5 ? 0.2 : -0.1,
        weight: this.weights.social,
        description: `Communication: ${avgMessages.toFixed(0)} messages/day, ${(avgSentiment * 100).toFixed(0)}% sentiment`
      });
    }

    return factors;
  }

  private calculateRiskScore(factors: BurnoutFactor[]): number {
    let weightedSum = 0;
    let totalWeight = 0;

    factors.forEach(factor => {
      weightedSum += factor.impact * factor.weight;
      totalWeight += factor.weight;
    });

    // Normalize to 0-1 range and apply sigmoid for smooth transitions
    const rawScore = weightedSum / totalWeight;
    return this.sigmoid(rawScore * 4); // Scale and apply sigmoid
  }

  private getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.6) return 'medium';
    if (riskScore < 0.8) return 'high';
    return 'critical';
  }

  private calculateConfidence(input: BurnoutPredictionInput): number {
    let confidence = 0.5; // Base confidence
    
    // More data = higher confidence
    if (input.wellbeingMetrics.length >= 7) confidence += 0.2;
    if (input.productivityMetrics.length >= 7) confidence += 0.1;
    if (input.slackData && input.slackData.length >= 7) confidence += 0.1;
    if (input.salesforceData && input.salesforceData.length >= 7) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private calculateTrend(input: BurnoutPredictionInput): 'improving' | 'stable' | 'declining' {
    if (input.wellbeingMetrics.length < 14) return 'stable';
    
    const recent = input.wellbeingMetrics.slice(-7);
    const previous = input.wellbeingMetrics.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, m) => 
      sum + (m.stressLevel + (10 - m.energyLevel) + (10 - m.workLifeBalance)), 0) / (recent.length * 3);
    
    const previousAvg = previous.reduce((sum, m) => 
      sum + (m.stressLevel + (10 - m.energyLevel) + (10 - m.workLifeBalance)), 0) / (previous.length * 3);
    
    const change = recentAvg - previousAvg;
    
    if (change > 0.5) return 'declining';
    if (change < -0.5) return 'improving';
    return 'stable';
  }

  private generateRecommendations(factors: BurnoutFactor[], riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    // High-impact factors get priority recommendations
    const highImpactFactors = factors
      .filter(f => f.impact > 0.2 && f.weight > 0.1)
      .sort((a, b) => (b.impact * b.weight) - (a.impact * a.weight));
    
    highImpactFactors.forEach(factor => {
      switch (factor.factor) {
        case 'stress':
          recommendations.push('Consider stress management techniques or workload redistribution');
          break;
        case 'energy':
          recommendations.push('Focus on sleep hygiene and energy management strategies');
          break;
        case 'workload':
          recommendations.push('Review current workload and consider task prioritization');
          break;
        case 'workLifeBalance':
          recommendations.push('Establish better boundaries between work and personal time');
          break;
        case 'jobSatisfaction':
          recommendations.push('Schedule a career development conversation with manager');
          break;
        case 'productivity':
          recommendations.push('Optimize work environment and eliminate distractions');
          break;
        case 'social':
          recommendations.push('Increase team collaboration and social connections');
          break;
      }
    });
    
    // Risk-level specific recommendations
    if (riskLevel === 'critical') {
      recommendations.unshift('Immediate intervention recommended - consider time off or workload reduction');
    } else if (riskLevel === 'high') {
      recommendations.unshift('Schedule check-in with manager within 48 hours');
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private normalizeScore(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }
}

// Singleton instance
export const burnoutPredictor = new BurnoutPredictor();
