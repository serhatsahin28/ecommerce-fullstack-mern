// routes/userRoutes.js
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');

// CONTROLLER'LARI İÇERİ AKTARMA
const {
    updateProfileController,
    addAddressController,
    updateAddressController,
    deleteAddressController, addPaymentMethod, deletePaymentMethod // YENİ CONTROLLER'I İÇERİ AKTARIN
} = require('../controllers/updateProfileController');

// Diğer controller importları...
const loginController = require('../controllers/loginController');
const registerController = require('../controllers/registerController');
const profileController = require('../controllers/profileController');
const meController = require('../controllers/meController');
const {
    basketItemShow,
    basketItemAdd,
    basketItemRemove,
    basketItemUpdate,
    basketClear
} = require('../controllers/basketController');
const viewOrderController = request('../controllers/viewOrders');


const router = express.Router();

// Auth ve Profil Rotaları
router.post('/register', registerController);
router.post('/login', loginController);
router.get('/profile', authMiddleware, profileController);
router.get('/auth/me', authMiddleware, meController);
// Kullanıcı Bilgileri Güncelleme
router.put('/profile/update', authMiddleware, updateProfileController);

router.get('/show/basket', authMiddleware, basketItemShow);
router.put('/add/basket', authMiddleware, basketItemAdd);
router.put('/remove/basket', authMiddleware, basketItemRemove);
router.put('/update/basket', authMiddleware, basketItemUpdate);
router.delete('/clear/basket', authMiddleware, basketClear);

router.post('/address/add', authMiddleware, addAddressController);
router.put('/address/update/:addressId', authMiddleware, updateAddressController);
router.delete('/address/delete/:addressId', authMiddleware, deleteAddressController);
router.post('/payment/add', authMiddleware, addPaymentMethod);
router.delete('/payment/delete/:paymentId', authMiddleware, deletePaymentMethod);



router.get('/view/orders', authMiddleware, viewOrderController);

module.exports = router;