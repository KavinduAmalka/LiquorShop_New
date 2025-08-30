import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import User from '../models/User.js';

// Create JWKS client for Auth0
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  requestHeaders: {}, 
  timeout: 30000, 
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const authAuth0 = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT token
    jwt.verify(token, getKey, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    }, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }

      try {
        // Find user by Auth0 ID
        const user = await User.findOne({ auth0Id: decoded.sub });
        
        if (!user) {
          return res.status(401).json({ success: false, message: "User not found" });
        }

        // Attach user info to request
        req.user = { id: user._id, auth0Id: decoded.sub };
        next();
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default authAuth0;
