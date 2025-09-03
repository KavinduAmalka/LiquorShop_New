// Security configuration based on environment
export const securityConfig = {
  development: {
    hsts: {
      maxAge: 0, // Disable HSTS in development
      includeSubDomains: false,
      preload: false
    },
    contentSecurityPolicy: false, // Disable CSP in development for easier debugging
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
  },
  
  production: {
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https:", "http:"],
        frameSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false, // Keep disabled for file uploads
    crossOriginResourcePolicy: false  // Keep disabled for API access
  }
};

export const getSecurityConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return securityConfig[env] || securityConfig.development;
};
