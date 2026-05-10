import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/database/auth-utils';
import { wellbeingService, productivityService } from '@/lib/database/services';
import { dataUtils } from '@/lib/utils';
import type { CorrelationData } from '@/types';

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
      // Fetch real data from database
      const wellbeingMetrics = await wellbeingService.getWellbeingMetrics(userId, days);
      const productivityMetrics = await productivityService.getProductivityMetrics(userId, days);

      // Create correlation data by matching dates
      const correlationMap = new Map<string, CorrelationData>();

      // Process wellbeing data
      (wellbeingMetrics || []).forEach(wb => {
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
      (productivityMetrics || []).forEach(prod => {
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

      return NextResponse.json({ data: correlationData || [] });
    } catch (dbError) {
      // If no data in database, return empty array
      console.warn('No correlation data available for user:', userId);
      return NextResponse.json({ data: [] });
    }
  } catch (error) {
    console.error('Error fetching correlation data:', error);
    return NextResponse.json({ data: [] });
  }
}
