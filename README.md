# LiquorShop - E-commerce Web Application

![Wine Glasses](frontend/public/wine-glasses.png)

## 📖 Overview

LiquorShop is a modern, secure e-commerce web application built with React.js (frontend) and Node.js/Express.js (backend). The application features dual authentication systems - Auth0 OIDC for customers and traditional JWT authentication for sellers. It includes comprehensive security implementations following OWASP Top 10 guidelines.

## 🚀 Features

- **Dual Authentication System**
  - Auth0 OIDC integration for customer authentication
  - JWT-based authentication for sellers
- **Product Management**
  - Product catalog with categories (Beer, Wine, Gin, Champagne, etc.)
  - Image upload with Cloudinary integration
  - Inventory management
- **Shopping Cart & Orders**
  - Add to cart functionality
  - Order management and tracking
  - Stripe payment integration
- **Address Management**
  - Multiple address support
  - Address validation
- **Security Features**
  - OWASP Top 10 compliance
  - Input validation and sanitization
  - Rate limiting
  - Security logging and monitoring
  - SSRF protection
  - Helmet.js security headers

## 🛠️ Technology Stack

### Frontend
- **React.js 19.1.0** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Auth0 React SDK** - Authentication
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js 5.1.0** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Auth0** - OIDC authentication
- **Stripe** - Payment processing
- **Cloudinary** - Image storage
- **Winston** - Logging
- **Helmet.js** - Security headers
- **Joi** - Input validation

## 📋 Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Auth0 account
- Stripe account
- Cloudinary account

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/KavinduAmalka/LiquorShop_New.git
cd LiquorShop_New
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

**⚠️ IMPORTANT: Remove all sensitive data before deployment**

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
ENABLE_HTTPS=false

# Database Configuration
MONGODB_URI=mongodb://localhost:27017
# Alternative for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# Seller Credentials (Change these immediately)
SELLER_EMAIL=admin@liquorshop.com
SELLER_PASSWORD=your_secure_admin_password

# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Logging Configuration (Optional)
LOG_LEVEL=info

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
FRONTEND_DOMAIN=localhost
```

#### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Backend API Configuration
VITE_BACKEND_URL=http://localhost:4000

# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://your-api-identifier

# Currency Configuration
VITE_CURRENCY=$
```

### 4. Database Setup

The application uses MongoDB with the following collections that will be automatically created:

#### Database Schema

**Database Name:** `TheBottleHouse`

**Collections:**

1. **users** - Customer accounts
   ```javascript
   {
     username: String (required for local auth),
     name: String (required),
     email: String (required, unique),
     password: String (hashed, optional for Auth0 users),
     contactNumber: String,
     authProvider: String ('local' or 'auth0'),
     profileComplete: Boolean,
     auth0Id: String (for Auth0 users),
     createdAt: Date,
     updatedAt: Date
   }
   ```

2. **products** - Product catalog
   ```javascript
   {
     name: String (required),
     description: Array (required),
     price: Number (required),
     offerPrice: Number (required),
     image: Array (required),
     category: String (required),
     inStock: Boolean (default: true),
     createdAt: Date,
     updatedAt: Date
   }
   ```

3. **orders** - Customer orders
   ```javascript
   {
     userId: String (required, ref: 'user'),
     items: [{
       product: String (required, ref: 'product'),
       quantity: Number (required)
     }],
     amount: Number (required),
     address: String (required, ref: 'address'),
     status: String (default: 'Order Placed'),
     paymentType: String (required),
     isPaid: Boolean (default: false),
     purchaseDate: Date (required),
     preferredDeliveryTime: String (required),
     createdAt: Date,
     updatedAt: Date
   }
   ```

4. **addresses** - Customer addresses
   ```javascript
   {
     userId: String (required),
     firstName: String (required),
     lastName: String (required),
     email: String (required),
     street: String (required),
     city: String (required),
     state: String (required),
     country: String (required),
     zipCode: Number (required),
     phone: String (required)
   }
   ```

#### Database Creation Script

The application uses MongoDB (NoSQL). The database and collections will be automatically created when the application starts. However, you can run the following MongoDB commands to manually create the database:

```javascript
// Connect to MongoDB
use TheBottleHouse;

// Create collections (optional - will be created automatically)
db.createCollection("users");
db.createCollection("products");
db.createCollection("orders");
db.createCollection("addresses");

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true, sparse: true });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "name": "text", "description": "text" });
db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "status": 1 });
db.addresses.createIndex({ "userId": 1 });
```

### 5. Third-Party Service Configuration

#### Auth0 Setup
1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a Single Page Application
3. Configure callback URLs: `http://localhost:5173`
4. Configure logout URLs: `http://localhost:5173`
5. Create an API in Auth0 Dashboard
6. Copy Domain, Client ID, and API Identifier to your environment variables

Detailed Auth0 setup instructions are available in [`AUTH0_SETUP_GUIDE.md`](AUTH0_SETUP_GUIDE.md)

#### Stripe Setup
1. Create a Stripe account
2. Get your test API keys from the Stripe Dashboard
3. Set up webhooks for order confirmation
4. Copy keys to environment variables

#### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Copy credentials to environment variables

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run server
   # or for HTTPS (requires certificates)
   npm run https
   ```
   The backend will run on `http://localhost:4000`

2. **Start the Frontend Development Server:**
   ```bash
   cd frontend
   npm run dev
   # or for HTTPS
   npm run https
   ```
   The frontend will run on `http://localhost:5173`

### Production Mode

1. **Build the Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the Backend:**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

## 🐳 Docker Deployment (Optional)

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

Create a `docker-compose.yml` in the root directory:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017
    depends_on:
      - mongo
    
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 📁 Project Structure

```
LiquorShop_New/
├── backend/
│   ├── config/              # Environment configurations
│   ├── confligs/            # Database, security, logging configs
│   ├── controllers/         # Route handlers
│   ├── middlewares/         # Authentication, validation, security
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── logs/                # Application logs
│   ├── certs/               # SSL certificates (for HTTPS)
│   └── server.js            # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Context providers
│   │   └── assets/          # Static assets
│   └── public/              # Public assets
├── docs/                    # Documentation
└── reports/                 # Security reports
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test-https  # Test HTTPS configuration
npm run audit       # Security audit
```

### Frontend Testing
```bash
cd frontend
npm run lint         # ESLint checks
npm run audit        # Security audit
```

## 📚 API Endpoints

### Authentication
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/seller/login` - Seller login
- `POST /api/auth0-user/*` - Auth0 user endpoints

### Products
- `GET /api/product/list` - Get all products
- `POST /api/product/add` - Add new product (seller only)
- `POST /api/product/remove` - Remove product (seller only)

### Cart & Orders
- `POST /api/cart/add` - Add to cart
- `POST /api/cart/update` - Update cart
- `GET /api/cart/get` - Get user cart
- `POST /api/order/place` - Place order
- `POST /api/order/verify` - Verify payment

### Address Management
- `POST /api/address/add` - Add address
- `GET /api/address/list` - Get user addresses

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in environment variables
   - Verify network connectivity for cloud databases

2. **Auth0 Authentication Issues**
   - Verify Auth0 configuration in dashboard
   - Check callback URLs
   - Ensure environment variables are correct

3. **CORS Errors**
   - Verify allowed origins in backend configuration
   - Check if frontend URL matches CORS settings

4. **SSL Certificate Issues**
   - Generate new certificates using `npm run generate-certs`
   - Ensure certificates are in the correct directory

### Log Files

Application logs are stored in `backend/logs/`:
- `app-YYYY-MM-DD.log` - General application logs
- `error-YYYY-MM-DD.log` - Error logs
- `security-YYYY-MM-DD.log` - Security events
- `audit-YYYY-MM-DD.log` - Audit trail

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## ⚠️ Important Security Notes

- **Never commit sensitive data** (API keys, passwords, secrets) to version control
- **Change default seller credentials** immediately after setup
- **Use strong JWT secrets** (minimum 32 characters)
- **Enable HTTPS in production** environments
- **Regularly update dependencies** for security patches
- **Monitor security logs** for suspicious activities

## 📝 Environment Variables Checklist

Before deployment, ensure all these environment variables are properly configured:

### Backend (.env)
- [ ] `MONGODB_URI` - Database connection string
- [ ] `JWT_SECRET` - Strong secret key
- [ ] `SELLER_EMAIL` - Admin email
- [ ] `SELLER_PASSWORD` - Secure admin password
- [ ] `AUTH0_DOMAIN` - Auth0 domain
- [ ] `AUTH0_AUDIENCE` - Auth0 API identifier
- [ ] `CLOUDINARY_*` - Cloudinary credentials
- [ ] `STRIPE_*` - Stripe API keys

### Frontend (.env)
- [ ] `VITE_BACKEND_URL` - Backend API URL
- [ ] `VITE_AUTH0_DOMAIN` - Auth0 domain
- [ ] `VITE_AUTH0_CLIENT_ID` - Auth0 client ID
- [ ] `VITE_AUTH0_AUDIENCE` - Auth0 API identifier

---

**Built with ❤️ by the LiquorShop Team**
