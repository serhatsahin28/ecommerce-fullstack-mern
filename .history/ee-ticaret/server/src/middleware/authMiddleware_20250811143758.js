const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkisiz erişim: Token yok.' });
  }

  const token = authHeader.split(' ')[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded; // id, email, rol gibi veriler burada taşınır
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Geçersiz veya süresi dolmuş token.' });
  }
};

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },  // token payload
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '1h' }  // token 1 saat geçerli olacak
  );
}

module.exports = authMiddleware;
