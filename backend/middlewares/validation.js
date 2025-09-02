import { body, validationResult, param, query } from 'express-validator';
import xss from 'xss';

// NoSQL injection patterns to detect
const noSQLInjectionPatterns = [
  /\$ne/gi, /\$gt/gi, /\$gte/gi, /\$lt/gi, /\$lte/gi, /\$in/gi, /\$nin/gi,
  /\$and/gi, /\$or/gi, /\$not/gi, /\$nor/gi, /\$exists/gi, /\$type/gi,
  /\$mod/gi, /\$regex/gi, /\$text/gi, /\$where/gi, /\$expr/gi, /\$jsonSchema/gi,
  /\$all/gi, /\$elemMatch/gi, /\$size/gi, /\$slice/gi, /\$meta/gi, /\$comment/gi
];

// Sanitize and check for NoSQL injection
const sanitizeAndValidate = (value) => {
  if (typeof value !== 'string') return value;
  
  // Check for NoSQL injection patterns
  for (const pattern of noSQLInjectionPatterns) {
    if (pattern.test(value)) {
      console.warn(`NoSQL injection attempt detected: ${value}`);
      return value.replace(pattern, '_BLOCKED_');
    }
  }
  
  // XSS sanitization
  return xss(value, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
};

// Recursively sanitize objects
const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return sanitizeAndValidate(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Don't allow keys with $ (potential MongoDB operators)
      if (key.startsWith('$')) {
        console.warn(`Potential NoSQL injection key detected: ${key}`);
        continue; // Skip this key
      }
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

// Custom sanitizer middleware
export const sanitizeAll = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = {};
      Object.keys(req.query).forEach(key => {
        if (!key.startsWith('$')) { // Block MongoDB operators
          sanitizedQuery[key] = sanitizeAndValidate(req.query[key]);
        } else {
          console.warn(`Blocked query parameter: ${key}`);
        }
      });
      // Create a new query object (read-only property workaround)
      Object.defineProperty(req, 'query', {
        value: sanitizedQuery,
        writable: true,
        configurable: true
      });
    }

    // Sanitize params
    if (req.params && typeof req.params === 'object') {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeAndValidate(req.params[key]);
        }
      });
    }

    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    next(); // Continue even if sanitization fails
  }
};

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .escape(),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
    .escape(),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('contactNumber')
    .trim()
    .matches(/^[+]?[\d\s\-()]{7,15}$/)
    .withMessage('Please provide a valid contact number')
    .escape(),
  
  body('country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Country can only contain letters and spaces')
    .escape(),

  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),
  
  body('password')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password is required'),

  handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .escape(),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
    .escape(),
  
  body('contactNumber')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s\-()]{7,15}$/)
    .withMessage('Please provide a valid contact number')
    .escape(),
  
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Country can only contain letters and spaces')
    .escape(),

  handleValidationErrors
];

// Auth0 profile validation
export const validateAuth0Profile = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .escape(),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
    .escape(),
  
  body('contactNumber')
    .trim()
    .matches(/^[+]?[\d\s\-()]{7,15}$/)
    .withMessage('Please provide a valid contact number')
    .escape(),
  
  body('country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Country can only contain letters and spaces')
    .escape(),

  handleValidationErrors
];

// Product validation
export const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s&]+$/)
    .withMessage('Category can only contain letters, spaces, and &')
    .escape(),
  
  body('price')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Price must be a valid positive number')
    .toFloat(),
  
  body('offerPrice')
    .optional()
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Offer price must be a valid positive number')
    .toFloat(),

  handleValidationErrors
];

// Cart validation
export const validateCart = [
  body('cartItems')
    .isObject()
    .withMessage('Cart items must be an object'),
  
  body('cartItems.*')
    .isInt({ min: 0, max: 999 })
    .withMessage('Cart item quantities must be valid positive integers'),

  handleValidationErrors
];

// Address validation
export const validateAddress = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces')
    .escape(),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces')
    .escape(),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),
  
  body('street')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters')
    .escape(),
  
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('City can only contain letters, spaces, hyphens, and apostrophes')
    .escape(),
  
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('State can only contain letters, spaces, hyphens, and apostrophes')
    .escape(),
  
  body('zipCode')
    .trim()
    .matches(/^[\d\s\-]{3,10}$/)
    .withMessage('Please provide a valid zip code')
    .escape(),
  
  body('country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Country can only contain letters and spaces')
    .escape(),
  
  body('phone')
    .trim()
    .matches(/^[+]?[\d\s\-()]{7,15}$/)
    .withMessage('Please provide a valid phone number')
    .escape(),

  handleValidationErrors
];

// Seller login validation
export const validateSellerLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),

  handleValidationErrors
];

// MongoDB ObjectId validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),

  handleValidationErrors
];

// Query validation for pagination and search
export const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters')
    .escape(),

  handleValidationErrors
];
