// routes/userRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

// CONTROLLER'LARI İÇERİ AKTARMA
const {
    updateProfileController,
    addAddressController,
    updateAddressController,
    deleteAddressController // YENİ CONTROLLER'I İÇERİ AKTARIN
} = require('../controllers/updateProfileController');

// Diğer controller importları...
const loginController = require('../controllers/loginController');
const registerController = require('../controllers/registerController');
const profileController = require('../controllers/profileController');

const router = express.Router();

// Auth ve Profil Rotaları
router.post('/register', registerController);
router.post('/login', loginController);
router.get('/profile', authMiddleware, profileController);

// Kullanıcı Bilgileri Güncelleme
router.put('/profile/update', authMiddleware, updateProfileController);

// === Adres CRUD Rotaları ===
router.post('/address/add', authMiddleware, addAddressController);
router.put('/address/update/:addressId', authMiddleware, updateAddressController);
router.delete('/address/delete/:addressId', authMiddleware, deleteAddressController); // EKSİK OLAN YOLU EKLEYİN
router.post('/payment/add', authMiddleware, addPaymentMethod);
router.delete('/payment/delete/:paymentId', authMiddleware, deletePaymentMethod);
module.exports = router;