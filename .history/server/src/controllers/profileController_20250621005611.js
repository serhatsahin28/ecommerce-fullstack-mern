const users = require('../models/users');

const profileController = async (req, res) => {
    try {

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const existingUser = await users.findOne({ email });





        console.log();
        return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Register Error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = profileController;
