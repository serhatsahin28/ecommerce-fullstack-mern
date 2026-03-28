import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import axios from 'axios';

const ProfileTR = () => {
  const [kullanici, setKullanici] = useState({
    ad: '',
    soyad: '',
    email: '',
    sifre: '',
    telefon: '',
    adresler: [],
    odeme_yontemleri: []
  });

  const [yeniAdres, setYeniAdres] = useState({
    adres_tipi: '',
    ulke: '',
    sehir: '',
    ilce: '',
    posta_kodu: '',
    adres_detay: ''
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const kullaniciBilgileriniGetir = async () => {
      try {
        const token = localStorage.getItem('token');
        const yanit = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setKullanici({
          ad: yanit.data.ad || '',
          soyad: yanit.data.soyad || '',
          email: yanit.data.email || '',
          sifre: '',
          telefon: yanit.data.telefon || '',
          adresler: yanit.data.adresler || [],
          odeme_yontemleri: yanit.data.odeme_yontemleri || []
        });

      } catch (err) {
        console.error('Profil verisi alınamadı:', err);
      }
    };

    kullaniciBilgileriniGetir();
  }, []);

  const handleDegisim = (e) => {
    setKullanici((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleYeniAdresDegisim = (e) => {
    setYeniAdres((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const bilgileriGuncelle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/profile/update', kullanici, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profil bilgileri başarıyla güncellendi.');
    } catch (err) {
      alert('Güncelleme sırasında bir hata oluştu.');
      console.error('Güncelleme hatası:', err);
    }
  };

  const yeniAdresiEkle = () => {
    setKullanici((prev) => ({
      ...prev,
      adresler: [...prev.adresler, yeniAdres]
    }));
    setYeniAdres({
      adres_tipi: '',
      ulke: '',
      sehir: '',
      ilce: '',
      posta_kodu: '',
      adres_detay: ''
    });
    setShowModal(false);
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h4 className="mb-4 text-center text-danger">Profil Bilgileri</h4>
          <Form onSubmit={bilgileriGuncelle}>
            <Row className="mb-3">
              <Col>
                <Form.Label>Ad</Form.Label>
                <Form.Control type="text" name="ad" value={kullanici.ad} onChange={handleDegisim} required />
              </Col>
              <Col>
                <Form.Label>Soyad</Form.Label>
                <Form.Control type="text" name="soyad" value={kullanici.soyad} onChange={handleDegisim} required />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>E-posta</Form.Label>
              <Form.Control type="email" name="email" value={kullanici.email} onChange={handleDegisim} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Yeni Şifre</Form.Label>
              <Form.Control type="password" name="sifre" value={kullanici.sifre} onChange={handleDegisim} placeholder="Yeni şifre (zorunlu değil)" />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Telefon</Form.Label>
              <Form.Control type="tel" name="telefon" value={kullanici.telefon} onChange={handleDegisim} />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100">Bilgileri Güncelle</Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Adresler */}
      <h5 className="mb-3">Adres Bilgileri</h5>
      <Row>
        {kullanici.adresler.map((adres, index) => (
          <Col md={6} key={index}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{adres.adres_tipi}</Card.Title>
                <Card.Text>
                  {adres.adres_detay}<br />
                  {adres.ilce}, {adres.sehir}, {adres.ulke} - {adres.posta_kodu}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Button variant="outline-primary" className="mb-4" onClick={() => setShowModal(true)}>
        + Yeni Adres Ekle
      </Button>

      {/* Ödeme Bilgileri */}
      <h5 className="mb-3">Kayıtlı Kartlar</h5>
      <Row>
        {kullanici.odeme_yontemleri.map((kart, index) => (
          <Col md={6} key={index}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{kart.kart_tipi} ({kart.yontem})</Card.Title>
                <Card.Text>Kart Numarası: {kart.kart_numarasi}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Yeni Adres Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Yeni Adres Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {['adres_tipi', 'ulke', 'sehir', 'ilce', 'posta_kodu', 'adres_detay'].map((field) => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label>{field.replace('_', ' ').toUpperCase()}</Form.Label>
                <Form.Control
                  type="text"
                  name={field}
                  value={yeniAdres[field]}
                  onChange={handleYeniAdresDegisim}
                  required
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>İptal</Button>
          <Button variant="primary" onClick={yeniAdresiEkle}>Kaydet</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProfileTR;
