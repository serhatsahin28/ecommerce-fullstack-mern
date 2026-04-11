const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Token yoksa
    if (!authHeader) {
      return res.status(401).json({ message: "Token yok" });
    }

    // Bearer token
    const token = authHeader.split(" ")[1];

    // Token doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Admin mi kontrol et
    if (decoded.rol !== "admin") {
      return res.status(403).json({ message: "Yetkisiz" });
    }

    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Geçersiz token" });
  }
};

module.exports = verifyAdmin;