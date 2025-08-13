const users = require('../models/users');

const profileController = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await users.findById(userId).select('-password'); // şifreyi gönderme

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        console.log(userId);
        res.status(200).json(user);
    } catch (err) {
        console.error('Profil getirme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

module.exports = profileController;
    