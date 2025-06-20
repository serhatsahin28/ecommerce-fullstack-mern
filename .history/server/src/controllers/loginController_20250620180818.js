import express from 'express';  // Changed require to import
import users from '../models/users'; // Changed require to import

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

export default login;
