// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token bulunamadı. Lütfen giriş yapın.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token bulunamadı. Lütfen giriş yapın.'
      });
    }

    // Token doğrulama
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Token süresi kontrolü
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(403).json({
        success: false,
        message: 'Oturum süresi doldu'
      });
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
    
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Oturum süresi doldu'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

module.exports = { authMiddleware };