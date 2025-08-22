import e from 'express';
import jwt from 'jsonwebtoken';

// Login seller: /api/seller/login

export const sellerLogin = async (req, res) => {
try {
    const {email, password} = req.body;

  if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){
    const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn:'7d'});

    res.cookie('sellerToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({success: true, message: "Seller logged in successfully"});
  }else{
    return res.json({success: false, message: "Invalid email or password"});
  }
} catch (error) {
   console.log(error.message);
   res.status(500).json({success: false, message: error.message});
}
}

//Seller isAuth : /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
  try {
    // user info is attached by authSeller middleware
    const user = req.user;
    return res.json({ success: true, user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Logout a user: /api/seller/logout

export const sellerogout = async (req, res) => {
  try {
   res.clearCookie('sellerToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    path: '/' // Add the path attribute to ensure proper cookie clearing
   });
   return res.json({success: true, message: "Logged out successfully"});
  } catch (error) {
    console.error(error.message);
    res.status(500).json({success: false, message: error.message});
  }
}
