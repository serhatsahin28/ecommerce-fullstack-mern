// src/pages/tr/LoginPage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CartContext } from '../../components/common/CartContext'; // ✅ CartContext eklendi
const LoginPageTr = () => {
  const { t } = useTranslation('login');
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart } = useContext(CartContext); // ✅ Sepet güncelleme fonksiyonu

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const toastId = useRef(null);
  const [hasToast, setHasToast] = useState(false);


  // ✅ Eğer zaten giriş yaptıysa yönlendir
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/tr');
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state?.expired) {
      toast.error(location.state.message || 'Lütfen giriş yapın.');
    }
  }, [location.state]);

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  if (!email || !password) {
    setError('Lütfen tüm alanları doldurun.');
    setLoading(false);
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/login', { email, password });
    localStorage.setItem('token', response.data.token);

    if (typeof fetchCart === 'function') await fetchCart();

  
if (!hasToast) {
  toast.success('Giriş başarılı!', { autoClose: 3000 });
  setHasToast(true);
}

    navigate('/tr'); // Yönlendirme toast’tan sonra
  } catch (err) {
    setError(err.response?.data?.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
  } finally {
    setLoading(false);
  }
};

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">{t('title') || 'Giriş Yap'}</h3>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>{t('email') || 'E-posta'}</Form.Label>
              <Form.Control
                type="email"
                placeholder="ornek@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('password') || 'Şifre'}</Form.Label>
              <Form.Control
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Yükleniyor...' : (t('button') || 'Giriş Yap')}
            </Button>
          </Form>

          <div className="text-center mt-3">
            {t('no_account') || 'Hesabınız yok mu?'}{' '}
            <Link to="/tr/register">{t('register') || 'Kayıt olun'}</Link>
          </div>

          <div className="text-center mt-2">
            <Link to="/tr/mailQuery" className="text-decoration-none text-primary">
              Siparişlerimi Göster
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPageTr;
