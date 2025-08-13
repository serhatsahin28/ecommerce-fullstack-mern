import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Modal, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const UserInfoPage = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({
    adres_ismi: '',
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUserData();
  }, [token]);

  const fetchUserData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const user = await res.json();
        if (user.adresler && user.adresler.length > 0) {
          setAddresses(user.adresler);
          setSelectedAddress(user.adresler[0]);
        }
      }
    } catch (err) {
      console.error('Kullanıcı bilgileri alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.adres_ismi.trim()) {
      newErrors.adres_ismi = 'Adres ismi zorunludur';
    }
    if (!formData.adres_detay.trim()) {
      newErrors.adres_detay = 'Adres detayı zorunludur';
    }
    if (!formData.sehir.trim()) {
      newErrors.sehir = 'Şehir zorunludur';
    }
    if (!formData.ilce.trim()) {
      newErrors.ilce = 'İlçe zorunludur';
    }
    if (!formData.posta_kodu.trim()) {
      newErrors.posta_kodu = 'Posta kodu zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handleAddNewAddress = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      adres_ismi: '',
      adres_detay: '',
      sehir: '',
      ilce: '',
      posta_kodu: ''
    });
    setErrors({});
  };

  const saveAddress = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Mevcut backend yapınıza uygun endpoint kullanıyoruz
      // Backend'inizde çalışan endpoint'i buraya yazın
      const endpoints = [
        { url: 'http://localhost:5000/profile/update', method: 'PUT' },
        { url: 'http://localhost:5000/api/profile/update', method: 'PUT' },
        { url: 'http://localhost:5000/profile', method: 'PUT' }
      ];

      let success = false;
      
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formData)
          });

          if (res.status === 404) continue;

          if (res.ok) {
            success = true;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (success) {
        await fetchUserData(); // Listeyi yenile
        closeModal();
        alert('Adres başarıyla eklendi!');
      } else {
        throw new Error('Adres kaydedilemedi');
      }
    } catch (err) {
      console.error('Adres kaydetme hatası:', err);
      alert('Adres kaydedilirken hata oluştu: ' + err.message);
    }
  };

  const continueWithoutSaving = () => {
    if (!validateForm()) {
      return;
    }
    
    localStorage.setItem('userAddress', JSON.stringify(formData));
    navigate('/tr/pay');
  };

  const handleContinue = () => {
    if (selectedAddress) {
      localStorage.setItem('userAddress', JSON.stringify(selectedAddress));
      navigate('/tr/pay');
    } else {
      alert('Lütfen bir adres seçin veya yeni adres ekleyin.');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Yükleniyor...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1>Teslimat Adresinizi Seçin</h1>
        <p className="text-muted">Siparişinizin teslim edileceği adresi seçin veya yeni adres ekleyin</p>
      </div>

      {/* Mevcut Adresler */}
      {addresses.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-3">Kayıtlı Adresleriniz</h4>
          <Row>
            {addresses.map((address, index) => (
              <Col md={6} lg={4} key={index} className="mb-3">
                <Card 
                  className={`h-100 cursor-pointer border-2 ${
                    selectedAddress === address ? 'border-primary bg-light' : 'border-light'
                  }`}
                  onClick={() => handleAddressSelect(address)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0 text-primary">
                        {address.adres_ismi || `Adres ${index + 1}`}
                      </Card.Title>
                      {selectedAddress === address && (
                        <div className="text-primary">
                          <i className="fas fa-check-circle"></i>
                        </div>
                      )}
                    </div>
                    <Card.Text className="text-muted small">
                      <div><strong>Adres:</strong> {address.adres_detay}</div>
                      <div><strong>Şehir/İlçe:</strong> {address.sehir}, {address.ilce}</div>
                      <div><strong>Posta Kodu:</strong> {address.posta_kodu}</div>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Yeni Adres Ekleme */}
      <div className="text-center mb-4">
        <Button 
          variant="outline-primary" 
          size="lg"
          onClick={handleAddNewAddress}
          className="me-3"
        >
          + Yeni Adres Ekle
        </Button>
        
        {addresses.length > 0 && selectedAddress && (
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleContinue}
          >
            Seçili Adresle Devam Et
          </Button>
        )}
      </div>

      {addresses.length === 0 && (
        <div className="text-center text-muted">
          <p>Henüz kayıtlı adresiniz bulunmuyor.</p>
          <p>Devam etmek için yeni adres ekleyin.</p>
        </div>
      )}

      {/* Yeni Adres Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Yeni Adres Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Adres İsmi *</Form.Label>
                  <Form.Control
                    type="text"
                    name="adres_ismi"
                    value={formData.adres_ismi}
                    onChange={handleInputChange}
                    placeholder="Örn: Ev Adresi, İş Adresi"
                    isInvalid={!!errors.adres_ismi}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.adres_ismi}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Adres Detayı *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="adres_detay"
                    value={formData.adres_detay}
                    onChange={handleInputChange}
                    placeholder="Mahalle, sokak, bina no, daire no"
                    isInvalid={!!errors.adres_detay}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.adres_detay}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Şehir *</Form.Label>
                  <Form.Control
                    type="text"
                    name="sehir"
                    value={formData.sehir}
                    onChange={handleInputChange}
                    placeholder="İstanbul"
                    isInvalid={!!errors.sehir}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.sehir}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>İlçe *</Form.Label>
                  <Form.Control
                    type="text"
                    name="ilce"
                    value={formData.ilce}
                    onChange={handleInputChange}
                    placeholder="Kadıköy"
                    isInvalid={!!errors.ilce}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ilce}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Posta Kodu *</Form.Label>
                  <Form.Control
                    type="text"
                    name="posta_kodu"
                    value={formData.posta_kodu}
                    onChange={handleInputChange}
                    placeholder="34710"
                    isInvalid={!!errors.posta_kodu}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.posta_kodu}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={continueWithoutSaving}>
            Kaydetmeden Devam Et
          </Button>
          <Button variant="primary" onClick={saveAddress}>
            Kaydet ve Devam Et
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserInfoPage;