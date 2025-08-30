# Auth0 OIDC Integration Setup Guide

## Overview
This implementation replaces the traditional username/password authentication with Auth0 OIDC authentication for users only. Seller authentication remains unchanged.

## Prerequisites
- Auth0 account (free tier available)
- Node.js and npm installed
- Backend and frontend running

## Auth0 Setup Steps

### 1. Create Auth0 Application

1. Go to [auth0.com](https://auth0.com) and create a free account
2. In the Auth0 Dashboard, go to **Applications**
3. Click **Create Application**
4. Choose **Single Page Application** and give it a name (e.g., "Liquor Shop")
5. Click **Create**

### 2. Configure Application Settings

In your Auth0 application settings:

1. **Basic Information**:
   - Copy the **Domain** and **Client ID** (you'll need these)

2. **Application URIs**:
   - **Allowed Callback URLs**: `http://localhost:5173`
   - **Allowed Logout URLs**: `http://localhost:5173`  
   - **Allowed Web Origins**: `http://localhost:5173`

3. **Advanced Settings > Grant Types**:
   - Ensure "Authorization Code" and "Refresh Token" are checked

4. Click **Save Changes**

### 3. Create Auth0 API

1. Go to **Applications > APIs** in Auth0 dashboard
2. Click **Create API**
3. Fill in:
   - **Name**: `Liquor Shop API`
   - **Identifier**: `https://liquor-shop-api` (this will be your audience)
   - **Signing Algorithm**: `RS256`
4. Click **Create**

### 4. Update Environment Variables

**Frontend (.env)**:
```env
VITE_CURRENCY = 'Rs.'
VITE_BACKEND_URL='http://localhost:4000'

# Auth0 Configuration - Replace with your actual values
VITE_AUTH0_DOMAIN=your-actual-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-actual-client-id
VITE_AUTH0_AUDIENCE=https://liquor-shop-api
```

**Backend (.env)**:
```env
# Add these to your existing .env file
AUTH0_DOMAIN=your-actual-domain.auth0.com
AUTH0_AUDIENCE=https://liquor-shop-api
```

## How It Works

### Authentication Flow
1. User clicks "Login" button
2. Redirected to Auth0 login page
3. After successful authentication, user is redirected back
4. Frontend receives Auth0 user token
5. Token is sent to backend for verification
6. Backend creates/updates user in database
7. User is logged in and can access protected routes

### Key Changes Made

#### Backend Changes:
- **User Model**: Added `auth0Id`, `authProvider` fields, made `password` optional
- **Auth0 Middleware**: New middleware for token verification (`authAuth0.js`)
- **Auth0 Controllers**: New controllers for Auth0 user management
- **Routes**: Updated all protected routes to use Auth0 authentication
- **New Routes**: Added `/api/auth0-user/` endpoints

#### Frontend Changes:
- **Auth0 Provider**: Wraps entire app with Auth0 context
- **New Login Component**: Auth0-based login with OIDC
- **Updated Context**: New context handling Auth0 authentication state
- **Updated Components**: All components now use Auth0 context

### Protected Routes
All user-related routes now require Auth0 authentication:
- Cart operations
- Order placement
- User profile
- Address management

### Database Schema
Users now have these additional fields:
- `auth0Id`: Unique Auth0 user identifier
- `authProvider`: 'auth0' or 'local' 
- `password`: Optional (only for legacy users)

## Testing

### 1. Start the Application
```bash
# Backend
cd backend
npm run server

# Frontend  
cd frontend
npm run dev
```

### 2. Test Authentication
1. Go to `http://localhost:5173`
2. Click "Login" button
3. Should redirect to Auth0 login page
4. Login with any provider (Google, email/password, etc.)
5. Should redirect back and be logged in
6. Test cart functionality, profile updates, etc.

### 3. Test Protected Routes
- Add items to cart (requires auth)
- Place an order (requires auth)
- View orders (requires auth)
- Update profile (requires auth)

## Features

### ✅ Implemented
- Auth0 OIDC authentication
- JWT token verification
- User profile management
- Cart persistence across sessions
- Order management
- Logout functionality
- Error handling

### ✅ Maintained
- Seller authentication (unchanged)
- All existing functionality
- Database compatibility
- API endpoints

## Security Features

1. **JWT Verification**: Backend verifies Auth0 JWT tokens
2. **HTTPS in Production**: Auth0 enforces HTTPS in production
3. **Token Refresh**: Automatic token refresh handled by Auth0 SDK
4. **Secure Cookies**: Session management through Auth0
5. **CORS Protection**: Configured for specific origins

## Troubleshooting

### Common Issues:

1. **"Invalid token" errors**:
   - Check Auth0 domain and audience in environment variables
   - Ensure API identifier matches audience

2. **Redirect loops**:
   - Verify callback URLs in Auth0 dashboard
   - Check for correct redirect URI configuration

3. **CORS errors**:
   - Ensure frontend origin is in "Allowed Web Origins"
   - Check backend CORS configuration

4. **User not found errors**:
   - Check database connection
   - Verify Auth0 callback endpoint is working

### Debug Tips:
- Check browser console for errors
- Monitor Auth0 logs in dashboard
- Check backend logs for JWT verification issues
- Use Auth0 debugger extension

## Production Deployment

When deploying to production:

1. Update Auth0 URLs with production domains
2. Set `NODE_ENV=production` in backend
3. Use HTTPS for all Auth0 callbacks
4. Update CORS origins for production frontend
5. Set up proper environment variables on hosting platform

## Migration Notes

- Existing traditional users are not affected
- New users will only use Auth0
- Database maintains backward compatibility
- Seller authentication remains unchanged
