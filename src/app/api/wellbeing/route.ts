import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/auth';
import { wellbeingService } from '@/lib/database/services';

export async function GET(request: NextRequest) {
  try {
    const user = await authServer.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const userId = searchParams.get('userId') || user.id;

    // Fetch real wellbeing metrics from database
    const wellbeingMetrics = await wellbeingService.getWellbeingMetrics(userId, days);

    return NextResponse.json({ data: wellbeingMetrics });
  } catch (error) {
    console.error('Error fetching wellbeing data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
