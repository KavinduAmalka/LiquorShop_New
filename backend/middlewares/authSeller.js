import jwt from 'jsonwebtoken';


const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.status(401).json({ success: false, message: "Unauthorized access" });
  }

  try {
    const tokenDecoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
    if (tokenDecoded.email === process.env.SELLER_EMAIL) {
      req.user = { email: tokenDecoded.email }; // Attach seller info to req.user
      next();
    } else {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default authSeller;