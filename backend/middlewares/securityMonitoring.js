import fs from 'fs/promises';
import path from 'path';

// Security event types
const SECURITY_EVENTS = {
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INJECTION_ATTEMPT: 'INJECTION_ATTEMPT',
  INVALID_FILE_UPLOAD: 'INVALID_FILE_UPLOAD',
  SUSPICIOUS_REQUEST: 'SUSPICIOUS_REQUEST',
  AUTHENTICATION_FAILURE: 'AUTHENTICATION_FAILURE',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS'
};

// In-memory security event store (in production, use Redis or database)
const securityEvents = new Map();
const suspiciousIPs = new Set();

// Log security events
export const logSecurityEvent = async (eventType, details, req = null) => {
  const timestamp = new Date().toISOString();
  const ip = req?.ip || 'unknown';
  const userAgent = req?.get('User-Agent') || 'unknown';
  const url = req?.url || 'unknown';
  
  const event = {
    timestamp,
    eventType,
    ip,
    userAgent,
    url,
    details
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

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.warn('🚨 SECURITY EVENT:', event);
  }

  // In production, you would send this to a logging service
  try {
    await logToFile(event);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }

  // Check for suspicious patterns
  checkSuspiciousActivity(ip);
};

// Write security events to file
const logToFile = async (event) => {
  const logDir = path.join(process.cwd(), 'logs');
  const logFile = path.join(logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
  
  try {
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(logFile, JSON.stringify(event) + '\n');
  } catch (error) {
    // Fail silently in case of file system issues
  }
};

// Check for suspicious activity patterns
const checkSuspiciousActivity = (ip) => {
  const events = securityEvents.get(ip) || [];
  const recentEvents = events.filter(event => 
    Date.now() - new Date(event.timestamp).getTime() < 15 * 60 * 1000 // Last 15 minutes
  );

  // Mark IP as suspicious if too many security events
  if (recentEvents.length >= 5) {
    suspiciousIPs.add(ip);
    console.warn(`🚨 IP ${ip} marked as suspicious due to repeated security events`);
  }
};

// Middleware to block suspicious IPs
export const blockSuspiciousIPs = (req, res, next) => {
  if (suspiciousIPs.has(req.ip)) {
    logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
      reason: 'IP blocked due to suspicious activity'
    }, req);
    
    return res.status(403).json({
      success: false,
      message: 'Access denied due to suspicious activity'
    });
  }
  next();
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
    'sqlmap', 'nikto', 'nmap', 'masscan', 'zmap', 'gobuster', 'dirb',
    'curl', 'wget', 'python-requests', 'script', 'bot'
  ];
  
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    anomalies.push('Suspicious user agent');
  }

  // Check for rapid requests from same IP
  const events = securityEvents.get(req.ip) || [];
  const recentRequests = events.filter(event => 
    Date.now() - new Date(event.timestamp).getTime() < 60000 // Last minute
  ).length;

  if (recentRequests > 30) {
    anomalies.push('Rapid requests detected');
  }

  // Log anomalies
  if (anomalies.length > 0) {
    logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
      anomalies,
      userAgent
    }, req);
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
      logSecurityEvent(SECURITY_EVENTS.INJECTION_ATTEMPT, {
        pattern: pattern.toString(),
        url: req.url
      }, req);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid request detected'
      });
    }
  }

  // Validate common headers
  const referer = req.get('Referer');
  const origin = req.get('Origin');
  
  // Check for CSRF attempts (basic check)
  if (req.method === 'POST' && origin && !origin.includes('localhost:5173') && !origin.includes('liquar-shop.vercel.app')) {
    logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_REQUEST, {
      reason: 'Suspicious origin',
      origin
    }, req);
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

  res.json({
    success: true,
    stats
  });
};

// Clear security events (admin function)
export const clearSecurityLogs = (req, res) => {
  securityEvents.clear();
  suspiciousIPs.clear();
  
  res.json({
    success: true,
    message: 'Security logs cleared'
  });
};

export { SECURITY_EVENTS };
