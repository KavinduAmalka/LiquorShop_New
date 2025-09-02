import multer from 'multer';
import { logSecurityEvent, SECURITY_EVENTS } from './securityMonitoring.js';

// Global error handling middleware
export const errorHandler = async (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    await logSecurityEvent(SECURITY_EVENTS.INVALID_FILE_UPLOAD, {
      error: err.code,
      message: err.message
    }, req);

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 4 files.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }

  // File type validation errors
  if (err.message && err.message.includes('Only image files')) {
    await logSecurityEvent(SECURITY_EVENTS.INVALID_FILE_UPLOAD, {
      reason: 'Invalid file type',
      message: err.message
    }, req);

    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only JPEG, JPG, PNG, and WebP files are allowed.'
    });
  }

  // MongoDB validation errors
  if (err.name === 'ValidationError') {
    await logSecurityEvent(SECURITY_EVENTS.VALIDATION_ERROR, {
      model: err.message.includes('Product') ? 'Product' : 'Unknown',
      fields: Object.keys(err.errors || {}),
      path: req.path
    }, req);

    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    await logSecurityEvent(SECURITY_EVENTS.DATA_INTEGRITY_VIOLATION, {
      field: Object.keys(err.keyValue || {})[0],
      value: err.keyValue ? '[REDACTED]' : 'unknown',
      collection: err.collection
    }, req);

    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    await logSecurityEvent(SECURITY_EVENTS.UNAUTHORIZED_ACCESS, {
      error: 'Invalid JWT token',
      path: req.path,
      tokenPresent: !!req.headers.authorization
    }, req);

    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    await logSecurityEvent(SECURITY_EVENTS.UNAUTHORIZED_ACCESS, {
      error: 'Expired JWT token',
      path: req.path,
      expiredAt: err.expiredAt
    }, req);

    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    await logSecurityEvent(SECURITY_EVENTS.VALIDATION_ERROR, {
      type: 'CastError',
      path: err.path,
      value: '[REDACTED]',
      kind: err.kind
    }, req);

    return res.status(400).json({
      success: false,
      message: 'Invalid data format provided.'
    });
  }

  // Rate limiting errors
  if (err.status === 429) {
    await logSecurityEvent(SECURITY_EVENTS.RATE_LIMIT_EXCEEDED, {
      path: req.path,
      limit: err.limit || 'unknown',
      current: err.current || 'unknown'
    }, req);

    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: err.resetTime
    });
  }

  // Auth0 related errors
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    await logSecurityEvent(SECURITY_EVENTS.UNAUTHORIZED_ACCESS, {
      error: err.message,
      path: req.path,
      token: req.headers.authorization ? 'Present' : 'Missing'
    }, req);

    return res.status(401).json({
      success: false,
      message: 'Unauthorized access. Please log in again.'
    });
  }

  // Generic security-related errors (4xx)
  if (err.status >= 400 && err.status < 500) {
    await logSecurityEvent(SECURITY_EVENTS.SECURITY_VIOLATION, {
      status: err.status,
      path: req.path,
      error: err.message,
      method: req.method
    }, req);
  }

  // Log unexpected errors for security monitoring (5xx)
  if (err.status >= 500 || !err.status) {
    await logSecurityEvent(SECURITY_EVENTS.SYSTEM_ERROR, {
      stack: err.stack ? err.stack.split('\n')[0] : 'No stack trace',
      path: req.path,
      method: req.method,
      error: err.message
    }, req);
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message
  });
};

// 404 handler
export const notFoundHandler = async (req, res) => {
  // Log potential probing attempts
  await logSecurityEvent(SECURITY_EVENTS.SECURITY_VIOLATION, {
    type: 'Route not found',
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent') || 'unknown'
  }, req);

  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};
