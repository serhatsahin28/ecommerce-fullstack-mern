// // middleware/admin/upload.js
// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, '../../client/public/images');
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${file.originalname}`;
//     console.log("Yüklenen dosya adı:", file.originalname);
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     console.log("ext", ext);
//     if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase())) {
//       return cb(new Error('Sadece görsel dosyalarına izin verilir.'));
//     }
//     cb(null, true);
//   },
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// // BURADA SORUN VAR - upload instance'ını export edin
// module.exports = upload; // Bu doğru

// middleware/admin/upload.js
const multer = require('multer');
const path = require('path');

// 1. ADIM: DiskStorage yerine MemoryStorage kullanıyoruz.
// Resim sunucuya kaydedilmez, RAM'de geçici bir "buffer" olarak tutulur.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Desteklenen formatlar
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return cb(new Error('Sadece görsel dosyalarına izin verilir.'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimum 5MB
  },
});

// Route dosmanda kullanabilmen için export ediyoruz
module.exports = upload;