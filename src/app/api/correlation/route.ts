import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/auth';
import { wellbeingService, productivityService } from '@/lib/database/services';
import { dataUtils } from '@/lib/utils';
import type { CorrelationData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await authServer.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const userId = searchParams.get('userId') || user.id;

    // Fetch real data from database
    const wellbeingMetrics = await wellbeingService.getWellbeingMetrics(userId, days);
    const productivityMetrics = await productivityService.getProductivityMetrics(userId, days);

    // Create correlation data by matching dates
    const correlationMap = new Map<string, CorrelationData>();

    // Process wellbeing data
    wellbeingMetrics.forEach(wb => {
      const dateStr = new Date(wb.date).toISOString().split('T')[0];
      const wellbeingScore = (wb.stressLevel + wb.energyLevel + wb.workLifeBalance + wb.jobSatisfaction) / 4 / 10;
      
      const existing = correlationMap.get(dateStr);
      correlationMap.set(dateStr, {
        date: dateStr,
        wellbeing: wellbeingScore,
        productivity: existing?.productivity || 0
      });
    });

    // Process productivity data
    productivityMetrics.forEach(prod => {
      const dateStr = new Date(prod.date).toISOString().split('T')[0];
      const productivityScore = (prod.tasksCompleted + prod.collaborationScore) / (prod.meetingHours + 1) / 10;
      
      const existing = correlationMap.get(dateStr);
      correlationMap.set(dateStr, {
        date: dateStr,
        wellbeing: existing?.wellbeing || 0,
        productivity: productivityScore
      });
    });

    // Convert map to array and sort by date
    const correlationData = Array.from(correlationMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ data: correlationData });
  } catch (error) {
    console.error('Error fetching correlation data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
