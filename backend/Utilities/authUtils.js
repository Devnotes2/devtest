const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const { authToken } = req.cookies;
    if (!authToken) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    // It's crucial that the secret here matches the one used for signing in authCt.js
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Access denied. Token has expired.' });
    }
    return res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
