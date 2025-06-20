import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPageEn = () => {
  const { t } = useTranslation('register');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    ad: '',       // isim
    soyad: '',    // soyisim
    telefon: ''   // telefon (opsiyonel)
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const { email, password, confirmPassword, ad, soyad } = formData;
console.log("formData:", formData);

    if (!email || !password || !confirmPassword || !ad || !soyad) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/register', {
        email,
        password,
        ad,
        soyad,
        telefon: formData.telefon || ''
      });

      if (response.status === 201) {
        navigate('/en/login');
      } else {
        setError('Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">{t('title') || 'Register'}</h3>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>{t('first_name') || 'First Name'}</Form.Label>
              <Form.Control
                type="text"
                name="ad"
                value={formData.ad}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('last_name') || 'Last Name'}</Form.Label>
              <Form.Control
                type="text"
                name="soyad"
                value={formData.soyad}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('email') || 'Email'}</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('phone') || 'Phone'}</Form.Label>
              <Form.Control
                type="tel"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="+905551112233"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('password') || 'Password'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('confirm_password') || 'Confirm Password'}</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Registering...' : t('register') || 'Register'}
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
