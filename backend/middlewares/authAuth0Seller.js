import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Create JWKS client for Auth0
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

// Function to get the signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const authAuth0Seller = async (req, res, next) => {
  try {
    // First check for traditional seller token (fallback)
    const { sellerToken } = req.cookies;
    if (sellerToken) {
      try {
        const tokenDecoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
        if (tokenDecoded.email === process.env.SELLER_EMAIL) {
          req.user = { id: 'seller', email: tokenDecoded.email };
          return next();
        }
      } catch (error) {
        // Continue to Auth0 check if traditional token fails
      }
    }

    // Check for Auth0 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Access token required" });
    }

    const token = authHeader.substring(7);

    // Verify the JWT token with Auth0
    jwt.verify(token, getKey, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ success: false, message: "Invalid token" });
      }

      // Check if the Auth0 user email matches seller email
      const userEmail = decoded.email;
      if (userEmail === process.env.SELLER_EMAIL) {
        req.user = { id: decoded.sub, email: userEmail };
        next();
      } else {
        return res.status(403).json({ success: false, message: "Seller access required" });
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default authAuth0Seller;
