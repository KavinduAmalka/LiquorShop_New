import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// Create rate limit store in memory (for production, use Redis)
const createRateLimiter = (windowMs, max, message, skipSuccessfulRequests = false, context = {}) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message,
      details: {
        limit: max,
        windowMs,
        retryAfter: Math.ceil(windowMs / 1000),
        windowDescription: getWindowDescription(windowMs),
        ...context
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      const timeRemaining = Math.ceil(windowMs / 1000);
      const windowDesc = getWindowDescription(windowMs);
      
      console.warn(`Rate limit exceeded for IP: ${req.ip}, URL: ${req.url}, Limit: ${max}/${windowDesc}`);
      
      res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message,
        details: {
          limit: max,
          window: windowDesc,
          retryAfter: timeRemaining,
          retryAfterHuman: getHumanReadableTime(timeRemaining),
          suggestion: getSuggestion(context.type),
          timestamp: new Date().toISOString(),
          ...context
        }
      });
    }
  });
};

// Helper function to convert milliseconds to human-readable format
const getWindowDescription = (windowMs) => {
  const minutes = windowMs / (1000 * 60);
  const hours = windowMs / (1000 * 60 * 60);
  
  if (hours >= 1) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  } else if (minutes >= 1) {
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  } else {
    return `${windowMs / 1000} seconds`;
  }
};

// Helper function to convert seconds to human-readable time
const getHumanReadableTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

// Helper function to provide suggestions based on rate limit type
const getSuggestion = (type) => {
  const suggestions = {
    'auth': 'Please wait before trying to log in again. Consider using "Remember Me" to reduce login frequency.',
    'register': 'Account registration is limited. Please contact support if you need assistance.',
    'upload': 'File uploads are limited to prevent abuse. Please wait before uploading more files.',
    'cart': 'Please slow down when adding items to your cart.',
    'order': 'Order placement is limited to prevent duplicate orders. Please wait before placing another order.',
    'search': 'Please wait a moment before searching again.',
    'profile': 'Profile updates are limited. Please wait before making more changes.',
    'general': 'You are making requests too quickly. Please slow down.'
  };
  
  return suggestions[type] || suggestions.general;
};

// General API rate limiting - 100 requests per 15 minutes
export const generalRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'You have exceeded the maximum number of requests allowed. Please wait before making more requests.',
  false,
  { 
    type: 'general',
    category: 'API Access',
    endpoint: 'general'
  }
);

// Authentication rate limiting - 5 login attempts per 15 minutes
export const authRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 login attempts per windowMs
  'Too many login attempts detected. Please wait before trying to log in again for security reasons.',
  false, // Don't skip on successful requests for security
  { 
    type: 'auth',
    category: 'Authentication',
    endpoint: 'login',
    securityNote: 'Multiple failed login attempts can indicate a security threat'
  }
);

// Registration rate limiting - 3 registrations per hour
export const registerRateLimit = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // limit each IP to 3 registrations per hour
  'Registration limit exceeded. You can only create a limited number of accounts per hour.',
  false,
  { 
    type: 'register',
    category: 'Account Creation',
    endpoint: 'register',
    note: 'This limit helps prevent spam account creation'
  }
);

// File upload rate limiting - 10 uploads per hour
export const uploadRateLimit = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 file uploads per hour
  'File upload limit exceeded. You can only upload a limited number of files per hour.',
  false,
  { 
    type: 'upload',
    category: 'File Operations',
    endpoint: 'upload',
    note: 'This limit prevents server overload and abuse'
  }
);

// Cart operations - 50 per 15 minutes (users add/remove items frequently)
export const cartRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  50, // limit each IP to 50 cart operations per 15 minutes
  'You are adding items to your cart too quickly. Please slow down to ensure a smooth shopping experience.',
  false,
  { 
    type: 'cart',
    category: 'Shopping Cart',
    endpoint: 'cart',
    tip: 'Take your time to review items before adding them'
  }
);

// Order placement - 5 orders per hour
export const orderRateLimit = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // limit each IP to 5 orders per hour
  'Order placement limit reached. You can only place a limited number of orders per hour to prevent duplicate orders.',
  false,
  { 
    type: 'order',
    category: 'Order Processing',
    endpoint: 'order',
    note: 'This helps prevent accidental duplicate orders and payment issues'
  }
);

// Search rate limiting - 30 searches per minute
export const searchRateLimit = createRateLimiter(
  60 * 1000, // 1 minute
  30, // limit each IP to 30 searches per minute
  'Search limit exceeded. Please wait a moment before searching again.',
  false,
  { 
    type: 'search',
    category: 'Search Operations',
    endpoint: 'search',
    tip: 'Try using more specific search terms to find what you need faster'
  }
);

// Profile update limiting - 10 updates per hour
export const profileRateLimit = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 profile updates per hour
  'Profile update limit exceeded. You can only update your profile a limited number of times per hour.',
  false,
  { 
    type: 'profile',
    category: 'Profile Management',
    endpoint: 'profile',
    suggestion: 'Review your changes carefully before saving'
  }
);

// Slow down middleware for repeated requests
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes at full speed
  delayMs: () => 500, // add fixed 500ms delay per request after delayAfter
  maxDelayMs: 5000, // maximum delay of 5 seconds
  skipSuccessfulRequests: true,
  validate: { delayMs: false } // Disable the warning
});

// Create IP whitelist for trusted sources (empty by default)
const trustedIPs = [
  // Add trusted IPs here if needed, e.g., '127.0.0.1', 'your-server-ip'
];

// Middleware to skip rate limiting for trusted IPs
export const skipTrustedIPs = (req, res, next) => {
  if (trustedIPs.includes(req.ip)) {
    req.skipRateLimit = true;
  }
  next();
};

// Enhanced security headers
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent caching of sensitive content
  if (req.url.includes('/api/user/') || req.url.includes('/api/auth0-user/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};
