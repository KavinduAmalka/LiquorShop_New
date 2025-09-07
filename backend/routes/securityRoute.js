import express from 'express';
import { getSecurityStats, clearSecurityLogs } from '../middlewares/securityMonitoring.js';
import authSeller from '../middlewares/authSeller.js';
import { securityLogger, auditLogger } from '../confligs/logger.js';
import fs from 'fs';
import path from 'path';

const securityRouter = express.Router();

// Security monitoring endpoints (admin only)
securityRouter.get('/stats', authSeller, getSecurityStats);
securityRouter.post('/clear-logs', authSeller, clearSecurityLogs);

// Get SSRF protection status
securityRouter.get('/ssrf-status', authSeller, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logPath = path.join(process.cwd(), 'logs', `security-${today}.log`);
    
    let ssrfAttempts = 0;
    let blockedRequests = 0;
    
    if (fs.existsSync(logPath)) {
      const logs = fs.readFileSync(logPath, 'utf8');
      const logLines = logs.split('\n').filter(line => line.trim());
      
      logLines.forEach(line => {
        if (line.includes('SSRF attempt')) {
          ssrfAttempts++;
        }
        if (line.includes('blocked')) {
          blockedRequests++;
        }
      });
    }
    
    res.json({
      success: true,
      status: {
        ssrfAttemptsToday: ssrfAttempts,
        blockedRequestsToday: blockedRequests,
        protectionActive: true,
        allowedDomains: ['your-new-frontend-domain.vercel.app', 'api.stripe.com', 'api.cloudinary.com', 'localhost'],
        lastCheck: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manual security test endpoint (admin only)
securityRouter.post('/test-ssrf', authSeller, async (req, res) => {
  const { testUrl } = req.body;
  
  if (!testUrl) {
    return res.status(400).json({ success: false, message: 'Test URL is required' });
  }
  
  auditLogger.info('Manual SSRF test initiated', {
    testUrl,
    adminIP: req.ip,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Import here to avoid circular dependency
    const { validateUrl } = await import('../middlewares/ssrfProtection.js');
    const result = validateUrl(testUrl, 'manual-test');
    
    securityLogger.info('Manual SSRF test completed', {
      testUrl,
      result,
      adminIP: req.ip,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      test: {
        url: testUrl,
        valid: result.valid,
        reason: result.reason || 'URL is valid',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    securityLogger.error('SSRF test failed', {
      testUrl,
      error: error.message,
      adminIP: req.ip,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ success: false, message: error.message });
  }
});

export default securityRouter;
