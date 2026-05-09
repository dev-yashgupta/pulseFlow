import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/auth';
import { userService, wellbeingService, productivityService } from '@/lib/database/services';
import { dataUtils } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await authServer.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user to check if they're a manager
    const currentUser = await userService.getUser(user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch team members if user is a manager
    let teamMembers;
    if (currentUser.role === 'manager' || currentUser.role === 'executive' || currentUser.role === 'admin') {
      teamMembers = await userService.getTeamMembers(user.id);
    } else {
      // If not a manager, return empty team or just the user
      teamMembers = [currentUser];
    }

    // Enrich team data with metrics
    const enrichedTeam = await Promise.all(
      teamMembers.map(async (member) => {
        try {
          const wellbeingMetrics = await wellbeingService.getWellbeingMetrics(member.id, 30);
          const productivityMetrics = await productivityService.getProductivityMetrics(member.id, 30);

          // Calculate average metrics
          const avgWellbeing = wellbeingMetrics.length > 0
            ? dataUtils.calculateAverage(
                wellbeingMetrics.map(w => (w.stressLevel + w.energyLevel + w.workLifeBalance + w.jobSatisfaction) / 4)
              ) / 2 // Normalize to 0-10 scale
            : 0;

          const avgProductivity = productivityMetrics.length > 0
            ? dataUtils.calculateAverage(
                productivityMetrics.map(p => (p.tasksCompleted + p.collaborationScore * 10))
              ) / 2
            : 0;

          const latestWellbeing = wellbeingMetrics[wellbeingMetrics.length - 1];
          const burnoutRisk = latestWellbeing?.burnoutRisk || 0;

          return {
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            wellbeingScore: Math.round(avgWellbeing * 10) / 10,
            productivityScore: Math.round(avgProductivity * 10) / 10,
            burnoutRisk: Math.round(burnoutRisk * 100) / 100,
            lastActive: new Date()
          };
        } catch (error) {
          console.error(`Error enriching data for user ${member.id}:`, error);
          return {
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            wellbeingScore: 0,
            productivityScore: 0,
            burnoutRisk: 0,
            lastActive: new Date()
          };
        }
      })
    );

    return NextResponse.json({ data: enrichedTeam });
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
