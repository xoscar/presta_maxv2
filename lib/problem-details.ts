import { NextResponse } from 'next/server';

/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
  /**
   * A URI reference that identifies the problem type.
   * When dereferenced, it should provide human-readable documentation.
   */
  type: string;

  /**
   * A short, human-readable summary of the problem type.
   * Should not change between occurrences.
   */
  title: string;

  /**
   * The HTTP status code for this occurrence.
   */
  status: number;

  /**
   * A human-readable explanation specific to this occurrence.
   */
  detail?: string;

  /**
   * A URI reference that identifies the specific occurrence.
   */
  instance?: string;

  /**
   * Extension members for additional context
   */
  [key: string]: unknown;
}

// Problem type URIs (using "about:blank" for generic HTTP status problems)
export const ProblemTypes = {
  // Generic HTTP problems (use about:blank per RFC 7807 section 4.2)
  GENERIC: 'about:blank',

  // Application-specific problem types
  VALIDATION_ERROR: '/problems/validation-error',
  NOT_FOUND: '/problems/not-found',
  UNAUTHORIZED: '/problems/unauthorized',
  FORBIDDEN: '/problems/forbidden',
  CONFLICT: '/problems/conflict',
  INTERNAL_ERROR: '/problems/internal-error',
} as const;

// Standard problem titles
const ProblemTitles: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
};

/**
 * Create a RFC 7807 compliant problem details response
 */
export function problemResponse(
  status: number,
  options: {
    type?: string;
    title?: string;
    detail?: string;
    instance?: string;
    errors?: Array<{ field: string; message: string }>;
    [key: string]: unknown;
  } = {}
): NextResponse<ProblemDetails> {
  const { type, title, detail, instance, ...extensions } = options;

  const problem: ProblemDetails = {
    type: type || ProblemTypes.GENERIC,
    title: title || ProblemTitles[status] || 'Error',
    status,
  };

  if (detail) {
    problem.detail = detail;
  }

  if (instance) {
    problem.instance = instance;
  }

  // Add any extension members
  Object.assign(problem, extensions);

  return NextResponse.json(problem, {
    status,
    headers: {
      'Content-Type': 'application/problem+json',
    },
  });
}

// Convenience functions for common error responses

export function unauthorized(detail?: string, instance?: string): NextResponse<ProblemDetails> {
  return problemResponse(401, {
    type: ProblemTypes.UNAUTHORIZED,
    detail: detail || 'Authentication is required to access this resource.',
    instance,
  });
}

export function forbidden(detail?: string, instance?: string): NextResponse<ProblemDetails> {
  return problemResponse(403, {
    type: ProblemTypes.FORBIDDEN,
    detail: detail || 'You do not have permission to access this resource.',
    instance,
  });
}

export function notFound(
  resource: string,
  detail?: string,
  instance?: string
): NextResponse<ProblemDetails> {
  return problemResponse(404, {
    type: ProblemTypes.NOT_FOUND,
    detail: detail || `The requested ${resource} was not found.`,
    instance,
  });
}

export function validationError(
  errors: Array<{ field: string; message: string }>,
  detail?: string,
  instance?: string
): NextResponse<ProblemDetails> {
  return problemResponse(400, {
    type: ProblemTypes.VALIDATION_ERROR,
    title: 'Validation Error',
    detail: detail || 'The request body contains invalid data.',
    instance,
    errors,
  });
}

export function conflict(detail: string, instance?: string): NextResponse<ProblemDetails> {
  return problemResponse(409, {
    type: ProblemTypes.CONFLICT,
    detail,
    instance,
  });
}

export function internalError(detail?: string, instance?: string): NextResponse<ProblemDetails> {
  return problemResponse(500, {
    type: ProblemTypes.INTERNAL_ERROR,
    detail: detail || 'An unexpected error occurred. Please try again later.',
    instance,
  });
}

/**
 * Convert legacy error format to problem details response
 */
export function fromLegacyError(error: {
  statusCode?: number;
  messages?: Array<{ code: string; text: string }>;
  type?: string;
  message?: string;
}): NextResponse<ProblemDetails> {
  const status = error.statusCode || 500;

  // Convert legacy messages array to errors array
  const errors = error.messages?.map((msg) => ({
    field: msg.code,
    message: msg.text,
  }));

  // Determine detail from first message or generic message
  const detail = error.messages?.[0]?.text || error.message || undefined;

  // Map legacy type to problem type
  let type: string = ProblemTypes.GENERIC;
  if (error.type === 'ValidationError') {
    type = ProblemTypes.VALIDATION_ERROR;
  } else if (error.type === 'NotFoundError') {
    type = ProblemTypes.NOT_FOUND;
  }

  return problemResponse(status, {
    type,
    detail,
    errors: errors?.length ? errors : undefined,
  });
}
