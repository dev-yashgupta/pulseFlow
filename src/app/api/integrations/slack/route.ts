import { NextRequest, NextResponse } from 'next/server';
import { createSlackIntegration, generateMockSlackData } from '@/lib/integrations/slack';
import { authServer } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await authServer.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const userId = searchParams.get('userId') || user.id;

    // Try to get real Slack data if integration is configured
    const slack = createSlackIntegration();
    let slackData;

    if (slack && user.id) {
      try {
        // Attempt to fetch real Slack data
        slackData = await slack.analyzeUserActivity(user.id, days);
        slackData = [slackData]; // Wrap in array for consistency
      } catch (error) {
        console.warn('Failed to fetch real Slack data, using mock:', error);
        slackData = generateMockSlackData(userId, days);
      }
    } else {
      // No Slack integration configured, use mock data
      slackData = generateMockSlackData(userId, days);
    }

    return NextResponse.json({ data: slackData });
  } catch (error) {
    console.error('Error fetching Slack data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authServer.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, channel } = await request.json();
    
    const slack = createSlackIntegration();
    if (!slack) {
      return NextResponse.json({ error: 'Slack integration not configured' }, { status: 503 });
    }

    const success = await slack.sendMessage(channel, message);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error sending Slack message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
