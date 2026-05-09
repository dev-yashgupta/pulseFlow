/**
 * Production Logging
 * Centralized logging for production environment
 */

export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  },

  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
  },

  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  },

  apiCall: (endpoint: string, method: string, statusCode: number, responseTime: number) => {
    console.log(`[API] ${method} ${endpoint} - ${statusCode} - ${responseTime}ms`);
  },

  databaseQuery: (query: string, duration: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] ${query} - ${duration}ms`);
    }
  }
};
