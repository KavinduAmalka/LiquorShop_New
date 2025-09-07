// Enhanced security monitoring implementation for A09 - Security Logging and Monitoring
import { logSecurityEvent, logSecurityAlert, logSecurityThreat, logAuthEvent, logAuditEvent } from '../confligs/logger.js';

// Security event types
export const SECURITY_EVENTS = {
  INJECTION_ATTEMPT: 'injection_attempt',
  AUTHENTICATION_FAILURE: 'authentication_failure',
  SUSPICIOUS_REQUEST: 'suspicious_request',
  DIRECTORY_TRAVERSAL: 'directory_traversal',
  XSS_ATTEMPT: 'xss_attempt',
  BRUTE_FORCE: 'brute_force',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded'
};

// In-memory storage for security events and suspicious IPs
const securityEvents = new Map();
const suspiciousIPs = new Set();

// Log security events with enhanced details
export const logSecurityEventLegacy = (eventType, details = {}, req = {}) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  
  const event = {
    eventType,
    timestamp: new Date().toISOString(),
    ip,
    userAgent: req.get?.('User-Agent') || 'unknown',
    url: req.originalUrl || req.url || 'unknown',
    method: req.method || 'unknown',
    userId: req.user?.id || req.user?.sub || 'anonymous',
    ...details
  };

  // Store in memory
  if (!securityEvents.has(ip)) {
    securityEvents.set(ip, []);
  }
  securityEvents.get(ip).push(event);

  // Keep only last 100 events per IP
  if (securityEvents.get(ip).length > 100) {
    securityEvents.get(ip).shift();
  }

  // Log to Winston logger based on severity
  const severity = details?.severity || 'medium';
  if (severity === 'high' || eventType === SECURITY_EVENTS.INJECTION_ATTEMPT) {
    logSecurityThreat(eventType, event);
  } else if (severity === 'medium' || eventType === SECURITY_EVENTS.AUTHENTICATION_FAILURE) {
    logSecurityAlert(eventType, event);
  } else {
    logSecurityEvent(eventType, event);
  }

  // Log to console in development for backward compatibility
  if (process.env.NODE_ENV !== 'production') {
    console.warn('🚨 SECURITY EVENT:', event);
  }

  // Check for suspicious patterns
  checkSuspiciousActivity(ip);
};

// Check for suspicious activity patterns
const checkSuspiciousActivity = (ip) => {
  const events = securityEvents.get(ip) || [];
  const recentEvents = events.filter(event => 
    Date.now() - new Date(event.timestamp).getTime() < 15 * 60 * 1000 // Last 15 minutes
  );

  // Mark IP as suspicious if too many security events
  if (recentEvents.length >= 10) { // Increased threshold to be less aggressive
    suspiciousIPs.add(ip);
    logSecurityAlert('suspicious_ip_detected', {
      ip,
      eventCount: recentEvents.length,
      timeWindow: '15 minutes'
    });
  }
};

// Security monitoring middleware - comprehensive logging
export const securityMonitoring = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  const originalJson = res.json;

  // Capture request details
  const requestDetails = {
    method: req.method,
    url: req.originalUrl || req.url,
    userAgent: req.get('User-Agent') || 'unknown',
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    timestamp: new Date().toISOString(),
    headers: {
      contentType: req.get('Content-Type'),
      authorization: req.get('Authorization') ? 'present' : 'absent',
      origin: req.get('Origin'),
      referer: req.get('Referer')
    }
  };

  // Add user context if available
  if (req.user) {
    requestDetails.userId = req.user.id || req.user.sub;
    requestDetails.userType = req.user.userType || 'user';
  }

  // Log security-sensitive requests
  const sensitiveEndpoints = [
    '/api/user/login', '/api/user/register', '/api/auth0-user',
    '/api/seller/login', '/api/seller/register',
    '/api/user/profile', '/api/seller/profile',
    '/api/order', '/api/cart', '/api/address'
  ];

  const isSensitiveEndpoint = sensitiveEndpoints.some(endpoint => 
    req.originalUrl?.startsWith(endpoint)
  );

  if (isSensitiveEndpoint) {
    logSecurityEvent('sensitive_endpoint_access', {
      ...requestDetails,
      endpoint: req.originalUrl
    });
  }

  // Monitor for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection attempts
    /\$where/i, // NoSQL injection
    /eval\(/i, // Code injection
    /javascript:/i, // JavaScript protocol
    /data:.*base64/i // Data URI schemes
  ];

  const requestString = JSON.stringify({
    url: req.originalUrl,
    query: req.query,
    body: req.body
  });

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(requestString)) {
      logSecurityAlert('suspicious_pattern_detected', {
        ...requestDetails,
        pattern: pattern.toString(),
        matchedContent: requestString.match(pattern)?.[0]
      });
    }
  });

  // Override response methods to log responses
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log response details for security-sensitive endpoints
    if (isSensitiveEndpoint) {
      logSecurityEvent('sensitive_endpoint_response', {
        ...requestDetails,
        statusCode: res.statusCode,
        responseTime,
        responseSize: Buffer.byteLength(data || '', 'utf8')
      });
    }

    // Log security alerts for error responses
    if (res.statusCode >= 400) {
      const logFunction = res.statusCode >= 500 ? logSecurityThreat : logSecurityAlert;
      
      logFunction('error_response', {
        ...requestDetails,
        statusCode: res.statusCode,
        responseTime,
        errorType: res.statusCode >= 500 ? 'server_error' : 'client_error'
      });
    }

    return originalSend.call(this, data);
  };

  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    if (isSensitiveEndpoint) {
      logSecurityEvent('sensitive_endpoint_json_response', {
        ...requestDetails,
        statusCode: res.statusCode,
        responseTime
      });
    }

    return originalJson.call(this, data);
  };

  next();
};

