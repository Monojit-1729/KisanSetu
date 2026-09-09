import rateLimit from 'express-rate-limit';

/**
 * Targeted rate limiter for public authentication endpoints (Login / Register).
 * Prevents automated brute-force credential stuffing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

/**
 * Targeted rate limiter for public SMS simulation / incoming endpoint.
 * Prevents flood abuse while allowing normal interactive demo commands.
 */
export const smsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 SMS commands per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    error: 'Too many SMS requests sent in a short period. Please wait a minute before retrying.',
  },
});

export default {
  authLimiter,
  smsLimiter,
};
