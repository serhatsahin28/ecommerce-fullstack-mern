const express = require('express');
const users = require('../models/users');

const login = async (req, res) => {  // req ve res parametrelerini almalı
    try {
        const data = await users.find().lean();
        if (!data) return res.status(404).json({ message: 'No data found.' });
        res.json(data);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = login;  // Module.exports ile dışa aktarılıyor
