// context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { getToken, setToken, logout } from '../utils/auth';
import api from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Sayfa yenilendiğinde token varsa kullanıcıyı yükle
    useEffect(() => {
        const token = getToken();
        if (token) {
            // Timer'ı tekrar başlat
            setToken(token);

            api.get('/auth/me')

                .then((res) => setUser(res.data))
                .catch(() => logout());
        }
    }, []);

    const login = (token, userData) => {
        setToken(token);
        setUser(userData);
    };

    const value = { user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
