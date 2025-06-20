const users = require('../models/users');

const profileController = async (req, res) => {
    try {

        const token = localStorage.getItem('token');
        const a = JSON.parse(localStorage.getItem('user'));

        console.log("Kullanıcı Bilgisi:", user);

        const existingUser = await users.findOne({ email });





        console.log();
        return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Register Error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = profileController;
