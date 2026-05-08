import { NextRequest, NextResponse } from 'next/server';
import { interventionEngine } from '@/lib/interventions/interventionEngine';
import { burnoutPredictor } from '@/lib/ml/burnoutPredictor';
import { authServer } from '@/lib/auth/auth';
import { userService, wellbeingService, productivityService, interventionHistoryService } from '@/lib/database/services';

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

    // Calculate tenure in months
    const createdAt = new Date(userProfile.createdAt);
    const now = new Date();
    const tenureMonths = (now.getFullYear() - createdAt.getFullYear()) * 12 + 
                         (now.getMonth() - createdAt.getMonth());

    // Generate burnout prediction
    const burnoutPrediction = burnoutPredictor.predict({
      wellbeingMetrics: wellbeingData,
      productivityMetrics: productivityData,
      userProfile: {
        role: userProfile.role,
        department: userProfile.department,
        tenure: Math.max(1, tenureMonths) // At least 1 month
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

    // Save intervention records to database
    for (const action of actions) {
      try {
        await interventionHistoryService.createInterventionRecord({
          userId: targetUserId,
          type: action.type,
          priority: action.priority,
          message: action.message,
          status: 'completed'
        });
      } catch (error) {
        console.error('Error saving intervention record:', error);
      }
    }

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

    // Get recent intervention history from database
    const interventionHistory = await interventionHistoryService.getRecentInterventions(userId, 20);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        interventionHistory: interventionHistory.map(record => ({
          id: record.id,
          timestamp: record.created_at,
          type: record.type,
          priority: record.priority,
          message: record.message,
          status: record.status
        })),
        totalInterventions: interventionHistory.length,
        lastIntervention: interventionHistory[0]?.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching intervention history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
