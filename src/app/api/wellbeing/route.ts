import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/database/auth-utils';
import { wellbeingService } from '@/lib/database/services';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const userId = searchParams.get('userId') || user.id;

    try {
      // Fetch real wellbeing metrics from database
      const wellbeingMetrics = await wellbeingService.getWellbeingMetrics(userId, days);
      return NextResponse.json({ data: wellbeingMetrics || [] });
    } catch (dbError) {
      // If no data in database, return empty array
      console.warn('No wellbeing data for user:', userId);
      return NextResponse.json({ data: [] });
    }
  } catch (error) {
    console.error('Error fetching wellbeing data:', error);
    return NextResponse.json({ data: [] });
  }
}
