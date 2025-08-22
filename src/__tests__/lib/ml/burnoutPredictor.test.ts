import { BurnoutPredictor } from '@/lib/ml/burnoutPredictor';
import type { BurnoutPredictionInput } from '@/lib/ml/burnoutPredictor';

describe('BurnoutPredictor', () => {
  let predictor: BurnoutPredictor;

  beforeEach(() => {
    predictor = new BurnoutPredictor();
  });

  describe('predict', () => {
    it('should return low risk for healthy metrics', () => {
      const input: BurnoutPredictionInput = {
        wellbeingMetrics: [
          {
            id: '1',
            userId: 'user1',
            date: new Date(),
            stressLevel: 3,
            energyLevel: 8,
            workloadSatisfaction: 8,
            workLifeBalance: 8,
            jobSatisfaction: 8,
            burnoutRisk: 0.1,
            sentimentScore: 0.5,
            source: 'survey'
          }
        ],
        productivityMetrics: [
          {
            id: '1',
            userId: 'user1',
            date: new Date(),
            tasksCompleted: 8,
            meetingHours: 3,
            focusTime: 6,
            salesActivities: 5,
            crmUpdates: 3,
            responseTime: 1,
            collaborationScore: 0.8
          }
        ],
        userProfile: {
          role: 'employee',
          department: 'Engineering',
          tenure: 12
        }
      };

      const result = predictor.predict(input);

      expect(result.riskLevel).toBe('low');
      expect(result.riskScore).toBeLessThan(0.3);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.factors).toHaveLength(6); // stress, energy, workload, balance, satisfaction, productivity
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should return high risk for concerning metrics', () => {
      const input: BurnoutPredictionInput = {
        wellbeingMetrics: [
          {
            id: '1',
            userId: 'user1',
            date: new Date(),
            stressLevel: 9,
            energyLevel: 2,
            workloadSatisfaction: 3,
            workLifeBalance: 2,
            jobSatisfaction: 3,
            burnoutRisk: 0.8,
            sentimentScore: -0.5,
            source: 'survey'
          }
        ],
        productivityMetrics: [
          {
            id: '1',
            userId: 'user1',
            date: new Date(),
            tasksCompleted: 2,
            meetingHours: 8,
            focusTime: 1,
            salesActivities: 1,
            crmUpdates: 0,
            responseTime: 6,
            collaborationScore: 0.2
          }
        ],
        userProfile: {
          role: 'employee',
          department: 'Sales',
          tenure: 6
        }
      };

      const result = predictor.predict(input);

      expect(result.riskLevel).toBeOneOf(['high', 'critical']);
      expect(result.riskScore).toBeGreaterThan(0.6);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle empty metrics gracefully', () => {
      const input: BurnoutPredictionInput = {
        wellbeingMetrics: [],
        productivityMetrics: [],
        userProfile: {
          role: 'employee',
          department: 'Engineering',
          tenure: 12
        }
      };

      const result = predictor.predict(input);

      expect(result.riskScore).toBeDefined();
      expect(result.riskLevel).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.factors).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should calculate trend correctly with sufficient data', () => {
      const wellbeingMetrics = Array.from({ length: 14 }, (_, i) => ({
        id: `${i}`,
        userId: 'user1',
        date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000),
        stressLevel: i < 7 ? 8 : 4, // Stress decreasing over time
        energyLevel: i < 7 ? 3 : 7, // Energy increasing over time
        workloadSatisfaction: 6,
        workLifeBalance: i < 7 ? 3 : 7, // Balance improving
        jobSatisfaction: 6,
        burnoutRisk: 0.3,
        sentimentScore: 0,
        source: 'survey' as const
      }));

      const input: BurnoutPredictionInput = {
        wellbeingMetrics,
        productivityMetrics: [],
        userProfile: {
          role: 'employee',
          department: 'Engineering',
          tenure: 12
        }
      };

      const result = predictor.predict(input);

      expect(result.trend).toBe('improving');
    });

    it('should include Slack data in analysis when provided', () => {
      const input: BurnoutPredictionInput = {
        wellbeingMetrics: [
          {
            id: '1',
            userId: 'user1',
            date: new Date(),
            stressLevel: 5,
            energyLevel: 5,
            workloadSatisfaction: 5,
            workLifeBalance: 5,
            jobSatisfaction: 5,
            burnoutRisk: 0.3,
            sentimentScore: 0,
            source: 'survey'
          }
        ],
        productivityMetrics: [],
        slackData: [
          {
            userId: 'user1',
            date: new Date(),
            messageCount: 3, // Low message count
            sentimentScore: -0.3, // Negative sentiment
            responseTime: 4,
            activeHours: 6
          }
        ],
        userProfile: {
          role: 'employee',
          department: 'Engineering',
          tenure: 12
        }
      };

      const result = predictor.predict(input);

      // Should have social factor included
      const socialFactor = result.factors.find(f => f.factor === 'social');
      expect(socialFactor).toBeDefined();
      expect(socialFactor?.impact).toBeGreaterThan(0); // Should indicate risk due to low activity and negative sentiment
    });
  });
});

// Custom Jest matcher
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false,
      };
    }
  },
});