// Middleware to log authentication events
export const logAuthActivity = (eventType, additionalDetails = {}) => {
  return (req, res, next) => {
    const authDetails = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      ...additionalDetails
    };

    if (req.user) {
      authDetails.userId = req.user.id || req.user.sub;
      authDetails.userType = req.user.userType || 'user';
    }

    logAuthEvent(eventType, authDetails);
    next();
  };
};

// Middleware to log user actions for audit trail
export const logUserAction = (action, getDetails = () => ({})) => {
  return (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    const logAction = () => {
      const auditDetails = {
        action,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode,
        ...getDetails(req, res)
      };

      if (req.user) {
        auditDetails.userId = req.user.id || req.user.sub;
        auditDetails.userType = req.user.userType || 'user';
      }

      // Only log successful actions (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAuditEvent(action, auditDetails);
      }
    };

    res.send = function(data) {
      logAction();
      return originalSend.call(this, data);
    };

    res.json = function(data) {
      logAction();
      return originalJson.call(this, data);
    };

    next();
  };
};

// Request anomaly detection
export const detectAnomalies = (req, res, next) => {
  const anomalies = [];

  // Check for unusually large requests
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 50 * 1024 * 1024) {
    anomalies.push('Large request size');
  }

  // Check for suspicious user agents
  const userAgent = req.get('User-Agent') || '';
  const suspiciousAgents = [
    'sqlmap', 'nikto', 'nmap', 'masscan', 'zmap', 'gobuster', 'dirb'
  ];
  
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    anomalies.push('Suspicious user agent');
  }

  // Log anomalies
  if (anomalies.length > 0) {
    logSecurityAlert(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
      anomalies,
      userAgent,
      ip: req.ip,
      url: req.originalUrl
    });
  }

  next();
};

// Enhanced request validation
export const validateRequest = (req, res, next) => {
  // Check for common attack patterns in URL
  const maliciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempt
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /vbscript:/i, // VBScript injection
    /onload=/i, // Event handler injection
    /eval\(/i, // Code injection
    /exec\(/i, // Command injection
    /system\(/i, // System command injection
  ];

  const url = req.url.toLowerCase();
  for (const pattern of maliciousPatterns) {
    if (pattern.test(url)) {
      logSecurityEventLegacy(SECURITY_EVENTS.INJECTION_ATTEMPT, {
        pattern: pattern.toString(),
        url: req.url,
        severity: 'high'
      }, req);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid request detected'
      });
    }
  }

  // Validate origin for POST requests
  const origin = req.get('Origin');
  if (req.method === 'POST' && origin && 
      !origin.includes('localhost:5173')) {
    logSecurityAlert('suspicious_origin', {
      reason: 'Suspicious origin detected',
      origin,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
  }

  next();
};

// Get security statistics
export const getSecurityStats = (req, res) => {
  const stats = {
    totalSuspiciousIPs: suspiciousIPs.size,
    suspiciousIPs: Array.from(suspiciousIPs),
    totalEvents: Array.from(securityEvents.values()).reduce((sum, events) => sum + events.length, 0),
    eventsByType: {}
  };

  // Count events by type
  for (const events of securityEvents.values()) {
    for (const event of events) {
      stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1;
    }
  }

  logAuditEvent('security_stats_accessed', {
    adminId: req.user?.id || req.user?.sub,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    stats
  });
};

// Clear security events (admin function)
export const clearSecurityLogs = (req, res) => {
  securityEvents.clear();
  suspiciousIPs.clear();
  
  logAuditEvent('security_logs_cleared', {
    adminId: req.user?.id || req.user?.sub,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.json({
    success: true,
    message: 'Security logs cleared'
  });
};

// Export default
export default securityMonitoring;
