import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, isTokenExpired, logout } from './auth'; // yolunu kontrol et

export default function RequireAuth({ children, lang = 'tr' }) {
    const token = getToken();

    if (token && isTokenExpired(token)) {
        logout();

        const message =
            lang === 'en'
                ? 'Your session has expired. Please log in again.'
                : 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';

        return (
            <Navigate
                to={`/${lang}/login`}
                replace
                state={{ expired: true, message }}
            />
        );
    }



    return children;
}
