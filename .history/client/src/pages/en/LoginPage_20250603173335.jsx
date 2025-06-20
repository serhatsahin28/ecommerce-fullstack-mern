// src/pages/en/LoginPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const LoginPageEn = () => {
  const { t } = useTranslation('Login');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const { email, password } = formData;

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Simulate successful login
    console.log('Login successful:', formData);
    navigate('/en'); // Redirect to home or dashboard
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">{t('title') || 'Login'}</h3>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>{t('email') || 'Email'}</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>{t('password') || 'Password'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
              />
            </Form.Group>

            <Button type="submit" variant="danger" className="w-100">
              {t('login_button') || 'Log In'}
            </Button>
          </Form>

          <div className="mt-3 text-center">
            <small>
              {t('no_account') || 'Don\'t have an account?'}{' '}
              <Link to="/en/register">{t('register_link') || 'Register here'}</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPageEn;
