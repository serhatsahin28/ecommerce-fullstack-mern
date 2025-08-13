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
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newAddress, setNewAddress] = useState({
    adres_ismi: '', adres_detay: '', sehir: '',
    ilce: '', posta_kodu: '', varsayilan: false
  });

  const [newPayment, setNewPayment] = useState({
    kart_tipi: 'Visa', kart_numarasi: '', kart_ismi: '',
    son_kullanma: '', cvv: '', varsayilan: false
  });

  // Profil verisini getiren hook
  useEffect(() => {
    const kullaniciBilgileriniGetir = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Lütfen giriş yapınız.');
          return;
        }
        const yanit = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setKullanici({
          ...yanit.data,
          sifre: '' // Şifre alanını güvenlik için boş bırak
        });
      } catch (err) {
        console.error('Profil verisi alınamadı:', err.response || err);
        setError('Profil bilgileri yüklenirken bir hata oluştu.');
      }
    };
    kullaniciBilgileriniGetir();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleDegisim = (e) => setKullanici(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPayment(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // 1. Temel profil bilgilerini güncelleme (Endpoint düzeltildi)
  const bilgileriGuncelle = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const guncellenecekVeri = {
        ad: kullanici.ad, soyad: kullanici.soyad,
        email: kullanici.email, telefon: kullanici.telefon,
      };
      
      if (kullanici.sifre && kullanici.sifre.trim() !== '') {
        guncellenecekVeri.password = kullanici.sifre;
      }

      await axios.put('http://localhost:5000/profile/update', guncellenecekVeri, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setKullanici(prev => ({ ...prev, sifre: '' }));
      setSuccess('Profil bilgileri başarıyla güncellendi.');
    } catch (err) {
      console.error('Profil güncelleme hatası:', err.response || err);
      setError(err.response?.data?.message || 'Güncelleme sırasında bir hata oluştu.');
    }
  };

  // 2. Yeni adres ekleme (State güncellemesi backend'den gelen veriyle yapılıyor)
  const adresEkle = async () => {
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const yanit = await axios.post('http://localhost:5000/address/add', newAddress, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // State'i güncelle (Eğer varsayılan değiştiyse tüm listeyi yeniden çekmek daha güvenli)
      setKullanici(prev => ({
        ...prev,
        adresler: newAddress.varsayilan 
          ? prev.adresler.map(adr => ({...adr, varsayilan: false})).concat(yanit.data.address)
          : [...prev.adresler, yanit.data.address]
      }));

      setShowAddressModal(false);
      setNewAddress({ adres_ismi: '', adres_detay: '', sehir: '', ilce: '', posta_kodu: '', varsayilan: false });
      setSuccess('Adres başarıyla eklendi.');
    } catch (err) {
      setError(err.response?.data?.message || 'Adres eklenemedi.');
    }
  };

  const handleEditAddress = (address) => {
    setSelectedAddress(address); // Artık tüm adres nesnesini saklayabiliriz (id içeriyor)
    setNewAddress({ ...address });
    setShowEditAddressModal(true);
  };

  // 3. Mevcut adresi güncelleme (Endpoint ve state güncellemesi düzeltildi)
  const adresGuncelle = async () => {
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      // Adres ID'si artık `selectedAddress.id` veya `selectedAddress._id`'den güvenle alınabilir
      const addressId = selectedAddress.id || selectedAddress._id;
      const response = await axios.put(
        `http://localhost:5000/address/update/${addressId}`,
        newAddress,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setKullanici(prev => {
        // Guncellenen adres varsayilan ise, digerlerini false yap
        const updatedAdresler = newAddress.varsayilan
            ? prev.adresler.map(adr => ({...adr, varsayilan: adr.id === addressId}))
            : prev.adresler;

        return {
          ...prev,
          adresler: updatedAdresler.map(adr =>
            (adr.id === addressId || adr._id === addressId) ? response.data.address : adr
          )
        }
      });

      setShowEditAddressModal(false);
      setSuccess('Adres başarıyla güncellendi');
    } catch (err) {
      setError(err.response?.data?.message || 'Adres güncellenirken hata oluştu');
    }
  };

  // 4. Adres silme (Endpoint ve state güncellemesi düzeltildi)
  const adresSil = async (addressToDelete) => {
    if (!window.confirm('Bu adresi silmek istediğinize emin misiniz?')) return;
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const addressId = addressToDelete.id || addressToDelete._id;
      await axios.delete(`http://localhost:5000/address/delete/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKullanici(prev => ({
        ...prev,
        adresler: prev.adresler.filter(a => (a.id || a._id) !== addressId)
      }));
      setSuccess('Adres başarıyla silindi');
    } catch (err) {
      setError('Adres silinirken hata oluştu');
    }
  };

  // 5. Ödeme yöntemi ekleme (ARTIK GERÇEK)
  const kartEkle = async () => {
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/payment/add', newPayment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKullanici(prev => ({
        ...prev,
        odeme_yontemleri: [...prev.odeme_yontemleri, response.data.payment]
      }));
      setShowPaymentModal(false);
      setNewPayment({ kart_tipi: 'Visa', kart_numarasi: '', kart_ismi: '', son_kullanma: '', cvv: '', varsayilan: false });
      setSuccess('Ödeme yöntemi başarıyla eklendi.');
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme yöntemi eklenemedi.');
    }
  };
  
  // 6. Ödeme yöntemi silme (YENİ)
  const kartSil = async (paymentToDelete) => {
    if (!window.confirm('Bu ödeme yöntemini silmek istediğinize emin misiniz?')) return;
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const paymentId = paymentToDelete.id || paymentToDelete._id;
      await axios.delete(`http://localhost:5000/payment/delete/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKullanici(prev => ({
        ...prev,
        odeme_yontemleri: prev.odeme_yontemleri.filter(p => (p.id || p._id) !== paymentId)
      }));
      setSuccess('Ödeme yöntemi başarıyla silindi.');
    } catch (err) {
       setError(err.response?.data?.message || 'Ödeme yöntemi silinemedi.');
    }
  }

  return (
    <Container className="py-5">
      {/* ... Başlık ve Alert kısımları aynı kalabilir ... */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-gradient">Profilim</h1>
        <p className="text-muted">Kişisel bilgilerinizi ve tercihlerinizi yönetin</p>
      </div>

      {error && <Alert variant="danger" onClose={clearMessages} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={clearMessages} dismissible>{success}</Alert>}
      
      <Tabs defaultActiveKey="profile" id="profile-tabs" className="mb-4 custom-tabs">

        {/* === Profil Bilgileri Sekmesi (Değişiklik yok) === */}
        <Tab eventKey="profile" title="Profil Bilgileri">
           {/* Bu sekmedeki JSX kodunuzda bir sorun yoktu, aynen kalabilir. */}
           <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h4 className="mb-4 text-danger">Kişisel Bilgiler</h4>
              <Form onSubmit={bilgileriGuncelle}>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Ad</Form.Label><Form.Control type="text" name="ad" value={kullanici.ad} onChange={handleDegisim} required /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Soyad</Form.Label><Form.Control type="text" name="soyad" value={kullanici.soyad} onChange={handleDegisim} required /></Form.Group></Col>
                </Row>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>E-posta</Form.Label><Form.Control type="email" name="email" value={kullanici.email} onChange={handleDegisim} required /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Telefon</Form.Label><Form.Control type="tel" name="telefon" value={kullanici.telefon} onChange={handleDegisim} /></Form.Group></Col>
                </Row>
                <Form.Group className="mb-4"><Form.Label>Yeni Şifre</Form.Label><Form.Control type="password" name="sifre" value={kullanici.sifre} onChange={handleDegisim} placeholder="Değiştirmek istemiyorsanız boş bırakın" /></Form.Group>
                <Button variant="danger" type="submit" className="w-100 py-2 fw-bold">Bilgileri Güncelle</Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        {/* === Adreslerim Sekmesi (key prop'u düzeltildi) === */}
        <Tab eventKey="address" title="Adreslerim">
            {/* Bu sekmedeki JSX kodunuzda sadece map içindeki key düzeltildi, aynen kalabilir. */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="text-danger mb-0">Adreslerim</h4>
                    <Button variant="danger" onClick={() => setShowAddressModal(true)}><i className="fas fa-plus me-2"></i> Yeni Adres Ekle</Button>
                </div>
                {kullanici.adresler.length === 0 ? (
                    <div className="text-center py-5"><i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i><h5>Kayıtlı adresiniz bulunmamaktadır</h5><p className="text-muted">Yeni adres eklemek için butona tıklayın</p></div>
                ) : (
                    <Row>
                    {kullanici.adresler.map((adres) => (
                        <Col md={6} className="mb-4" key={adres.id || adres._id}> {/* KEY DÜZELTİLDİ */}
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
                            <Button variant="outline-danger" size="sm" className="me-2" onClick={() => handleEditAddress(adres)}><i className="fas fa-edit me-1"></i> Düzenle</Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => adresSil(adres)}><i className="fas fa-trash me-1"></i> Sil</Button>
                            </Card.Footer>
                        </Card>
                        </Col>
                    ))}
                    </Row>
                )}
                </Card.Body>
            </Card>
        </Tab>
        
        {/* === Ödeme Yöntemleri Sekmesi (YENİDEN YAPILDI) === */}
        <Tab eventKey="payment" title="Ödeme Yöntemleri">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-danger mb-0">Kayıtlı Kartlarım</h4>
                <Button variant="danger" onClick={() => setShowPaymentModal(true)}>
                  <i className="fas fa-plus me-2"></i> Yeni Kart Ekle
                </Button>
              </div>
              {kullanici.odeme_yontemleri.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-credit-card fa-3x text-muted mb-3"></i>
                  <h5>Kayıtlı ödeme yönteminiz bulunmamaktadır</h5>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {kullanici.odeme_yontemleri.map((kart) => (
                    <ListGroup.Item key={kart.id || kart._id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <i className={`fab fa-cc-${kart.kart_tipi.toLowerCase()} fa-2x me-3 text-primary`}></i>
                        <span className="fw-bold me-3">{kart.kart_ismi}</span>
                        <span className="text-muted">{kart.kart_numarasi}</span>
                        {kart.varsayilan && <Badge bg="success" className="ms-3">Varsayılan</Badge>}
                      </div>
                      <Button variant="outline-secondary" size="sm" onClick={() => kartSil(kart)}>
                        <i className="fas fa-trash"></i>
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* === Adres Modalları (Değişiklik yok) === */}
      {/* Yeni Adres Ekleme Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} size="lg">
        <Modal.Header closeButton className="bg-danger text-white"><Modal.Title>Yeni Adres Ekle</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
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

      {/* Adres Düzenleme Modal */}
      <Modal show={showEditAddressModal} onHide={() => setShowEditAddressModal(false)} size="lg">
        <Modal.Header closeButton className="bg-danger text-white"><Modal.Title>Adresi Düzenle</Modal.Title></Modal.Header>
        <Modal.Body>
          {/* Form içeriği Yeni Adres Modalı ile aynı olduğu için tekrar yazılmadı, kodunuzdaki gibi kalabilir */}
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

      {/* === YENİ ÖDEME YÖNTEMİ MODAL === */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} size="lg">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Yeni Kart Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Kart Üzerindeki İsim</Form.Label><Form.Control type="text" name="kart_ismi" value={newPayment.kart_ismi} onChange={handlePaymentChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Kart Numarası</Form.Label><Form.Control type="text" name="kart_numarasi" value={newPayment.kart_numarasi} onChange={handlePaymentChange} required placeholder="**** **** **** ****" /></Form.Group>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Son Kullanma Tarihi</Form.Label><Form.Control type="text" name="son_kullanma" value={newPayment.son_kullanma} onChange={handlePaymentChange} required placeholder="AA/YY" /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>CVV</Form.Label><Form.Control type="text" name="cvv" value={newPayment.cvv} onChange={handlePaymentChange} required /></Form.Group></Col>
              <Col md={2}><Form.Group className="mb-3"><Form.Label>Tip</Form.Label><Form.Select name="kart_tipi" value={newPayment.kart_tipi} onChange={handlePaymentChange}><option>Visa</option><option>Mastercard</option></Form.Select></Form.Group></Col>
            </Row>
             <Form.Group className="mt-2"><Form.Check type="checkbox" name="varsayilan" checked={newPayment.varsayilan} onChange={handlePaymentChange} label="Varsayılan ödeme yöntemi yap" /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>İptal</Button>
          <Button variant="danger" onClick={kartEkle}>Kartı Kaydet</Button>
        </Modal.Footer>
      </Modal>
      
      {/* ... Style bloğu aynı kalabilir ... */}
      <style jsx global>{`
        .text-gradient { background: linear-gradient(to right, #dc3545, #6c757d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .custom-tabs .nav-link { font-weight: 500; color: #6c757d; border: none; border-bottom: 3px solid transparent; padding: 0.75rem 1.5rem; }
        .custom-tabs .nav-link.active { color: #dc3545; border-bottom: 3px solid #dc3545; background-color: transparent; }
      `}</style>
    </Container>
  );
};

export default ProfileTR;