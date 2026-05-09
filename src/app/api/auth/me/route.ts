import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await authServer.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ 
      user,
      authenticated: true 
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
