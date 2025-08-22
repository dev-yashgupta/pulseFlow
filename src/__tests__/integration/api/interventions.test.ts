/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/interventions/route';

// Mock the auth and database services
jest.mock('@/lib/auth/auth', () => ({
  authServer: {
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('@/lib/database/services', () => ({
  userService: {
    getUser: jest.fn(),
  },
  wellbeingService: {
    getWellbeingMetrics: jest.fn(),
  },
  productivityService: {
    getProductivityMetrics: jest.fn(),
  },
}));

jest.mock('@/lib/interventions/interventionEngine', () => ({
  interventionEngine: {
    analyzeAndIntervene: jest.fn(),
  },
}));

jest.mock('@/lib/ml/burnoutPredictor', () => ({
  burnoutPredictor: {
    predict: jest.fn(),
  },
}));

import { authServer } from '@/lib/auth/auth';
import { userService, wellbeingService, productivityService } from '@/lib/database/services';
import { interventionEngine } from '@/lib/interventions/interventionEngine';
import { burnoutPredictor } from '@/lib/ml/burnoutPredictor';

describe('/api/interventions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should trigger interventions for authenticated user', async () => {
      // Mock authenticated user
      (authServer.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
      });

      // Mock user profile
      (userService.getUser as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'employee',
        department: 'Engineering',
        managerId: 'manager123',
      });

      // Mock wellbeing and productivity data
      (wellbeingService.getWellbeingMetrics as jest.Mock).mockResolvedValue([
        {
          id: '1',
          userId: 'user123',
          date: new Date(),
          stressLevel: 8,
          energyLevel: 3,
          workloadSatisfaction: 4,
          workLifeBalance: 3,
          jobSatisfaction: 4,
          burnoutRisk: 0.8,
          sentimentScore: -0.3,
          source: 'survey',
        },
      ]);

      (productivityService.getProductivityMetrics as jest.Mock).mockResolvedValue([
        {
          id: '1',
          userId: 'user123',
          date: new Date(),
          tasksCompleted: 3,
          meetingHours: 6,
          focusTime: 2,
          responseTime: 4,
          collaborationScore: 0.3,
        },
      ]);

      // Mock burnout prediction
      (burnoutPredictor.predict as jest.Mock).mockReturnValue({
        riskScore: 0.8,
        riskLevel: 'high',
        confidence: 0.9,
        factors: [
          { factor: 'stress', impact: 0.4, weight: 0.25, description: 'High stress level' },
        ],
        recommendations: ['Schedule immediate check-in with manager'],
        trend: 'declining',
      });

      // Mock intervention engine
      (interventionEngine.analyzeAndIntervene as jest.Mock).mockResolvedValue([
        {
          type: 'manager_alert',
          priority: 'high',
          message: 'Employee showing high burnout risk',
        },
        {
          type: 'slack_message',
          priority: 'high',
          message: 'Wellbeing check-in message sent',
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/interventions', {
        method: 'POST',
        body: JSON.stringify({ triggerType: 'manual' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userId).toBe('user123');
      expect(data.data.riskLevel).toBe('high');
      expect(data.data.actionsTriggered).toBe(2);
      expect(data.data.actions).toHaveLength(2);

      // Verify services were called correctly
      expect(userService.getUser).toHaveBeenCalledWith('user123');
      expect(wellbeingService.getWellbeingMetrics).toHaveBeenCalledWith('user123', 30);
      expect(productivityService.getProductivityMetrics).toHaveBeenCalledWith('user123', 30);
      expect(interventionEngine.analyzeAndIntervene).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated user', async () => {
      (authServer.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/interventions', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 for non-existent user', async () => {
      (authServer.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
      });

      (userService.getUser as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/interventions', {
        method: 'POST',
        body: JSON.stringify({ userId: 'nonexistent' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should handle intervention engine errors gracefully', async () => {
      (authServer.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
      });

      (userService.getUser as jest.Mock).mockResolvedValue({
        id: 'user123',
        name: 'Test User',
        role: 'employee',
        department: 'Engineering',
      });

      (wellbeingService.getWellbeingMetrics as jest.Mock).mockResolvedValue([]);
      (productivityService.getProductivityMetrics as jest.Mock).mockResolvedValue([]);

      (burnoutPredictor.predict as jest.Mock).mockReturnValue({
        riskScore: 0.3,
        riskLevel: 'low',
        confidence: 0.7,
        factors: [],
        recommendations: [],
        trend: 'stable',
      });

      (interventionEngine.analyzeAndIntervene as jest.Mock).mockRejectedValue(
        new Error('Intervention engine error')
      );

      const request = new NextRequest('http://localhost:3000/api/interventions', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('GET', () => {
    it('should return intervention history for authenticated user', async () => {
      (authServer.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
      });

      const request = new NextRequest('http://localhost:3000/api/interventions');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userId).toBe('user123');
      expect(data.data.interventionHistory).toBeInstanceOf(Array);
      expect(data.data.totalInterventions).toBeDefined();
    });

    it('should return 401 for unauthenticated user', async () => {
      (authServer.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/interventions');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle query parameters correctly', async () => {
      (authServer.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
      });

      const request = new NextRequest('http://localhost:3000/api/interventions?userId=user456');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userId).toBe('user456');
    });
  });
});
