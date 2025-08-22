// Update user profile: /api/user/update-profile
export const updateProfile = async (req, res) => {
  try {
    const { email, username, name, contactNumber, country } = req.body;
    if (!email || !username || !name || !contactNumber || !country) {
      return res.json({ success: false, message: "All fields are required" });
    }
    const user = await User.findOneAndUpdate(
      { email },
      { username, name, contactNumber, country },
      { new: true }
    );
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user: { username: user.username, email: user.email, name: user.name, contactNumber: user.contactNumber, country: user.country } });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Rejister a new user: /api/user/register
export const register = async (req, res)=> {
  try{
    const {username, name, email, password, contactNumber, country} = req.body;

    if(!username || !name || !email || !password || !contactNumber || !country){
      return res.json({success: false, message: "Please fill all the fields"});
    }

    const existingUser = await User.findOne({$or: [{email}, {username}]})

    if(existingUser){
      return res.json({success: false, message: "User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({username, name, email, password: hashedPassword, contactNumber, country})

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});

    res.cookie('token',token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expiration time (7 days)
    })

    return res.json({success: true, user: {username: user.username, email: user.email, name: user.name, contactNumber: user.contactNumber, country: user.country, cartItems: user.cartItems || {}}})

  }catch(error){
    console.error(error.message);
    res.json({success: false, message: error.message});
  }
}

// Login a user: /api/user/login

export const login = async (req, res) => {
  try{
     const {email, password} = req.body;

     if(!email || !password)
      return res.json({success: false, message: "Email and password are required"});
     const user = await User.findOne({email});

     if(!user){
      return res.json({success: false, message: "Invalid email or password"});
     }

     const isMatch = await bcrypt.compare(password, user.password)

      if(!isMatch)
        return res.json({success: false, message: "Invalid email or password"});
      
       const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});

      res.cookie('token',token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', 
        maxAge: 7 * 24 * 60 * 60 * 1000 
      })

  return res.json({success: true, user: {username: user.username, email: user.email, name: user.name, contactNumber: user.contactNumber, country: user.country, cartItems: user.cartItems || {}}})

  }catch(error){
    console.error(error.message);
    res.json({success: false, message: error.message});
  }
}

//Check Auth : /api/user/is-auth
export const isAuth = async (req, res) => {
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
        cartItems: user.cartItems || {}
      }
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
}

//Logout a user: /api/user/logout

export const logout = async (req, res) => {
  try {
   res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    path: '/' // Add the path attribute to ensure proper cookie clearing
   });
   return res.json({success: true, message: "Logged out successfully"});
  } catch (error) {
    console.error(error.message);
    res.json({success: false, message: error.message});
  }
}