import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');

// Custom format for security logs
const securityLogFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
      environment: process.env.NODE_ENV || 'development'
    });
  })
);

// Application logger for general events
const appLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: securityLogFormat,
  defaultMeta: { service: 'liquorshop-backend' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      silent: process.env.NODE_ENV === 'test'
    }),

    // File transport for all logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'info'
    }),

    // Error logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error'
    })
  ],
  // Don't exit on handled exceptions
  exitOnError: false
});

// Security-specific logger for security events
const securityLogger = winston.createLogger({
  level: 'info',
  format: securityLogFormat,
  defaultMeta: { 
    service: 'liquorshop-security',
    category: 'security'
  },
  transports: [
    // Console for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      silent: process.env.NODE_ENV === 'test'
    }),

    // Security events log
    new DailyRotateFile({
      filename: path.join(logsDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d', // Keep security logs longer
      level: 'info'
    }),

    // Security alerts (warnings and errors)
    new DailyRotateFile({
      filename: path.join(logsDir, 'security-alerts-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
      level: 'warn'
    })
  ],
  exitOnError: false
});

// Audit logger for user actions
const auditLogger = winston.createLogger({
  level: 'info',
  format: securityLogFormat,
  defaultMeta: { 
    service: 'liquorshop-audit',
    category: 'audit'
  },
  transports: [
    // Audit trail log
    new DailyRotateFile({
      filename: path.join(logsDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '365d', // Keep audit logs for 1 year
      level: 'info'
    })
  ],
  exitOnError: false
});

// Helper functions for structured logging
export const logSecurityEvent = (eventType, details = {}) => {
  securityLogger.info('Security Event', {
    eventType,
    ...details,
    timestamp: new Date().toISOString()
  });
};

export const logSecurityAlert = (alertType, details = {}) => {
  securityLogger.warn('Security Alert', {
    alertType,
    severity: 'medium',
    ...details,
    timestamp: new Date().toISOString()
  });
};

export const logSecurityThreat = (threatType, details = {}) => {
  securityLogger.error('Security Threat', {
    threatType,
    severity: 'high',
    ...details,
    timestamp: new Date().toISOString()
  });
};

export const logAuditEvent = (action, details = {}) => {
  auditLogger.info('Audit Event', {
    action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

export const logAuthEvent = (eventType, details = {}) => {
  const logLevel = eventType.includes('failed') || eventType.includes('blocked') ? 'warn' : 'info';
  securityLogger[logLevel]('Authentication Event', {
    eventType,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Export loggers
export { appLogger, securityLogger, auditLogger };
export default appLogger;
