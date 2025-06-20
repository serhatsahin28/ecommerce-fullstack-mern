// src/pages/en/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LoginPageEn = () => {
  const { t } = useTranslation('login');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // örnek login işlemi
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/en/account');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">{t('login_title')}</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>{t('email')}</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('password')}</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            {t('login_button')}
          </Button>
          <p className="mt-3 text-center">
            {t('no_account')} <a href="/en/register">{t('register')}</a>
          </p>
        </Form>
      </Card>
    </Container>
  );
};

export default LoginPageEn;
