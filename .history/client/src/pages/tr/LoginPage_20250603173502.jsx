// src/pages/tr/LoginPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const LoginPageTr = () => {
  const { t } = useTranslation('login');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    // Simüle giriş kontrolü
    if (email === 'kullanici@example.com' && password === '123456') {
      console.log('Giriş başarılı');
      navigate('/tr');
    } else {
      setError('E-posta veya şifre hatalı.');
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">{t('title') || 'Giriş Yap'}</h3>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>{t('email') || 'E-posta'}</Form.Label>
              <Form.Control
                type="email"
                placeholder="ornek@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('password') || 'Şifre'}</Form.Label>
              <Form.Control
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100">
              {t('button') || 'Giriş Yap'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            {t('no_account') || 'Hesabınız yok mu?'}{' '}
            <Link to="/tr/register">{t('no_account') || 'Kayıt olun'}</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPageTr;
