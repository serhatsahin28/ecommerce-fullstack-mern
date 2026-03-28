import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner } from 'react-bootstrap';

const UserInfoPage = () => {
  const [loading, setLoading] = useState(true);
  const [adres, setAdres] = useState({
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserAdres = async () => {
      try {
        const res = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Adres bilgisi alınamadı');
        const user = await res.json();

        // İlk adres varsa al, yoksa boş bırak
        const ilkAdres = user.adresler?.[0] || {};

        setAdres({
          adres_detay: ilkAdres.adres_detay || '',
          sehir: ilkAdres.sehir || '',
          ilce: ilkAdres.ilce || '',
          posta_kodu: ilkAdres.posta_kodu || ''
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchUserAdres();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdres(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const confirmSave = window.confirm('Adres bilgisi kaydedilsin mi?');
      if (!confirmSave) {
        alert('Adres kaydedilmedi.');
        return;
      }

      const res = await fetch('http://localhost:5000/profile/update-address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adres)
      });

      if (!res.ok) throw new Error('Adres güncelleme başarısız');

      alert('Adres bilgileriniz kaydedildi!');
    } catch (err) {
      console.error(err);
      alert('Bir hata oluştu');
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
      <h1 className="mb-4">Adres Bilgileriniz</h1>
      <Form>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Adres Detay</Form.Label>
              <Form.Control
                type="text"
                name="adres_detay"
                value={adres.adres_detay}
                onChange={handleChange}
                placeholder="Adresinizi giriniz"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Şehir</Form.Label>
              <Form.Control
                type="text"
                name="sehir"
                value={adres.sehir}
                onChange={handleChange}
                placeholder="Şehir"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>İlçe</Form.Label>
              <Form.Control
                type="text"
                name="ilce"
                value={adres.ilce}
                onChange={handleChange}
                placeholder="İlçe"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Posta Kodu</Form.Label>
              <Form.Control
                type="text"
                name="posta_kodu"
                value={adres.posta_kodu}
                onChange={handleChange}
                placeholder="Posta Kodu"
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" onClick={handleSave}>
          Kaydet
        </Button>
      </Form>
    </Container>
  );
};

export default UserInfoPage;
