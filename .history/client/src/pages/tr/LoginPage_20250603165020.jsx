import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/tr'); // veya '/en'
    } catch (err) {
      setError(t('invalid_credentials'));
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 500 }}>
      <h2>{t('login_title')}</h2>
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
        <Button type="submit" variant="primary" className="w-100">{t('login')}</Button>
      </Form>
      <div className="mt-3 text-center">
        {t('no_account')} <Link to="/tr/register">{t('register')}</Link>
      </div>
    </Container>
  );
};

export default LoginPage;
