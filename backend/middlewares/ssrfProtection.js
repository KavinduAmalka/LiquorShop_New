import { URL } from 'url';
import { appLogger, securityLogger } from '../confligs/logger.js';
import { getSSRFConfig } from '../confligs/security.js';

/**
 * SSRF Protection Middleware
 * Protects against Server-Side Request Forgery attacks
 */

// Whitelist of allowed schemes
const ALLOWED_SCHEMES = ['http', 'https'];

// Blocked ports for security
const BLOCKED_PORTS = [
  22,   // SSH
  23,   // Telnet
  25,   // SMTP
  53,   // DNS
  110,  // POP3
  143,  // IMAP
  993,  // IMAPS
  995,  // POP3S
  1433, // SQL Server
  3306, // MySQL
  3389, // RDP
  5432, // PostgreSQL
  6379, // Redis
  27017 // MongoDB
];

/**
 * Check if an IP address is in a private network range
 */
function isPrivateNetwork(ip) {
  // For now, we'll do basic checks for common private ranges
  // IPv4 private ranges
  if (ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31) ||
      ip.startsWith('127.') ||
      ip.startsWith('169.254.')) {
    return true;
  }
  
  // IPv6 private ranges (basic check)
  if (ip === '::1' || ip.startsWith('fc') || ip.startsWith('fe80')) {
    return true;
  }
  
  return false;
}

/**
 * Validate URL for SSRF protection
 */
export function validateUrl(urlString, context = 'unknown') {
  try {
    const url = new URL(urlString);
    const config = getSSRFConfig();
    
    // Check scheme
    if (!ALLOWED_SCHEMES.includes(url.protocol.slice(0, -1))) {
      securityLogger.warn('SSRF attempt blocked - invalid scheme', {
        url: urlString,
        scheme: url.protocol,
        context,
        timestamp: new Date().toISOString()
      });
      return {
        valid: false,
        reason: 'Invalid URL scheme'
      };
    }
    
    // Extract hostname and port
    const hostname = url.hostname.toLowerCase();
    const port = url.port || (url.protocol === 'https:' ? 443 : 80);
    
    // Check for blocked ports
    if (BLOCKED_PORTS.includes(parseInt(port))) {
      securityLogger.warn('SSRF attempt blocked - blocked port', {
        url: urlString,
        hostname,
        port,
        context,
        timestamp: new Date().toISOString()
      });
      return {
        valid: false,
        reason: 'Port not allowed'
      };
    }
    
    // Check if hostname is in whitelist
    const isAllowedDomain = config.allowedDomains.some(domain => {
      if (domain === hostname) return true;
      // Allow subdomains
      if (hostname.endsWith('.' + domain)) return true;
      return false;
    });
    
    if (!isAllowedDomain) {
      securityLogger.warn('SSRF attempt blocked - domain not whitelisted', {
        url: urlString,
        hostname,
        allowedDomains: config.allowedDomains,
        context,
        timestamp: new Date().toISOString()
      });
      return {
        valid: false,
        reason: 'Domain not whitelisted'
      };
    }
    
    // Check for private network access
    if (!config.allowPrivateNetworks && isPrivateNetwork(hostname)) {
      securityLogger.warn('SSRF attempt blocked - private network access', {
        url: urlString,
        hostname,
        context,
        timestamp: new Date().toISOString()
      });
      return {
        valid: false,
        reason: 'Private network access not allowed'
      };
    }
    
    return {
      valid: true,
      sanitized: urlString
    };
    
  } catch (error) {
    securityLogger.error('URL validation error', {
      url: urlString,
      error: error.message,
      context,
      timestamp: new Date().toISOString()
    });
    return {
      valid: false,
      reason: 'Invalid URL format'
    };
  }
}

/**
 * Validate Origin header for SSRF protection
 * Used specifically for Stripe callback URLs
 */
export function validateOrigin(origin, req) {
  // Get the real client IP
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  if (!origin) {
    securityLogger.warn('Missing origin header in request', {
      url: req.originalUrl,
      method: req.method,
      ip: clientIP,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    return {
      valid: false,
      reason: 'Origin header missing'
    };
  }
  
  const validation = validateUrl(origin, 'origin-header');
  
  if (!validation.valid) {
    securityLogger.warn('Invalid origin header detected', {
      origin,
      reason: validation.reason,
      url: req.originalUrl,
      method: req.method,
      ip: clientIP,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  } else {
    securityLogger.info('Origin validated successfully', {
      origin,
      url: req.originalUrl,
      ip: clientIP,
      timestamp: new Date().toISOString()
    });
  }
  
  return validation;
}

/**
 * Middleware to validate Origin headers
 */
export const originValidationMiddleware = (req, res, next) => {
  // Only validate origin for specific endpoints that use it
  const shouldValidateOrigin = req.originalUrl.includes('/stripe') || 
                               req.originalUrl.includes('/payment') ||
                               req.originalUrl.includes('/callback');
  
  if (shouldValidateOrigin && req.headers.origin) {
    const validation = validateOrigin(req.headers.origin, req);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid origin',
        error: validation.reason
      });
    }
  }
  
  next();
};

/**
 * Get safe origin URL for external service callbacks
 */
export function getSafeOrigin(req) {
  const origin = req.headers.origin;
  const validation = validateOrigin(origin, req);
  
  if (validation.valid) {
    return validation.sanitized;
  }
  
  // Fallback to environment-based allowed origins
  const config = getSSRFConfig();
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'development') {
    return 'http://localhost:5173';
  } else {
    // Return localhost for non-production environments
    return 'http://localhost:5173';
  }
}

/**
 * URL parameter validation middleware
 * Prevents SSRF through URL parameters
 */
export const urlParameterValidation = (req, res, next) => {
  const sensitiveParams = ['url', 'callback', 'redirect', 'endpoint', 'webhook', 'return_url', 'success_url', 'cancel_url'];
  
  // Check query parameters
  for (const param of sensitiveParams) {
    if (req.query[param]) {
      const validation = validateUrl(req.query[param], `query-param-${param}`);
      if (!validation.valid) {
        securityLogger.warn('SSRF attempt through query parameter', {
          parameter: param,
          value: req.query[param],
          reason: validation.reason,
          url: req.originalUrl,
          ip: req.ip,
          timestamp: new Date().toISOString()
        });
        return res.status(400).json({
          success: false,
          message: 'Invalid URL parameter',
          parameter: param
        });
      }
    }
  }
  
  // Check body parameters
  if (req.body && typeof req.body === 'object') {
    for (const param of sensitiveParams) {
      if (req.body[param]) {
        const validation = validateUrl(req.body[param], `body-param-${param}`);
        if (!validation.valid) {
          securityLogger.warn('SSRF attempt through body parameter', {
            parameter: param,
            value: req.body[param],
            reason: validation.reason,
            url: req.originalUrl,
            ip: req.ip,
            timestamp: new Date().toISOString()
          });
          return res.status(400).json({
            success: false,
            message: 'Invalid URL parameter',
            parameter: param
          });
        }
      }
    }
  }
  
  next();
};

export default {
  validateUrl,
  validateOrigin,
  getSafeOrigin,
  originValidationMiddleware,
  urlParameterValidation
};
