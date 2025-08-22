import { NextRequest, NextResponse } from 'next/server';
import { createSalesforceIntegration, generateMockSalesforceData } from '@/lib/integrations/salesforce';
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

    // For demo purposes, use mock data
    const salesforceData = generateMockSalesforceData(userId, days);

    return NextResponse.json({ data: salesforceData });
  } catch (error) {
    console.error('Error fetching Salesforce data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
