// src/pages/en/LoginPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPageEn = () => {
  const { t } = useTranslation('login');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { email, password } = formData;

    if (!email || !password) {
      setError(t('fill_all_fields') || 'Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000//login', {
        email,
        password
      });

      console.log('Login successful:', response.data);

      // Token varsa localStorage’a kaydet
      localStorage.setItem('token', response.data.token);

      navigate('/en');
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">{t('title') || 'Login'}</h3>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>{t('email') || 'Email'}</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>{t('password') || 'Password'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>

            <Button type="submit" variant="danger" className="w-100" disabled={loading}>
              {loading ? t('loading') || 'Loading...' : t('login_button') || 'Log In'}
            </Button>
          </Form>

          <div className="mt-3 text-center">
            <small>
              {t('no_account') || "Don't have an account?"}{' '}
              <Link to="/en/register">{t('register_link') || 'Register here'}</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPageEn;
