const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  const configs = {
    development: {
      allowedOrigins: [
        'http://localhost:5173',
        'https://localhost:5173'
      ],
      allowedDomains: ['localhost', 'api.stripe.com', 'api.cloudinary.com']
    },
    production: {
      allowedOrigins: [
        'http://localhost:5173', // Keep for testing
        'https://localhost:5173',
        process.env.FRONTEND_URL || 'https://your-new-frontend-domain.vercel.app'
      ],
      allowedDomains: [
        'localhost',
        'api.stripe.com', 
        'api.cloudinary.com',
        process.env.FRONTEND_DOMAIN || 'your-new-frontend-domain.vercel.app'
      ]
    }
  };

  return configs[env] || configs.development;
};

module.exports = { getEnvironmentConfig };
