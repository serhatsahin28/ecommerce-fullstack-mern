// src/pages/tr/EksikBilgiForm.jsx
import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const FormCompletion = () => {
    const [formData, setFormData] = useState({
        ad: '',
        soyad: '',
        email: '',
        telefon: '',
        tcKimlikNo: '',
        adres_detay: '',
        sehir: '',
        ilce: '',
        posta_kodu: ''
    });
    for (const [key, value] of Object.entries(formData)) {
        if (!value || value.trim() === '') {
            setError('Lütfen tüm alanları eksiksiz doldurun.');
            setLoading(false);
            return;
        }
    }

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/user/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const user = await res.json();

            setFormData({
                ad: user.ad || '',
                soyad: user.soyad || '',
                email: user.email || '',
                telefon: user.telefon || '',
                tcKimlikNo: user.tcKimlikNo || '',
                adres_detay: user.adresler?.[0]?.adres_detay || '',
                sehir: user.adresler?.[0]?.sehir || '',
                ilce: user.adresler?.[0]?.ilce || '',
                posta_kodu: user.adresler?.[0]?.posta_kodu || ''
            });
        };

        fetchUser();
    }, []);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Zorunlu alan kontrolü
        for (const [key, value] of Object.entries(formData)) {
            if (!value || value.trim() === '') {
                setError('Lütfen tüm alanları eksiksiz doldurun.');
                setLoading(false);
                return;
            }
        }

        const token = localStorage.getItem('token');
        const res = await fetch('/api/user/update-info', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            navigate('/tr/sepet'); // tekrar sepete döner ve ödeme devam eder
        } else {
            setError('Bilgiler güncellenemedi.');
        }

        setLoading(false);
    };

    return (
        <Container className="py-5">
            <h2 className="mb-4">Eksik Bilgilerinizi Tamamlayın</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Ad</Form.Label>
                    <Form.Control name="ad" value={formData.ad} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Soyad</Form.Label>
                    <Form.Control name="soyad" value={formData.soyad} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>E-posta</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Telefon</Form.Label>
                    <Form.Control name="telefon" value={formData.telefon} onChange={handleChange} placeholder="+905..." required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>TC Kimlik No</Form.Label>
                    <Form.Control name="tcKimlikNo" value={formData.tcKimlikNo} onChange={handleChange} maxLength="11" required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Adres</Form.Label>
                    <Form.Control name="adres_detay" value={formData.adres_detay} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Şehir</Form.Label>
                    <Form.Control name="sehir" value={formData.sehir} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>İlçe</Form.Label>
                    <Form.Control name="ilce" value={formData.ilce} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Posta Kodu</Form.Label>
                    <Form.Control name="posta_kodu" value={formData.posta_kodu} onChange={handleChange} maxLength="5" required />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Kaydediliyor...' : 'Devam Et'}
                </Button>
            </Form>
        </Container>
    );
};

export default FormCompletion;
