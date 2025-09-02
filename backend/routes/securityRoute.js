import express from 'express';
import { getSecurityStats, clearSecurityLogs } from '../middlewares/securityMonitoring.js';
import authSeller from '../middlewares/authSeller.js';

const securityRouter = express.Router();

// Security monitoring endpoints (admin only)
securityRouter.get('/stats', authSeller, getSecurityStats);
securityRouter.post('/clear-logs', authSeller, clearSecurityLogs);

export default securityRouter;
