import React, { useState, useEffect } from 'react';
import { 
  Container, Card, Form, Button, Row, Col, 
  Modal, Badge, ListGroup, Tab, Tabs 
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    adres_tipi: 'Ev',
    ulke: 'Türkiye',
    sehir: 'İstanbul',
    ilce: '',
    posta_kodu: '',
    adres_detay: '',
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

  useEffect(() => {
    const kullaniciBilgileriniGetir = async () => {
      try {
        // Gerçek API çağrısı yerine mock veri kullanıyoruz
        const mockData = {
          ad: "Ayşe",
          soyad: "Demirer",
          email: "a@gmail.com",
          telefon: "+905551112233",
          adresler: [
            {
              adres_tipi: "Ev",
              ulke: "Türkiye",
              sehir: "İstanbul",
              ilce: "Kadıköy",
              posta_kodu: "34730",
              adres_detay: "Fenerbahçe Mah. Çarşı Sok. No:12"
            }
          ],
          odeme_yontemleri: [
            {
              yontem: "Kredi Kartı",
              kart_tipi: "Visa",
              kart_numarasi: "**** **** **** 1234"
            }
          ],
          bildirim_tercihleri: {
            email_bildirim: true,
            sms_bildirim: false,
            kampanya_bildirimi: true
          },
          guvenlik: {
            "2fa_aktif": false,
            giris_deneme_sayisi: 0,
            hesap_kilidi: false
          }
        };

        setKullanici(prev => ({
          ...prev,
          ...mockData,
          adresler: mockData.adresler || [],
          odeme_yontemleri: mockData.odeme_yontemleri || []
        }));
      } catch (err) {
        console.error('Profil verisi alınamadı:', err);
      }
    };

    kullaniciBilgileriniGetir();
  }, []);

  const handleDegisim = (e) => {
    setKullanici((onceki) => ({
      ...onceki,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPayment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const bilgileriGuncelle = async (e) => {
    e.preventDefault();
    try {
      // Burada güncelleme işlemi yapılacak
      alert('Profil bilgileri başarıyla güncellendi.');
    } catch (err) {
      alert('Güncelleme sırasında bir hata oluştu.');
      console.error('Güncelleme hatası:', err);
    }
  };

  const adresEkle = () => {
    setKullanici(prev => ({
      ...prev,
      adresler: [...prev.adresler, newAddress]
    }));
    setShowAddressModal(false);
    setNewAddress({
      adres_tipi: 'Ev',
      ulke: 'Türkiye',
      sehir: 'İstanbul',
      ilce: '',
      posta_kodu: '',
      adres_detay: '',
      varsayilan: false
    });
  };

  const kartEkle = () => {
    setKullanici(prev => ({
      ...prev,
      odeme_yontemleri: [...prev.odeme_yontemleri, {
        yontem: "Kredi Kartı",
        kart_tipi: newPayment.kart_tipi,
        kart_numarasi: `**** **** **** ${newPayment.kart_numarasi.slice(-4)}`
      }]
    }));
    setShowPaymentModal(false);
    setNewPayment({
      kart_tipi: 'Visa',
      kart_numarasi: '',
      kart_ismi: '',
      son_kullanma: '',
      cvv: '',
      varsayilan: false
    });
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-gradient">Profilim</h1>
        <p className="text-muted">Kişisel bilgilerinizi ve tercihlerinizi yönetin</p>
      </div>

      <Tabs defaultActiveKey="profile" id="profile-tabs" className="mb-4 custom-tabs">
        <Tab eventKey="profile" title="Profil Bilgileri">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h4 className="mb-4 text-danger">Kişisel Bilgiler</h4>
              <Form onSubmit={bilgileriGuncelle}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ad</Form.Label>
                      <Form.Control
                        type="text"
                        name="ad"
                        value={kullanici.ad}
                        onChange={handleDegisim}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Soyad</Form.Label>
                      <Form.Control
                        type="text"
                        name="soyad"
                        value={kullanici.soyad}
                        onChange={handleDegisim}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>E-posta</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={kullanici.email}
                        onChange={handleDegisim}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Telefon</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefon"
                        value={kullanici.telefon}
                        onChange={handleDegisim}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Yeni Şifre</Form.Label>
                  <Form.Control
                    type="password"
                    name="sifre"
                    value={kullanici.sifre}
                    onChange={handleDegisim}
                    placeholder="Yeni şifre (zorunlu değil)"
                  />
                </Form.Group>

                <Button variant="danger" type="submit" className="w-100 py-2 fw-bold">
                  Bilgileri Güncelle
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="address" title="Adreslerim">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-danger mb-0">Adreslerim</h4>
                <Button 
                  variant="danger" 
                  onClick={() => setShowAddressModal(true)}
                  className="d-flex align-items-center"
                >
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
                  {kullanici.adresler.map((adres, index) => (
                    <Col md={6} className="mb-4" key={index}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
                          <span>{adres.adres_tipi} Adresi</span>
                          {index === 0 && <Badge bg="light" text="dark">Varsayılan</Badge>}
                        </Card.Header>
                        <Card.Body>
                          <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                              <span className="fw-bold me-2" style={{minWidth: '100px'}}>Adres:</span>
                              <span>{adres.adres_detay}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                              <span className="fw-bold me-2" style={{minWidth: '100px'}}>İlçe:</span>
                              <span>{adres.ilce}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                              <span className="fw-bold me-2" style={{minWidth: '100px'}}>Şehir:</span>
                              <span>{adres.sehir}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                              <span className="fw-bold me-2" style={{minWidth: '100px'}}>Ülke:</span>
                              <span>{adres.ulke}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                              <span className="fw-bold me-2" style={{minWidth: '100px'}}>Posta Kodu:</span>
                              <span>{adres.posta_kodu}</span>
                            </ListGroup.Item>
                          </ListGroup>
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-end bg-light">
                          <Button variant="outline-danger" size="sm" className="me-2">
                            <i className="fas fa-edit me-1"></i> Düzenle
                          </Button>
                          <Button variant="outline-secondary" size="sm">
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

        <Tab eventKey="payment" title="Ödeme Yöntemleri">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-danger mb-0">Ödeme Yöntemlerim</h4>
                <Button 
                  variant="danger" 
                  onClick={() => setShowPaymentModal(true)}
                  className="d-flex align-items-center"
                >
                  <i className="fas fa-plus me-2"></i> Yeni Kart Ekle
                </Button>
              </div>
              
              {kullanici.odeme_yontemleri.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-credit-card fa-3x text-muted mb-3"></i>
                  <h5>Kayıtlı ödeme yönteminiz bulunmamaktadır</h5>
                  <p className="text-muted">Yeni kart eklemek için butona tıklayın</p>
                </div>
              ) : (
                <Row>
                  {kullanici.odeme_yontemleri.map((kart, index) => (
                    <Col md={6} className="mb-4" key={index}>
                      <Card className="h-100 border-0">
                        <Card.Body className="bg-gradient p-4 text-white rounded" 
                                  style={{background: 'linear-gradient(135deg, #2c3e50, #4a6491)'}}>
                          <div className="d-flex justify-content-between mb-4">
                            <div className="fw-bold">{kart.kart_tipi}</div>
                            {index === 0 && <Badge bg="light" text="dark">Varsayılan</Badge>}
                          </div>
                          
                          <div className="d-flex align-items-center mb-4">
                            <div className="bg-warning rounded me-3" style={{width: '50px', height: '35px'}}></div>
                            <h4 className="mb-0">{kart.kart_numarasi}</h4>
                          </div>
                          
                          <div className="d-flex justify-content-between">
                            <div>
                              <div className="small">KART SAHİBİ</div>
                              <div>{kullanici.ad} {kullanici.soyad}</div>
                            </div>
                            <div>
                              <div className="small">SON KULLANMA</div>
                              <div>12/28</div>
                            </div>
                          </div>
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-end bg-light">
                          <Button variant="outline-danger" size="sm" className="me-2">
                            <i className="fas fa-edit me-1"></i> Düzenle
                          </Button>
                          <Button variant="outline-secondary" size="sm">
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
      </Tabs>

      {/* Adres Ekleme Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} size="lg">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Yeni Adres Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Adres Tipi</Form.Label>
                  <Form.Select 
                    name="adres_tipi"
                    value={newAddress.adres_tipi}
                    onChange={handleAddressChange}
                  >
                    <option value="Ev">Ev</option>
                    <option value="İş">İş</option>
                    <option value="Diğer">Diğer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ülke</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="ulke"
                    value={newAddress.ulke}
                    onChange={handleAddressChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Şehir</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="sehir"
                    value={newAddress.sehir}
                    onChange={handleAddressChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>İlçe</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="ilce"
                    value={newAddress.ilce}
                    onChange={handleAddressChange}
                    placeholder="İlçe adını girin"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Posta Kodu</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="posta_kodu"
                    value={newAddress.posta_kodu}
                    onChange={handleAddressChange}
                    placeholder="Posta kodunu girin"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Varsayılan Adres</Form.Label>
                  <div className="mt-2">
                    <Form.Check 
                      type="checkbox"
                      name="varsayilan"
                      checked={newAddress.varsayilan}
                      onChange={handleAddressChange}
                      label="Bu adresi varsayılan olarak kullan"
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-4">
              <Form.Label>Adres Detayı</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="adres_detay"
                value={newAddress.adres_detay}
                onChange={handleAddressChange}
                placeholder="Cadde, sokak, apartman, daire bilgileri"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={adresEkle}>
            Adresi Kaydet
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Kart Ekleme Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Yeni Kart Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Kart Numarası</Form.Label>
              <Form.Control 
                type="text" 
                name="kart_numarasi"
                value={newPayment.kart_numarasi}
                onChange={handlePaymentChange}
                placeholder="0000 0000 0000 0000"
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Kart Tipi</Form.Label>
                  <Form.Select 
                    name="kart_tipi"
                    value={newPayment.kart_tipi}
                    onChange={handlePaymentChange}
                  >
                    <option value="Visa">Visa</option>
                    <option value="MasterCard">MasterCard</option>
                    <option value="American Express">American Express</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Kart Üzerindeki İsim</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="kart_ismi"
                    value={newPayment.kart_ismi}
                    onChange={handlePaymentChange}
                    placeholder="Kart üzerindeki isim"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Son Kullanma Tarihi</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="son_kullanma"
                    value={newPayment.son_kullanma}
                    onChange={handlePaymentChange}
                    placeholder="AA/YY"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>CVV</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="cvv"
                    value={newPayment.cvv}
                    onChange={handlePaymentChange}
                    placeholder="Güvenlik Kodu"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                name="varsayilan"
                checked={newPayment.varsayilan}
                onChange={handlePaymentChange}
                label="Varsayılan kart olarak ayarla"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={kartEkle}>
            Kartı Kaydet
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .text-gradient {
          background: linear-gradient(to right, #dc3545, #6610f2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .custom-tabs .nav-link {
          font-weight: 500;
          color: #6c757d;
          border: none;
          border-bottom: 3px solid transparent;
          padding: 0.75rem 1.5rem;
        }
        .custom-tabs .nav-link.active {
          color: #dc3545;
          border-bottom: 3px solid #dc3545;
          background-color: transparent;
        }
        .bg-gradient {
          background: linear-gradient(135deg, #2c3e50, #4a6491);
        }
      `}</style>
    </Container>
  );
};

export default ProfileTR;