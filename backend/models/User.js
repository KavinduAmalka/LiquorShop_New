import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String, 
    required: function() {
      return this.authProvider === 'local' || this.profileComplete; 
    }, 
    unique: true, 
    sparse: true 
  },
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String}, // Made optional for Auth0 users
  contactNumber: {
    type: String, 
    required: function() {
      return this.authProvider === 'local'; // Required only for local auth
    }
  },
  country: {
    type: String, 
    required: function() {
      return this.authProvider === 'local'; // Required only for local auth
    }
  },
  cartItems:{type: Object, default: {}},
  // Auth0 specific fields
  auth0Id: {type: String, unique: true, sparse: true}, // Auth0 user ID
  authProvider: {type: String, enum: ['local', 'auth0'], default: 'local'}, // Track auth method
  profileComplete: {type: Boolean, default: false}, // Track if Auth0 user completed profile
}, {minimize: false})

const User = mongoose.models.user || mongoose.model('user',userSchema)

export default User;