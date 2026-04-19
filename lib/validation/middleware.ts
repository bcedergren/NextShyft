import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { ValidationError, errorToResponse } from '../errors';

/**
 * Validates request body against a Zod schema
 */
export async function validateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Validation failed', {
        errors: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON body', {
        errors: [{ path: '', message: 'Request body must be valid JSON' }],
      });
    }
    throw error;
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  try {
    const queryObject: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      const existing = queryObject[key];
      if (existing === undefined) {
        queryObject[key] = value;
      } else if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        queryObject[key] = [existing, value];
      }
    });
    return schema.parse(queryObject);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Query validation failed', {
        errors: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    throw error;
  }
}

/**
 * Validates route parameters against a Zod schema
 */
export function validateParams<T>(
  params: Record<string, string | string[]>,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Parameter validation failed', {
        errors: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    throw error;
  }
}

/**
 * Higher-order function to wrap route handlers with validation
 */
export function withValidation<TBody = any, TQuery = any>(
  handler: (req: Request, data: { body?: TBody; query?: TQuery; params?: any }) => Promise<Response>,
  schemas?: {
    body?: z.ZodSchema<TBody>;
    query?: z.ZodSchema<TQuery>;
    params?: z.ZodSchema<any>;
  }
) {
  return async (req: Request, context?: { params?: any }): Promise<Response> => {
    try {
      const data: { body?: TBody; query?: TQuery; params?: any } = {};

      // Validate body if schema provided
      if (schemas?.body && req.method !== 'GET' && req.method !== 'HEAD') {
        data.body = await validateBody(req, schemas.body);
      }

      // Validate query if schema provided
      if (schemas?.query) {
        const { searchParams } = new URL(req.url);
        data.query = validateQuery(searchParams, schemas.query);
      }

      // Validate params if schema provided
      if (schemas?.params && context?.params) {
        data.params = validateParams(context.params, schemas.params);
      }

      return await handler(req, data);
    } catch (error) {
      const { body, status } = errorToResponse(error);
      return NextResponse.json(body, { status });
    }
  };
}
