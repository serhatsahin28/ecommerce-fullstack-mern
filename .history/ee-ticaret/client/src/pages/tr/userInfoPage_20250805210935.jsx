import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const UserInfoPage = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [adres, setAdres] = useState({
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: ''
  });
  const [errorMessages, setErrorMessages] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserAdres = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Adres bilgisi alınamadı');

        const user = await res.json();
        const ilkAdres = user.adresler?.[0] || {};
        setAdres({
          adres_detay: ilkAdres.adres_detay || '',
          sehir: ilkAdres.sehir || '',
          ilce: ilkAdres.ilce || '',
          posta_kodu: ilkAdres.posta_kodu || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAdres();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdres(prev => ({ ...prev, [name]: value }));
  };

  // Boşluk içeren alanları bul
  const getSpacesInFields = () => {
    const errors = [];
    Object.entries(adres).forEach(([key, value]) => {
      if (value.includes(' ')) {
        errors.push(`${key} alanı boşluk içeremez.`);
      }
    });
    return errors;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errors = getSpacesInFields();
    if (errors.length > 0) {
      setErrorMessages(errors);
      return;
    }
    setErrorMessages([]);
    setShowModal(true);
  };

  const saveAddress = async () => {
    try {
      const res = await fetch('http://localhost:5000/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adres)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Adres güncelleme başarısız');
      }

      alert('Adres bilgileriniz başarıyla kaydedildi!');
    } catch (err) {
      alert(`Bir hata oluştu: ${err.message}`);
    }
  };

  const handleConfirmSave = async () => {
    setShowModal(false);
    await saveAddress();
    navigateToPayment();
  };

  const handleCancelSave = () => {
    setShowModal(false);
    navigateToPayment();
  };

  const navigateToPayment = () => {
    localStorage.setItem('userAddress', JSON.stringify(adres));
    navigate('/tr/pay');
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

      {errorMessages.length > 0 && (
        <Alert variant="danger">
          {errorMessages.map((msg, i) => <div key={i}>{msg}</div>)}
        </Alert>
      )}

      <Form onSubmit={handleSave}>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Adres Detay</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="adres_detay"
                value={adres.adres_detay}
                onChange={handleChange}
                placeholder="Mahalle, sokak, kapı no vb."
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
                placeholder="Örn: İstanbul"
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
                placeholder="Örn: Kadıköy"
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
                placeholder="Örn: 34710"
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit">
          Devam Et
        </Button>
      </Form>

      <Modal show={showModal} onHide={handleCancelSave} centered>
        <Modal.Header closeButton>
          <Modal.Title>Adres Bilgilerini Kaydet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Girdiğiniz adres bilgilerini kaydetmek istiyor musunuz?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelSave}>
            Hayır, Kaydetme
          </Button>
          <Button variant="primary" onClick={handleConfirmSave}>
            Evet, Kaydet
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserInfoPage;
