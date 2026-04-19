/**
 * Custom error classes for consistent error handling across the API
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class LockedError extends AppError {
  constructor(message: string = 'Resource locked') {
    super(message, 423, 'LOCKED');
  }
}

/**
 * Error logging utility
 */
export function logError(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    });
  } else {
    // In production, log less verbose info
    console.error('[Error]', {
      name: error.name,
      message: error.message,
      context,
    });
  }
}

/**
 * Convert any error to a consistent API response format
 */
export function errorToResponse(error: unknown): { body: any; status: number } {
  if (error instanceof AppError) {
    return {
      body: error.toJSON(),
      status: error.statusCode,
    };
  }

  if (error instanceof Error) {
    logError(error);
    return {
      body: {
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      },
      status: 500,
    };
  }

  return {
    body: { error: 'Unknown error occurred' },
    status: 500,
  };
}
