// utils/auth.jsx
import { jwtDecode } from 'jwt-decode';


export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);

  // Token'ı decode et ve expire zamanını al
  try {
    const { exp } = jwtDecode(token); // exp saniye cinsinden gelir
    const now = Date.now() / 1000;
    const remainingTime = (exp - now) * 1000;

    if (remainingTime > 0) {
      setTimeout(() => {
        logout();
      }, remainingTime);
    } else {
      logout();
    }
  } catch (err) {
    console.error('Token decode edilemedi', err);
    logout();
  }
}
