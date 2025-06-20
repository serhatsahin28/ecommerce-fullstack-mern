const express = require('express');  // require ile express'i dahil ettik
const users = require('../models/users'); // model require ile dahil ediliyor

const login = async (req, res) => {
    try {
        const data = await users.find().lean();
        if (!data) return res.status(404).json({ message: 'No data found.' });
        res.json(data);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = login;  // Export işlemi module.exports ile yapılıyor
