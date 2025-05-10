const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    console.log(token);
    const decoded = jwt.decode(token, { complete: true });
    console.log('Decoded Token:', decoded);
    const currentTime = Date.now() / 1000;
    if (token && token!=="undefined" && decoded.exp < currentTime) {
      return res.status(401).json({ error: 'Access denied-Please login' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Access denied-Please login' });
  }

  try {
    const token = req.cookies.authToken;
    const decoded = jwt.verify(token, 'Shiva@45');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
