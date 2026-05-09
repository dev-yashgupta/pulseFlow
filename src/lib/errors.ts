/**
 * Error Handlers for API Routes
 * Provides standardized error handling across the application
 */

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export class AppError extends Error implements ApiError {
  code: string;
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const ErrorResponses = {
  UNAUTHORIZED: new AppError('Unauthorized access', 401, 'UNAUTHORIZED'),
  FORBIDDEN: new AppError('Access forbidden', 403, 'FORBIDDEN'),
  NOT_FOUND: new AppError('Resource not found', 404, 'NOT_FOUND'),
  BAD_REQUEST: (message = 'Bad request') => new AppError(message, 400, 'BAD_REQUEST'),
  INTERNAL_ERROR: new AppError('Internal server error', 500, 'INTERNAL_ERROR'),
  SERVICE_UNAVAILABLE: new AppError('Service unavailable', 503, 'SERVICE_UNAVAILABLE'),
  
  DATABASE_ERROR: new AppError('Database operation failed', 500, 'DATABASE_ERROR'),
  VALIDATION_ERROR: (message = 'Validation failed', details?: any) => 
    new AppError(message, 400, 'VALIDATION_ERROR', details),
  
  INTEGRATION_ERROR: (service: string) => 
    new AppError(`${service} integration failed`, 503, 'INTEGRATION_ERROR', { service }),
};

export const handleApiError = (error: any) => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        error: error.message,
        code: error.code,
        details: error.details
      }
    };
  }

  // Unknown error
  return {
    statusCode: 500,
    body: {
      error: 'Internal server error',
      code: 'UNKNOWN_ERROR'
    }
  };
};
