// src/pages/en/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const LoginPageEn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false); // ✅ boolean
  const [loading, setLoading] = useState(false);

  // Eğer zaten giriş yaptıysa yönlendir
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/en');
    }
  }, [navigate]);

  // Oturum süresi dolduysa hata göster
  useEffect(() => {
    if (location.state?.expired) {
      setError(location.state.message || 'Please log in again.');
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(true); // Başarı mesajını göster
    setTimeout(() => {
      setSuccess(false);
      navigate('/en');  // Mesaj göründükten sonra yönlendir
    }, 2000);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      localStorage.setItem('token', response.data.token);
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
          <h3 className="mb-4 text-center">Login</h3>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Login successful!</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Loading...' : 'Log In'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            Don't have an account?{' '}
            <Link to="/en/register">Register</Link>
          </div>

          <div className="text-center mt-2">
            <Link to="/en/mailQuery" className="text-decoration-none text-primary">
              View My Orders
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPageEn;
