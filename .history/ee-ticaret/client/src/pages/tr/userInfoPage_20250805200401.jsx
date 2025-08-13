import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner } from 'react-bootstrap';

const UserInfoPage = () => {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Kullanıcı bilgisi alınamadı');

        const user = await res.json();

        setUserInfo({
          ad: user.ad || '',
          soyad: user.soyad || '',
          email: user.email || '',
          telefon: user.telefon || '',
          adres_detay: user.adresler?.[0]?.adres_detay || '',
          sehir: user.adresler?.[0]?.sehir || '',
          ilce: user.adresler?.[0]?.ilce || '',
          posta_kodu: user.adresler?.[0]?.posta_kodu || ''
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:5000/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userInfo)
      });

      if (!res.ok) throw new Error('Güncelleme başarısız');

      alert('Bilgileriniz kaydedildi!');
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
      <h1 className="mb-4">Kullanıcı Bilgileriniz</h1>
      <Form>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Ad</Form.Label>
              <Form.Control
                type="text"
                name="ad"
                value={userInfo.ad}
                onChange={handleChange}
                readOnly={!!userInfo.ad}
                placeholder="Adınızı giriniz"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Soyad</Form.Label>
              <Form.Control
                type="text"
                name="soyad"
                value={userInfo.soyad}
                onChange={handleChange}
                readOnly={!!userInfo.soyad}
                placeholder="Soyadınızı giriniz"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userInfo.email}
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Telefon</Form.Label>
              <Form.Control
                type="text"
                name="telefon"
                value={userInfo.telefon}
                onChange={handleChange}
                readOnly={!!userInfo.telefon}
                placeholder="Telefon giriniz"
              />
            </Form.Group>
          </Col>
        </Row>

     

        <h5 className="mt-4">Adres Bilgileri</h5>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Adres Detay</Form.Label>
              <Form.Control
                type="text"
                name="adres_detay"
                value={userInfo.adres_detay}
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
                value={userInfo.sehir}
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
                value={userInfo.ilce}
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
                value={userInfo.posta_kodu}
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
