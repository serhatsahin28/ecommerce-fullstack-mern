const multer = require('multer');
const path = require('path');

// 1. Yüklenen dosya nereye gidecek
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '.../../../../client/public/images'); // buraya kaydedilecek
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`; // eşsiz isim
    cb(null, uniqueName);
  },
});

// 2. Filtre ve limitler
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase())) {
      return cb(new Error('Sadece görsel dosyalarına izin verilir.'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // maksimum 5MB
  },
});

console.log("path",file.originalname);

module.exports = upload;
