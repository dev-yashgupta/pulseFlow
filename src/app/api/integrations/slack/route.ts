import { NextRequest, NextResponse } from 'next/server';
import { createSlackIntegration } from '@/lib/integrations/slack';
import { authServer } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await authServer.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Require Slack integration to be configured
    const slack = createSlackIntegration();
    if (!slack) {
      return NextResponse.json(
        { error: 'Slack integration not configured. Please set SLACK_BOT_TOKEN environment variable.' },
        { status: 503 }
      );
    }

    try {
      // Get real Slack data
      const slackData = await slack.analyzeUserActivity(user.id, days);
      return NextResponse.json({ data: [slackData] });
    } catch (error) {
      console.error('Error fetching Slack data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch real Slack data. Please ensure Slack integration is properly configured.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in Slack API route:', error);
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
