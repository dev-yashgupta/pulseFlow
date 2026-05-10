import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/database/auth-utils';
import { userService, wellbeingService, productivityService } from '@/lib/database/services';
import { dataUtils } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    try {
      // Get current user to check if they're a manager
      const currentUser = await userService.getUser(user.id);
      
      if (!currentUser) {
        // User exists in auth but not in users table - return empty team
        return NextResponse.json({ 
          data: [{
            id: user.id,
            name: user.user_metadata?.name || user.email || 'User',
            email: user.email || 'unknown',
            role: user.user_metadata?.role || 'employee',
            wellbeingScore: 0,
            productivityScore: 0,
            burnoutRisk: 0,
            lastActive: new Date()
          }] 
        });
      }

      // Fetch team members if user is a manager
      let teamMembers;
      if (currentUser.role === 'manager' || currentUser.role === 'executive' || currentUser.role === 'admin') {
        teamMembers = await userService.getTeamMembers(user.id);
        if (!teamMembers || teamMembers.length === 0) {
          // No team members, just return self
          teamMembers = [currentUser];
        }
      } else {
        // If not a manager, return just the user
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
    } catch (dbError) {
      // If database query fails, return authenticated user as fallback
      console.error('Database error fetching team:', dbError);
      return NextResponse.json({ 
        data: [{
          id: user.id,
          name: user.user_metadata?.name || user.email || 'User',
          email: user.email || 'unknown',
          role: user.user_metadata?.role || 'employee',
          wellbeingScore: 0,
          productivityScore: 0,
          burnoutRisk: 0,
          lastActive: new Date()
        }] 
      });
    }
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
