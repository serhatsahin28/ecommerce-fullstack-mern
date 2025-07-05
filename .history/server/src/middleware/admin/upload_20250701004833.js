const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../../client/public/images');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    console.log("Yüklenen dosya adı:", file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    console.log("ext", ext);
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase())) {
      return cb(new Error('Sadece görsel dosyalarına izin verilir.'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Farklı upload seçenekleri export edin
module.exports = {
  // Tek dosya için
  single: (fieldName) => upload.single(fieldName),
  
  // Çoklu dosya için (aynı field name)
  array: (fieldName, maxCount) => upload.array(fieldName, maxCount),
  
  // Farklı field name'lerde dosyalar için
  fields: (fields) => upload.fields(fields),
  
  // Hiç dosya yok, sadece text fields için
  none: () => upload.none(),
  
  // Ham upload instance (eski kullanım için)
  upload
};