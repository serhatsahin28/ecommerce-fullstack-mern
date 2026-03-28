// authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ code: 'NO_TOKEN', message: 'Token yok' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'Oturum süresi doldu' });
    }
    return res.status(403).json({ code: 'INVALID_TOKEN', message: 'Geçersiz token' });
  }
};

module.exports = { authMiddleware };
