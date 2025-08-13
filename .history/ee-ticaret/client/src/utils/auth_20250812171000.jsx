export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);

  try {
    // Token 3 parçadan oluşur: header.payload.signature
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    const delay = (exp - now) * 1000;

    if (delay > 0) {
      setTimeout(() => {
        logout();
      }, delay);
    } else {
      logout();
    }
  } catch (error) {
    logout();
  }
}
