import { NextRequest, NextResponse } from 'next/server';
import { interventionEngine } from '@/lib/interventions/interventionEngine';
import { burnoutPredictor } from '@/lib/ml/burnoutPredictor';
import { authServer } from '@/lib/auth/auth';
import { userService, wellbeingService, productivityService } from '@/lib/database/services';

export async function POST(request: NextRequest) {
  try {
    const user = await authServer.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, triggerType = 'manual' } = await request.json();
    const targetUserId = userId || user.id;

    // Get user profile
    const userProfile = await userService.getUser(targetUserId);
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get wellbeing and productivity data
    const wellbeingData = await wellbeingService.getWellbeingMetrics(targetUserId, 30);
    const productivityData = await productivityService.getProductivityMetrics(targetUserId, 30);

    // Generate burnout prediction
    const burnoutPrediction = burnoutPredictor.predict({
      wellbeingMetrics: wellbeingData,
      productivityMetrics: productivityData,
      userProfile: {
        role: userProfile.role,
        department: userProfile.department,
        tenure: 12 // Mock tenure - would calculate from created_at
      }
    });

    // Get manager if exists
    let manager = null;
    if (userProfile.managerId) {
      manager = await userService.getUser(userProfile.managerId);
    }

    // Create intervention context
    const context = {
      user: userProfile,
      wellbeingData,
      productivityData,
      burnoutPrediction,
      manager
    };

    // Execute interventions
    const actions = await interventionEngine.analyzeAndIntervene(context);

    return NextResponse.json({
      success: true,
      data: {
        userId: targetUserId,
        riskLevel: burnoutPrediction.riskLevel,
        riskScore: burnoutPrediction.riskScore,
        confidence: burnoutPrediction.confidence,
        actionsTriggered: actions.length,
        actions: actions.map(action => ({
          type: action.type,
          priority: action.priority,
          message: action.message
        }))
      }
    });
  } catch (error) {
    console.error('Error processing interventions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authServer.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;

    // Get recent intervention history (mock data for demo)
    const interventionHistory = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'slack_message',
        priority: 'medium',
        message: 'Wellbeing check-in sent',
        status: 'completed'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        type: 'manager_alert',
        priority: 'high',
        message: 'Manager notified of increased stress levels',
        status: 'completed'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        userId,
        interventionHistory,
        totalInterventions: interventionHistory.length,
        lastIntervention: interventionHistory[0]?.timestamp
      }
    });
  } catch (error) {
    console.error('Error fetching intervention history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
