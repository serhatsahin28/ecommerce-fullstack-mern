
const express = require('express');
const users = require('../models/users'); // model export'u da require


const login = async () => {


    try {
        const data = await users.find().lean();
        if (!data) return res.status(404).json({ message: 'No data found.' });
        res.json(data);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Server error' });
    }
} catch (error) {

}



export default login;