import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Modal, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const UserInfoPage = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    adres_ismi: '',
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Token'ı localStorage'dan alıyoruz.
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserAdres = async () => {
      // Eğer token yoksa, fetch işlemi yapmaya gerek yok.
      if (!token) {
        setLoading(false);
        console.log("Kullanıcı girişi yapılmamış.");
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Adres bilgisi alınamadı');
        
        const user = await res.json();
        
        // Kullanıcının adreslerini al
        if (user.adresler && user.adresler.length > 0) {
          setAddresses(user.adresler);
          setSelectedAddress(user.adresler[0]); // İlk adresi seç
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAdres();
  }, [token]);

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata mesajını temizle
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Yeni adres validation
  const validateNewAddress = () => {
    const errors = {};
    
    if (!newAddress.adres_ismi.trim()) {
      errors.adres_ismi = 'Adres ismi boş olamaz';
    }
    if (!newAddress.adres_detay.trim()) {
      errors.adres_detay = 'Adres detayı boş olamaz';
    }
    if (!newAddress.sehir.trim()) {
      errors.sehir = 'Şehir boş olamaz';
    }
    if (!newAddress.ilce.trim()) {
      errors.ilce = 'İlçe boş olamaz';
    }
    if (!newAddress.posta_kodu.trim()) {
      errors.posta_kodu = 'Posta kodu boş olamaz';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Yeni adres kaydetme
  const saveNewAddress = async () => {
    if (!validateNewAddress()) {
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Adres ekleme başarısız');
      }

      const result = await res.json();
      
      // Yeni adresi listeye ekle
      setAddresses(prev => [...prev, result.address]);
      
      // Modalı kapat ve formu temizle
      setShowAddModal(false);
      setNewAddress({
        adres_ismi: '',
        adres_detay: '',
        sehir: '',
        ilce: '',
        posta_kodu: ''
      });
      setValidationErrors({});
      
      alert('Yeni adres başarıyla eklendi!');
    } catch (err) {
      console.error(err);
      alert(`Bir hata oluştu: ${err.message}`);
    }
  };

  // Adres seçme
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  // Devam et butonuna tıklandığında
  const handleContinue = () => {
    if (selectedAddress) {
      // Seçilen adresi localStorage'a kaydet
      localStorage.setItem('userAddress', JSON.stringify(selectedAddress));
      navigate('/tr/pay');
    } else {
      alert('Lütfen bir adres seçin veya yeni adres ekleyin.');
    }
  };

  // Yeni adres ekleme modalını aç
  const handleAddNewAddress = () => {
    setShowAddModal(true);
  };

  // Yeni adres modalını kapat
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewAddress({
      adres_ismi: '',
      adres_detay: '',
      sehir: '',
      ilce: '',
      posta_kodu: ''
    });
    setValidationErrors({});
  };

  // Kaydetmeden devam et
  const handleContinueWithoutSaving = () => {
    setShowAddModal(false);
    localStorage.setItem('userAddress', JSON.stringify(newAddress));
    navigate('/tr/pay');
  };

  // Eğer veriler yükleniyorsa Spinner göster
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
      
      {/* Mevcut Adresler */}
      {addresses.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-3">Kayıtlı Adresleriniz</h5>
          <Row>
            {addresses.map((address, index) => (
              <Col md={6} key={index} className="mb-3">
                <Card 
                  className={`cursor-pointer ${selectedAddress === address ? 'border-primary' : ''}`}
                  onClick={() => handleAddressSelect(address)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body>
                    <Card.Title>{address.adres_ismi || `Adres ${index + 1}`}</Card.Title>
                    <Card.Text>
                      <strong>Adres:</strong> {address.adres_detay}<br />
                      <strong>Şehir:</strong> {address.sehir}<br />
                      <strong>İlçe:</strong> {address.ilce}<br />
                      <strong>Posta Kodu:</strong> {address.posta_kodu}
                    </Card.Text>
                    {selectedAddress === address && (
                      <div className="text-primary">
                        <small>✓ Seçildi</small>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Adres Ekleme Butonu */}
      <div className="mb-4">
        <Button variant="outline-primary" onClick={handleAddNewAddress}>
          + Yeni Adres Ekle
        </Button>
      </div>

      {/* Devam Et Butonu */}
      <Button 
        variant="primary" 
        onClick={handleContinue}
        disabled={!selectedAddress}
        size="lg"
      >
        Devam Et
      </Button>

      {/* Yeni Adres Ekleme Modal'ı */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Yeni Adres Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Adres İsmi *</Form.Label>
                  <Form.Control
                    type="text"
                    name="adres_ismi"
                    value={newAddress.adres_ismi}
                    onChange={handleNewAddressChange}
                    placeholder="Örn: Ev Adresi, İş Adresi"
                    isInvalid={!!validationErrors.adres_ismi}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.adres_ismi}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Adres Detay *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="adres_detay"
                    value={newAddress.adres_detay}
                    onChange={handleNewAddressChange}
                    placeholder="Mahalle, sokak, kapı no vb."
                    isInvalid={!!validationErrors.adres_detay}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.adres_detay}
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
                    value={newAddress.sehir}
                    onChange={handleNewAddressChange}
                    placeholder="Örn: İstanbul"
                    isInvalid={!!validationErrors.sehir}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.sehir}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>İlçe *</Form.Label>
                  <Form.Control
                    type="text"
                    name="ilce"
                    value={newAddress.ilce}
                    onChange={handleNewAddressChange}
                    placeholder="Örn: Kadıköy"
                    isInvalid={!!validationErrors.ilce}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.ilce}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Posta Kodu *</Form.Label>
                  <Form.Control
                    type="text"
                    name="posta_kodu"
                    value={newAddress.posta_kodu}
                    onChange={handleNewAddressChange}
                    placeholder="Örn: 34710"
                    isInvalid={!!validationErrors.posta_kodu}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.posta_kodu}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleContinueWithoutSaving}>
            Kaydetmeden Devam Et
          </Button>
          <Button variant="primary" onClick={saveNewAddress}>
            Kaydet ve Devam Et
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserInfoPage;