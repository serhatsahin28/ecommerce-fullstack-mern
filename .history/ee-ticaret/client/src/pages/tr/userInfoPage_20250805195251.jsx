// src/pages/tr/UserInfoPage.jsx
import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const UserInfoPage = () => {
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/tr/login');
          return;
        }

        const res = await fetch('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Kullanıcı bilgileri alınamadı.');
        const user = await res.json();

        setFormData({
          ad: user.ad || '',
          soyad: user.soyad || '',
          email: user.email || '',
          telefon: user.telefon || '',
          adres_detay: user.adresler?.[0]?.adres_detay || '',
          sehir: user.adresler?.[0]?.sehir || '',
          ilce: user.adresler?.[0]?.ilce || '',
          posta_kodu: user.adresler?.[0]?.posta_kodu || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Oturum bulunamadı.');

      // Güncellenebilir alanları filtrele
      const updateData = {
        telefon: formData.telefon,
        adres_detay: formData.adres_detay,
        sehir: formData.sehir,
        ilce: formData.ilce,
        posta_kodu: formData.posta_kodu
      };

      const res = await fetch('/update-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Bilgiler güncellenemedi.');

      navigate('/tr/sepet');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Kullanıcı Bilgileriniz</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        {/* Readonly Alanlar */}
        <Form.Group className="mb-3">
          <Form.Label>Ad</Form.Label>
          <Form.Control value={formData.ad} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Soyad</Form.Label>
          <Form.Control value={formData.soyad} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>E-posta</Form.Label>
          <Form.Control type="email" value={formData.email} readOnly />
        </Form.Group>

        {/* Düzenlenebilir Alanlar */}
        <Form.Group className="mb-3">
          <Form.Label>Telefon</Form.Label>
          <Form.Control
            name="telefon"
            value={formData.telefon}
            onChange={handleChange}
            placeholder="+905..."
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Adres</Form.Label>
          <Form.Control
            name="adres_detay"
            value={formData.adres_detay}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Şehir</Form.Label>
          <Form.Control
            name="sehir"
            value={formData.sehir}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>İlçe</Form.Label>
          <Form.Control
            name="ilce"
            value={formData.ilce}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Posta Kodu</Form.Label>
          <Form.Control
            name="posta_kodu"
            value={formData.posta_kodu}
            onChange={handleChange}
            maxLength="5"
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Kaydet ve Devam Et'}
        </Button>
      </Form>
    </Container>
  );
};

export default UserInfoPage;
