
// src/pages/tr/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const RegisterPageTr = () => {
  const { t } = useTranslation('register');
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/tr/login');
      } else {
        setError(data.message || 'Kayıt başarısız');
      }
    } catch (err) {
      setError('Ağ hatası');
    }
  };

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">{t('register_title')}</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3">
            <Form.Label>{t('name')}</Form.Label>
            <Form.Control name="name" value={form.name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('email')}</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('password')}</Form.Label>
            <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            {t('register_button')}
          </Button>
          <p className="mt-3 text-center">
            {t('have_account')} <a href="/tr/login">{t('login')}</a>
          </p>
        </Form>
      </Card>
    </Container>
  );
};

export default RegisterPageTr;
