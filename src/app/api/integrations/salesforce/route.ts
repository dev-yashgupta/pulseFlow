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

    // Try to get real Salesforce data if integration is configured
    const salesforce = createSalesforceIntegration();
    let salesforceData;

    if (salesforce) {
      try {
        // Attempt to authenticate and fetch real Salesforce data
        const authenticated = await salesforce.authenticate();
        if (authenticated && user.id) {
          salesforceData = await salesforce.analyzeUserActivity(user.id, days);
          salesforceData = [salesforceData]; // Wrap in array for consistency
        } else {
          throw new Error('Salesforce authentication failed');
        }
      } catch (error) {
        console.warn('Failed to fetch real Salesforce data, using mock:', error);
        salesforceData = generateMockSalesforceData(userId, days);
      }
    } else {
      // No Salesforce integration configured, use mock data
      salesforceData = generateMockSalesforceData(userId, days);
    }

    return NextResponse.json({ data: salesforceData });
  } catch (error) {
    console.error('Error fetching Salesforce data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
