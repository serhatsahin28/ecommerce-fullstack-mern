// controllers/meController.js
const users = require('../models/users');

const meController = async (req, res) => {
  try {
    const user = await users.findById(req.user.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Me Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = meController;
