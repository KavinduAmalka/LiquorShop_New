import User from '../models/User.js';

// Register/Login Auth0 user: /api/user/auth0-callback
export const auth0Callback = async (req, res) => {
  try {
    console.log('Auth0 callback received with data:', req.body);
    const { auth0Id, email, name, username, contactNumber, country } = req.body;

    
    if (!auth0Id) {
      return res.json({ success: false, message: "Missing Auth0 user ID" });
    }

    if (!email && !name) {
      return res.json({ success: false, message: "Missing both email and name from Auth0" });
    }

    // Use email as fallback for name if name is not provided
    const finalName = name || email?.split('@')[0] || 'User';
    const finalEmail = email || `${auth0Id}@auth0.local`; // Fallback email if not provided

    console.log(`Processing user: auth0Id=${auth0Id}, email=${finalEmail}, name=${finalName}`);

    // Check if user already exists
    let user = await User.findOne({ auth0Id });

    if (user) {
      console.log('Existing user found, updating...');
      // User exists, update any changed information
      user.email = finalEmail;
      user.name = finalName;
      
      // Only update username if profile is not complete (user hasn't set custom username yet)
      if (username && !user.profileComplete) {
        user.username = username;
      }
      
      if (contactNumber) {
        user.contactNumber = contactNumber;
        if (country) {
          user.country = country;
          user.profileComplete = true;
        }
      }
      await user.save();
      console.log('User updated successfully');
    } else {
      console.log('New user, creating...');
      // Check if email already exists with local auth
      const existingUser = await User.findOne({ email: finalEmail, authProvider: 'local' });
      if (existingUser) {
        return res.json({ 
          success: false, 
          message: "Email already exists with traditional authentication" 
        });
      }

      // Generate unique username if not provided
      let finalUsername = username || finalEmail.split('@')[0];
      
      // Check if username already exists and make it unique
      const existingUsername = await User.findOne({ username: finalUsername });
      if (existingUsername) {
        finalUsername = `${finalUsername}_${Date.now()}`;
      }

      console.log(`Creating user with username: ${finalUsername}`);

      // Create new user with minimal required info
      const userData = {
        auth0Id,
        email: finalEmail,
        name: finalName,
        username: finalUsername,
        authProvider: 'auth0',
        profileComplete: !!(contactNumber && country), 
        cartItems: {}
      };

      // Only add contactNumber and country if they are not empty
      if (contactNumber && contactNumber.trim()) {
        userData.contactNumber = contactNumber.trim();
      }
      if (country && country.trim()) {
        userData.country = country.trim();
      }

      user = await User.create(userData);
      console.log('User created successfully');
    }

    console.log('Returning user data:', {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      profileComplete: user.profileComplete
    });

    return res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        contactNumber: user.contactNumber,
        country: user.country,
        cartItems: user.cartItems || {},
        profileComplete: user.profileComplete
      }
    });

  } catch (error) {
    console.error('Auth0 callback error:', error);
    res.json({ success: false, message: `Auth0 callback failed: ${error.message}` });
  }
};

// Check Auth0 Auth : /api/user/auth0-is-auth
export const auth0IsAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        contactNumber: user.contactNumber,
        country: user.country,
        cartItems: user.cartItems || {},
        profileComplete: user.profileComplete
      }
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update Auth0 user profile: /api/auth0-user/update-profile
export const auth0UpdateProfile = async (req, res) => {
  try {
    console.log('Profile update request received:', req.body);
    const { username, name, contactNumber, country } = req.body;
    
    // All fields are required for profile completion
    if (!username || !name || !contactNumber || !country) {
      return res.json({ success: false, message: "All fields (username, name, contact number, and country) are required" });
    }

    // Check if username already exists 
    const existingUser = await User.findOne({ 
      username: username, 
      _id: { $ne: req.user.id } 
    });
    
    console.log('Username availability check:', {
      requestedUsername: username,
      currentUserId: req.user.id,
      existingUser: existingUser ? existingUser._id : null
    });
    
    if (existingUser) {
      console.log('Username already exists for different user');
      return res.json({ success: false, message: "Username already exists. Please choose a different username." });
    }

    const updateData = {
      username, 
      name,
      contactNumber, 
      country, 
      profileComplete: true // Mark profile as complete when all fields are provided
    };

    console.log('Updating user with data:', updateData);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    console.log('User updated successfully:', {
      username: user.username,
      name: user.name,
      profileComplete: user.profileComplete
    });

    return res.json({ 
      success: true, 
      user: { 
        _id: user._id,
        username: user.username, 
        email: user.email, 
        name: user.name, 
        contactNumber: user.contactNumber, 
        country: user.country,
        cartItems: user.cartItems || {},
        profileComplete: user.profileComplete
      } 
    });
  } catch (error) {
    console.error('Profile update error:', error.message);
    if (error.code === 11000) {
      // Handle duplicate key error
      return res.json({ success: false, message: "Username already exists. Please choose a different username." });
    }
    res.json({ success: false, message: error.message });
  }
};
