import multer from "multer";
import path from "path";
import crypto from "crypto";

// Allowed file types with strict validation
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

// File filter with enhanced security
const fileFilter = (req, file, cb) => {
  try {
    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed.`), false);
    }

    // Check file extension
    const extname = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extname)) {
      return cb(new Error(`Invalid file extension. Only ${allowedExtensions.join(', ')} are allowed.`), false);
    }

    // Check filename for malicious patterns
    const maliciousPatterns = [
      /\.\./g,        // Directory traversal
      /[<>:"|?*]/g,   // Invalid filename characters
      /\.php$/i,      // PHP files
      /\.exe$/i,      // Executable files
      /\.bat$/i,      // Batch files
      /\.cmd$/i,      // Command files
      /\.scr$/i,      // Screen saver files
      /\.vbs$/i,      // VBScript files
      /\.js$/i,       // JavaScript files (in filename)
      /\.html?$/i     // HTML files
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(file.originalname)) {
        return cb(new Error('Filename contains invalid characters or patterns.'), false);
      }
    }

    // Generate secure filename
    const secureFileName = crypto.randomBytes(16).toString('hex') + extname;
    file.secureFileName = secureFileName;

    cb(null, true);
  } catch (error) {
    cb(new Error('File validation error.'), false);
  }
};

// Enhanced storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Files will be temporarily stored and then uploaded to Cloudinary
    cb(null, 'uploads/temp/');
  },
  filename: function (req, file, cb) {
    // Use secure filename generated in fileFilter
    cb(null, file.secureFileName || `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.jpg`);
  }
});

// Configure multer with comprehensive security settings
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 4, // Maximum 4 files
    fields: 10, // Maximum 10 fields
    fieldSize: 1024 * 1024, // 1MB field size limit
    fieldNameSize: 100, // Field name size limit
    parts: 20 // Maximum parts in multipart form
  },
  fileFilter: fileFilter,
  // Prevent buffer attacks
  preservePath: false
});

// Middleware to validate file upload request
export const validateFileUpload = (req, res, next) => {
  // Check if files are present
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one image file is required'
    });
  }

  // Validate file count
  if (req.files.length > 4) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 4 files allowed'
    });
  }

  // Additional validation for each file
  for (const file of req.files) {
    // Double-check file size
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 5MB'
      });
    }

    // Validate buffer for image signatures
    if (!isValidImageBuffer(file.buffer)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image file detected'
      });
    }
  }

  next();
};

// Function to validate image file signatures (magic bytes)
const isValidImageBuffer = (buffer) => {
  if (!buffer || buffer.length < 4) return false;

  // Check for valid image file signatures
  const signatures = {
    jpg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46] // RIFF header for WebP
  };

  // Check JPEG
  if (buffer[0] === signatures.jpg[0] && 
      buffer[1] === signatures.jpg[1] && 
      buffer[2] === signatures.jpg[2]) {
    return true;
  }

  // Check PNG
  if (buffer[0] === signatures.png[0] && 
      buffer[1] === signatures.png[1] && 
      buffer[2] === signatures.png[2] && 
      buffer[3] === signatures.png[3]) {
    return true;
  }

  // Check WebP
  if (buffer[0] === signatures.webp[0] && 
      buffer[1] === signatures.webp[1] && 
      buffer[2] === signatures.webp[2] && 
      buffer[3] === signatures.webp[3]) {
    return true;
  }

  return false;
};