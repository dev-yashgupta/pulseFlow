import { NextRequest, NextResponse } from 'next/server';
import { createSalesforceIntegration } from '@/lib/integrations/salesforce';
import { authServer } from '@/lib/auth/auth';
import { supabase } from '@/lib/database/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await authServer.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Require Salesforce integration to be configured
    const salesforce = createSalesforceIntegration();
    if (!salesforce) {
      return NextResponse.json(
        { error: 'Salesforce integration not configured. Please configure SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET.' },
        { status: 503 }
      );
    }

    try {
      // Authenticate and fetch real Salesforce data
      const authenticated = await salesforce.authenticate();
      if (!authenticated) {
        return NextResponse.json(
          { error: 'Failed to authenticate with Salesforce. Please check credentials.' },
          { status: 401 }
        );
      }

      // Get real data from Salesforce
      const salesforceData = await salesforce.analyzeUserActivity(user.id, days);
      
      // Optionally store in database for caching/analytics
      // await supabase.from('salesforce_data').insert({ user_id: user.id, data: salesforceData });

      return NextResponse.json({ data: [salesforceData] });
    } catch (error) {
      console.error('Error fetching Salesforce data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch real Salesforce data. Please ensure Salesforce integration is properly configured.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in Salesforce API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
