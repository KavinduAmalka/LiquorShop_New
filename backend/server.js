import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

const app = express();
const port = process.env.PORT || 4000;

// Log server startup
appLogger.info('Starting LiquorShop Backend Server', {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString()
});

await connectDB();

//Allow multiple origins
const allowedOrigins = ['http://localhost:5173', 'https://liquar-shop.vercel.app'];

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

app.listen(port, () => {
   console.log(`Server is running on http://localhost: ${port}`);
   appLogger.info('Server started successfully', {
     port,
     environment: process.env.NODE_ENV || 'development'
   });
});