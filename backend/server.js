import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './confligs/db.js';
import { getSecurityConfig } from './confligs/security.js';
import { appLogger } from './confligs/logger.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import auth0UserRouter from './routes/auth0UserRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import './confligs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import securityRouter from './routes/securityRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';
import { sanitizeAll } from './middlewares/validation.js';
import { originValidationMiddleware, urlParameterValidation } from './middlewares/ssrfProtection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;
const enableHttps = process.env.ENABLE_HTTPS === 'true' && process.env.NODE_ENV === 'development';

// Log server startup
appLogger.info('Starting LiquorShop Backend Server', {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  httpsEnabled: enableHttps,
  timestamp: new Date().toISOString()
});

await connectDB();

//Allow multiple origins - update for HTTPS in development
const allowedOrigins = [
  'http://localhost:5173', 
  'https://localhost:5173',
  'https://your-new-frontend-domain.vercel.app'
];

app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

//Middleware configurations
app.use(express.json());
app.use(cookieParser());

// Security headers with Helmet.js (environment-specific configuration)
const securityConfig = getSecurityConfig();
app.use(helmet(securityConfig));

app.use(cors({
  origin: allowedOrigins, 
  credentials: true
}));

// Apply input sanitization to all routes (includes NoSQL injection protection)
app.use(sanitizeAll);

// Apply SSRF protection middleware
app.use(originValidationMiddleware);
app.use(urlParameterValidation);

app.get('/', (req, res) => res.send("API is working"));
app.use('/api/user', userRouter);
app.use('/api/auth0-user', auth0UserRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/security', securityRouter);

// Start server with HTTPS support
if (enableHttps) {
  try {
    // Load SSL certificates
    const privateKey = fs.readFileSync(path.join(__dirname, 'certs', 'localhost-key.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, 'certs', 'localhost.pem'), 'utf8');
    
    const credentials = { key: privateKey, cert: certificate };
    
    // Create HTTPS server
    const httpsServer = https.createServer(credentials, app);
    
    httpsServer.listen(port, () => {
      console.log(`🔒 HTTPS Server running on https://localhost:${port}`);
      appLogger.info('HTTPS Server started successfully', {
        port,
        protocol: 'HTTPS',
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    console.error('❌ Failed to start HTTPS server:', error.message);
    console.log('🔄 Falling back to HTTP server...');
    
    app.listen(port, () => {
      console.log(`🌐 HTTP Server running on http://localhost:${port}`);
      appLogger.info('HTTP Server started (HTTPS fallback)', {
        port,
        protocol: 'HTTP',
        environment: process.env.NODE_ENV || 'development'
      });
    });
  }
} else {
  app.listen(port, () => {
    console.log(`🌐 HTTP Server running on http://localhost:${port}`);
    appLogger.info('HTTP Server started successfully', {
      port,
      protocol: 'HTTP',
      environment: process.env.NODE_ENV || 'development'
    });
  });
}