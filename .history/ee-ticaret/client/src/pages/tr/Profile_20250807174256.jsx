import React, { useState, useEffect } from 'react';
import {
  Container, Card, Form, Button, Row, Col,
  Modal, Badge, ListGroup, Tab, Tabs, Alert
} from 'react-bootstrap';
import axios from 'axios';

const ProfileTR = () => {
  const [kullanici, setKullanici] = useState({
    ad: '',
    soyad: '',
    email: '',
    sifre: '',
    telefon: '',
    adresler: [],
    odeme_yontemleri: [],
    bildirim_tercihleri: {},
    guvenlik: {}
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState(null); // Düzenleme/silme için seçilen adres

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newAddress, setNewAddress] = useState({
    adres_ismi: '',
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: '',
    varsayilan: false
  });

  const [newPayment, setNewPayment] = useState({
    kart_tipi: 'Visa',
    kart_numarasi: '',
    kart_ismi: '',
    son_kullanma: '',
    cvv: '',
    varsayilan: false
  });

  // Profil verisini getiren hook
  useEffect(() => {
    const kullaniciBilgileriniGetir = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Token yoksa işlem yapma, belki login sayfasına yönlendirilebilir.
          return;
        }
        const yanit = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Gelen veride eksik alan varsa diye kontrol ekliyoruz.
        setKullanici({
          ad: yanit.data.ad || '',
          soyad: yanit.data.soyad || '',
          email: yanit.data.email || '',
          sifre: '',
          telefon: yanit.data.telefon || '',
          adresler: yanit.data.adresler || [],
          odeme_yontemleri: yanit.data.odeme_yontemleri || [],
          bildirim_tercihleri: yanit.data.bildirim_tercihleri || {},
          guvenlik: yanit.data.guvenlik || {}
        });
      } catch (err) {
        console.error('Profil verisi alınamadı:', err);
        setError('Profil bilgileri yüklenirken bir hata oluştu.');
      }
    };

    kullaniciBilgileriniGetir();
  }, []);

  // Mesajları temizlemek için bir yardımcı fonksiyon
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  }

  // Form inputları için genel state değiştirici
  const handleDegisim = (e) => {
    setKullanici(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Adres formu inputları için state değiştirici
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Ödeme formu inputları için state değiştirici
  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPayment(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Temel profil bilgilerini güncelleme
  const bilgileriGuncelle = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const guncellenecekVeri = {
        ad: kullanici.ad,
        soyad: kullanici.soyad,
        email: kullanici.email,
        telefon: kullanici.telefon,
      };
      if (kullanici.sifre) {
        guncellenecekVeri.password = kullanici.sifre;
      }
      await axios.put('http://localhost:5000/profile/update', guncellenecekVeri, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKullanici(prev => ({ ...prev, sifre: '' })); // Güvenlik için şifre alanını temizle
      setSuccess('Profil bilgileri başarıyla güncellendi.');
    } catch (err) {
      console.error('Profil güncelleme hatası:', err.response || err);
      setError(err.response?.data?.message || 'Güncelleme sırasında bir hata oluştu.');
    }
  };

  // Yeni adres ekleme
  const adresEkle = async () => {
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const yanit = await axios.post('http://localhost:5000/address/add', newAddress, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // State'i, API'dan dönen yeni adres ile güncelle (Daha verimli!)
      setKullanici(prev => ({
        ...prev,
        adresler: [...prev.adresler, yanit.data.address]
      }));

      setShowAddressModal(false);
      setNewAddress({
        adres_ismi: '', adres_detay: '', sehir: '',
        ilce: '', posta_kodu: '', varsayilan: false
      });
      setSuccess('Adres başarıyla eklendi.');
    } catch (err) {
      console.error('Adres ekleme hatası:', err.response || err);
      setError(err.response?.data?.message || 'Adres eklenirken bilinmeyen bir hata oluştu.');
    }
  };

  // Mevcut adresi düzenlemek için modal'ı açan fonksiyon
  const handleEditAddress = (address) => {
    setSelectedAddress({
      ...address,
      id: address._id || address.id // Hem _id hem id desteği
    });

    setNewAddress({
      adres_ismi: address.adres_ismi,
      adres_detay: address.adres_detay,
      sehir: address.sehir,
      ilce: address.ilce,
      posta_kodu: address.posta_kodu,
      varsayilan: address.varsayilan
    });

    setShowEditAddressModal(true);
  };

  // Mevcut adresi güncelleme
  const adresGuncelle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/address/update/${selectedAddress.id}`,
        newAddress,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // State'i güncelle
      setKullanici(prev => ({
        ...prev,
        adresler: prev.adresler.map(adr =>
          adr.id === selectedAddress.id || adr._id === selectedAddress.id
            ? response.data.address
            : adr
        )
      }));

      setShowEditAddressModal(false);
      setSuccess('Adres başarıyla güncellendi');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Adres güncellenirken hata oluştu');
      console.error('Adres güncelleme hatası:', err);
    }
  };

  // BONUS: Adres silme fonksiyonu
  const adresSil = async (address) => {
    if (!window.confirm('Bu adresi silmek istediğinize emin misiniz?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/address/delete/${address._id || address.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // State'i güvenli şekilde güncelle
      setKullanici(prev => {
        const yeniAdresler = prev.adresler.filter(a =>
          a._id !== (address._id || address.id)
        );

        return {
          ...prev,
          adresler: yeniAdresler
        };
      });

      setSuccess('Adres başarıyla silindi');
    } catch (err) {
      setError('Adres silinirken hata oluştu');
    }
  };
  // Ödeme yöntemi ekleme (Şimdilik mock)
  const kartEkle = () => {
    setKullanici(prev => ({
      ...prev,
      odeme_yontemleri: [...prev.odeme_yontemleri, {
        kart_tipi: newPayment.kart_tipi,
        kart_numarasi: `**** **** **** ${newPayment.kart_numarasi.slice(-4)}`
      }]
    }));
    setShowPaymentModal(false);
  };

  // Bileşenin render kısmı
  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-gradient">Profilim</h1>
        <p className="text-muted">Kişisel bilgilerinizi ve tercihlerinizi yönetin</p>
      </div>

      {error && <Alert variant="danger" onClose={clearMessages} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={clearMessages} dismissible>{success}</Alert>}

      <Tabs defaultActiveKey="profile" id="profile-tabs" className="mb-4 custom-tabs">

        {/* === Profil Bilgileri Sekmesi === */}
        <Tab eventKey="profile" title="Profil Bilgileri">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h4 className="mb-4 text-danger">Kişisel Bilgiler</h4>
              <Form onSubmit={bilgileriGuncelle}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ad</Form.Label>
                      <Form.Control type="text" name="ad" value={kullanici.ad} onChange={handleDegisim} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Soyad</Form.Label>
                      <Form.Control type="text" name="soyad" value={kullanici.soyad} onChange={handleDegisim} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>E-posta</Form.Label>
                      <Form.Control type="email" name="email" value={kullanici.email} onChange={handleDegisim} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Telefon</Form.Label>
                      <Form.Control type="tel" name="telefon" value={kullanici.telefon} onChange={handleDegisim} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label>Yeni Şifre</Form.Label>
                  <Form.Control type="password" name="sifre" value={kullanici.sifre} onChange={handleDegisim} placeholder="Değiştirmek istemiyorsanız boş bırakın" />
                </Form.Group>
                <Button variant="danger" type="submit" className="w-100 py-2 fw-bold">Bilgileri Güncelle</Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        {/* === Adreslerim Sekmesi === */}
        <Tab eventKey="address" title="Adreslerim">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-danger mb-0">Adreslerim</h4>
                <Button variant="danger" onClick={() => setShowAddressModal(true)}>
                  <i className="fas fa-plus me-2"></i> Yeni Adres Ekle
                </Button>
              </div>
              {kullanici.adresler.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                  <h5>Kayıtlı adresiniz bulunmamaktadır</h5>
                  <p className="text-muted">Yeni adres eklemek için butona tıklayın</p>
                </div>
              ) : (
                <Row>
                  {kullanici.adresler.map((adres) => (
                    <Col md={6} className="mb-4" key={adres._id || adres.id}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
                          <span>{adres.adres_ismi}</span>
                          {adres.varsayilan && <Badge bg="light" text="dark">Varsayılan</Badge>}
                        </Card.Header>
                        <Card.Body>
                          <ListGroup variant="flush">
                            <ListGroup.Item><b>Adres:</b> {adres.adres_detay}</ListGroup.Item>
                            <ListGroup.Item><b>İlçe/Şehir:</b> {adres.ilce} / {adres.sehir}</ListGroup.Item>
                            <ListGroup.Item><b>Posta Kodu:</b> {adres.posta_kodu}</ListGroup.Item>
                          </ListGroup>
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-end bg-light">
                          <Button variant="outline-danger" size="sm" className="me-2" onClick={() => handleEditAddress(adres)}>
                            <i className="fas fa-edit me-1"></i> Düzenle
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => adresSil(adres)}
                          >
                            <i className="fas fa-trash me-1"></i> Sil
                          </Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* === Ödeme Yöntemleri Sekmesi === */}
        <Tab eventKey="payment" title="Ödeme Yöntemleri">
          {/* Bu sekme şimdilik aynı kalabilir. */}
          <p>Ödeme yöntemleri bölümü yapım aşamasındadır.</p>
        </Tab>
      </Tabs>

      {/* === YENİ ADRES EKLEME MODAL === */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} size="lg">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Yeni Adres Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Form alanları aynı kalabilir, validasyon için `required` eklenebilir. */}
            <Form.Group className="mb-3"><Form.Label>Adres İsmi</Form.Label><Form.Control type="text" name="adres_ismi" value={newAddress.adres_ismi} onChange={handleAddressChange} required placeholder="Örn: Ev Adresim" /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Adres Detayı</Form.Label><Form.Control as="textarea" rows={3} name="adres_detay" value={newAddress.adres_detay} onChange={handleAddressChange} required placeholder="Cadde, sokak, no, daire..." /></Form.Group>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Şehir</Form.Label><Form.Control type="text" name="sehir" value={newAddress.sehir} onChange={handleAddressChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>İlçe</Form.Label><Form.Control type="text" name="ilce" value={newAddress.ilce} onChange={handleAddressChange} required /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Posta Kodu</Form.Label><Form.Control type="text" name="posta_kodu" value={newAddress.posta_kodu} onChange={handleAddressChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group className="mt-4"><Form.Check type="checkbox" name="varsayilan" checked={newAddress.varsayilan} onChange={handleAddressChange} label="Varsayılan adres yap" /></Form.Group></Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>İptal</Button>
          <Button variant="danger" onClick={adresEkle}>Adresi Kaydet</Button>
        </Modal.Footer>
      </Modal>

      {/* === ADRES DÜZENLEME MODAL === */}
      <Modal show={showEditAddressModal} onHide={() => setShowEditAddressModal(false)} size="lg">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Adresi Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Adres İsmi</Form.Label><Form.Control type="text" name="adres_ismi" value={newAddress.adres_ismi} onChange={handleAddressChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Adres Detayı</Form.Label><Form.Control as="textarea" rows={3} name="adres_detay" value={newAddress.adres_detay} onChange={handleAddressChange} required /></Form.Group>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Şehir</Form.Label><Form.Control type="text" name="sehir" value={newAddress.sehir} onChange={handleAddressChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>İlçe</Form.Label><Form.Control type="text" name="ilce" value={newAddress.ilce} onChange={handleAddressChange} required /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Posta Kodu</Form.Label><Form.Control type="text" name="posta_kodu" value={newAddress.posta_kodu} onChange={handleAddressChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group className="mt-4"><Form.Check type="checkbox" name="varsayilan" checked={newAddress.varsayilan} onChange={handleAddressChange} label="Varsayılan adres yap" /></Form.Group></Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditAddressModal(false)}>İptal</Button>
          <Button variant="danger" onClick={adresGuncelle}>Değişiklikleri Kaydet</Button>
        </Modal.Footer>
      </Modal>

      {/* Style bloğu aynı kalabilir */}
      <style jsx global>{`
        .text-gradient {
          background: linear-gradient(to right, #dc3545, #6c757d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .custom-tabs .nav-link {
          font-weight: 500; color: #6c757d; border: none; border-bottom: 3px solid transparent; padding: 0.75rem 1.5rem;
        }
        .custom-tabs .nav-link.active {
          color: #dc3545; border-bottom: 3px solid #dc3545; background-color: transparent;
        }
        /* İhtiyaç halinde stil eklenebilir */
      `}</style>
    </Container>
  );
};

export default ProfileTR;