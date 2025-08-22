import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const startTime = Date.now();

    // Check database connectivity (only if environment variables are available)
    let databaseStatus = 'not_configured';
    let responseTime = 0;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1);

        if (error) {
          databaseStatus = 'error';
        } else {
          databaseStatus = 'healthy';
        }

        responseTime = Date.now() - startTime;
      } catch (error) {
        databaseStatus = 'error';
      }
    }

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: {
          status: databaseStatus,
          responseTime: `${responseTime}ms`
        },
        environment: {
          status: missingEnvVars.length === 0 ? 'healthy' : 'warning',
          missingVars: missingEnvVars
        },
        integrations: {
          slack: process.env.SLACK_BOT_TOKEN ? 'configured' : 'not_configured',
          salesforce: process.env.SALESFORCE_CLIENT_ID ? 'configured' : 'not_configured',
          openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
        }
      }
    };

    // Determine overall status
    if (missingEnvVars.length > 0) {
      health.status = 'warning';
    }

    return NextResponse.json(health, { 
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime()
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
