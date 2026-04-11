import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaUserShield } from 'react-icons/fa';

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Zaten admin girişi yapılmışsa direkt panele gönder
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      navigate('/admin'); // veya senin ana admin rotan hangisiyse
    }
  }, [navigate]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      setLoading(false);
      return;
    }

    try {
      // Backend'deki admin login endpoint'ine istek atıyoruz
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/login`, {
        email,
        password
      });

      // Admin yetkisini doğrula (Backend'den isAdmin: true dönmeli)
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        // İsteğe bağlı: Admin bilgilerini de saklayabilirsin
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));

        navigate('/admin'); // Başarılı girişte yönlendirilecek sayfa
      } else {
        throw new Error('Yetkisiz erişim.');
      }

    } catch (err) {
      console.error('Admin Giriş Hatası:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Giriş başarısız. Yetkilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark vh-100 d-flex align-items-center justify-content-center">
      <Container style={{ maxWidth: '450px' }}>
        <Card className="border-0 shadow-lg bg-white">
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="bg-primary d-inline-block p-3 rounded-circle mb-3 shadow">
                <FaUserShield size={40} color="white" />
              </div>
              <h3 className="fw-bold text-dark">Yönetici Paneli</h3>
              <p className="text-muted small">Lütfen kimlik bilgilerinizi doğrulayın</p>
            </div>

            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

            <Form onSubmit={handleAdminLogin}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">E-posta</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="admin@sirket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="py-2"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold">Şifre</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="py-2"
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <FaLock size={14} /> Giriş Yap
                  </>
                )}
              </Button>
            </Form>
          </Card.Body>
          <Card.Footer className="bg-light border-0 py-3 text-center">
            <small className="text-muted">
              Güvenli oturum açma sistemi etkindir.
            </small>
          </Card.Footer>
        </Card>
        <div className="text-center mt-4">
          <a href="/tr" className="text-light text-decoration-none small opacity-75">
            ← Siteye Geri Dön
          </a>
        </div>
      </Container>
    </div>
  );
};

export default AdminLogin;