// src/pages/en/RegisterPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPageEn = () => {
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
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Simulated registration
    console.log('User registered:', { email, password });
    navigate('/en/login');
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">{t('title') || 'Register'}</h3>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>{t('email') || 'Email'}</Form.Label>
              <Form.Control
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('password') || 'Password'}</Form.Label>
              <Form.Control
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('confirm_password') || 'Confirm Password'}</Form.Label>
              <Form.Control
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100">
              {t('register') || 'Register'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            {t('have_account') || 'Already have an account?'}{' '}
            <Link to="/en/login">{t('login_here') || 'Login here'}</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegisterPageEn;
