// src/pages/tr/RegisterPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPageTr = () => {
  const { t } = useTranslation('register');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    // 🔐 Backend kaydı burada yapılmalı
    // Simülasyon
    console.log('Kullanıcı kaydedildi:', { email, password });
    navigate('/tr/login');
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">{t('title') || 'Kayıt Ol'}</h3>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>{t('email') || 'E-posta'}</Form.Label>
              <Form.Control
                type="email"
                placeholder="eposta@ornek.com"
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

            <Form.Group className="mb-3">
              <Form.Label>{t('confirm_password') || 'Şifre (tekrar)'}</Form.Label>
              <Form.Control
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100">
              {t('register') || 'Kayıt Ol'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            {t('have_account') || 'Zaten bir hesabınız var mı?'}{' '}
            <Link to="/tr/login">{t('login_here') || 'Giriş yap'}</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegisterPageTr;
