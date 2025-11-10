// Simple in-memory rate limiter
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
) {
  const now = Date.now();
  const record = store[identifier];

  // Clean up old entries
  if (record && now > record.resetTime) {
    delete store[identifier];
  }

  // Initialize new entry
  if (!store[identifier]) {
    store[identifier] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  const current = store[identifier];

  // Check if limit exceeded
  if (current.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetTime - now) / 1000),
    };
  }

  // Increment counter
  current.count++;

  return {
    success: true,
    remaining: limit - current.count,
    retryAfter: 0,
  };
}

export function checkRateLimit(
  req: Request,
  limit: number = 10,
  windowMs: number = 60000
) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  return rateLimit(ip, limit, windowMs);
}