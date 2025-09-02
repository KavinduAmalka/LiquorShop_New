import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String, 
    required: function() {
      return this.authProvider === 'local' || this.profileComplete; 
    }, 
    unique: true, 
    sparse: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username must not exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  name: {
    type: String, 
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name must not exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces']
  },
  email: {
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Email must not exceed 100 characters'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters long'],
    maxlength: [128, 'Password must not exceed 128 characters']
  }, // Made optional for Auth0 users
  contactNumber: {
    type: String, 
    required: function() {
      return this.authProvider === 'local'; // Required only for local auth
    },
    trim: true,
    match: [/^[+]?[\d\s\-()]{7,15}$/, 'Please enter a valid contact number']
  },
  country: {
    type: String, 
    required: function() {
      return this.authProvider === 'local'; // Required only for local auth
    },
    trim: true,
    minlength: [2, 'Country must be at least 2 characters long'],
    maxlength: [50, 'Country must not exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Country can only contain letters and spaces']
  },
  cartItems: {
    type: Object, 
    default: {},
    validate: {
      validator: function(v) {
        // Validate that all keys are valid ObjectIds and values are positive integers
        for (let key in v) {
          if (!mongoose.Types.ObjectId.isValid(key) || !Number.isInteger(v[key]) || v[key] < 0) {
            return false;
          }
        }
        return true;
      },
      message: 'Invalid cart items format'
    }
  },
  // Auth0 specific fields
  auth0Id: {
    type: String, 
    unique: true, 
    sparse: true,
    trim: true
  }, // Auth0 user ID
  authProvider: {type: String, enum: ['local', 'auth0'], default: 'local'}, // Track auth method
  profileComplete: {type: Boolean, default: false}, // Track if Auth0 user completed profile
}, {minimize: false})

const User = mongoose.models.user || mongoose.model('user',userSchema)

export default User;