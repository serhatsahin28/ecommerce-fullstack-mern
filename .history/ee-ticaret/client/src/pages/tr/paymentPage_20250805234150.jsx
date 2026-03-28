import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [card, setCard] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [guestInfo, setGuestInfo] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: '',
    notlar: ''
  });
  const [cart, setCart] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');

  useEffect(() => {
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    
    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    }
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    // Kart numarası formatı
    if (name === 'cardNumber') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formatted.length <= 19) setCard(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    // Ay
    if (name === 'expireMonth') {
      const numeric = value.replace(/\D/g, '');
      if (numeric.length <= 2 && (numeric === '' || (parseInt(numeric) >= 1 && parseInt(numeric) <= 12))) {
        setCard(prev => ({ ...prev, [name]: numeric }));
      }
      return;
    }
    // Yıl
    if (name === 'expireYear') {
      const numeric = value.replace(/\D/g, '');
      if (numeric.length <= 4) setCard(prev => ({ ...prev, [name]: numeric }));
      return;
    }
    // CVC
    if (name === 'cvc') {
      const numeric = value.replace(/\D/g, '');
      if (numeric.length <= 4) setCard(prev => ({ ...prev, [name]: numeric }));
      return;
    }

    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handleGuestInfoChange = (e) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.price || item.fiyat || 0;
      const quantity = item.quantity || item.adet || 1;
      return acc + (price * quantity);
    }, 0);
  };

  // Sipariş ve ödeme fonksiyonları değişmedi, aynı şekilde kullanılabilir
  // (Burada kod uzunluğu sebebiyle onları aynen bırakıyorum.)

  // handleSubmit fonksiyonu içinde misafir bilgisi artık formdan gelecek,
  // localStorage kontrolü yapmaya devam edebilirsin veya formdan alabilirsin.

  // Burada sadece render kısmına yeni adres form alanları eklenecek:

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <h2 className="mb-4 text-center">Ödeme Bilgileri ve Teslimat Adresi</h2>
          
          {cart.length > 0 && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Sepet Özeti</h5>
              </Card.Header>
              <Card.Body>
                {cart.map((item, idx) => (
                  <div key={idx} className="d-flex justify-content-between mb-2">
                    <span>{item.name || item.title || 'Ürün'}</span>
                    <span>{((item.price || item.fiyat || 0) * (item.quantity || item.adet || 1)).toFixed(2)} TL</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between fs-5 fw-bold">
                  <span>Toplam</span>
                  <span>{calculateTotal().toFixed(2)} TL</span>
                </div>
              </Card.Body>
            </Card>
          )}

          {error && <Alert variant="danger" className="text-center">{error}</Alert>}
          {success && !showRegistrationModal && <Alert variant="success" className="text-center">{success}</Alert>}

          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>

                {/* Misafir Bilgileri */}
                <h5 className="mb-3">Teslimat Bilgileri</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formAd">
                      <Form.Label>Ad *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="ad" 
                        value={guestInfo.ad} 
                        onChange={handleGuestInfoChange} 
                        placeholder="Adınız" 
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formSoyad">
                      <Form.Label>Soyad *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="soyad" 
                        value={guestInfo.soyad} 
                        onChange={handleGuestInfoChange} 
                        placeholder="Soyadınız" 
                        required 
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formEmail">
                      <Form.Label>E-posta *</Form.Label>
                      <Form.Control 
                        type="email" 
                        name="email" 
                        value={guestInfo.email} 
                        onChange={handleGuestInfoChange} 
                        placeholder="email@example.com" 
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formTelefon">
                      <Form.Label>Telefon *</Form.Label>
                      <Form.Control 
                        type="tel" 
                        name="telefon" 
                        value={guestInfo.telefon} 
                        onChange={handleGuestInfoChange} 
                        placeholder="+90 5xx xxx xx xx" 
                        required 
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="formAdres">
                  <Form.Label>Adres Detayı *</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    name="adres_detay" 
                    value={guestInfo.adres_detay} 
                    onChange={handleGuestInfoChange} 
                    placeholder="Cadde, Sokak, Apartman No, Daire No" 
                    required 
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formSehir">
                      <Form.Label>Şehir *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="sehir" 
                        value={guestInfo.sehir} 
                        onChange={handleGuestInfoChange} 
                        placeholder="İstanbul" 
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formIlce">
                      <Form.Label>İlçe *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="ilce" 
                        value={guestInfo.ilce} 
                        onChange={handleGuestInfoChange} 
                        placeholder="Kadıköy" 
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formPostaKodu">
                      <Form.Label>Posta Kodu *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="posta_kodu" 
                        value={guestInfo.posta_kodu} 
                        onChange={handleGuestInfoChange} 
                        placeholder="34710" 
                        required 
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4" controlId="formNotlar">
                  <Form.Label>Notlar (Opsiyonel)</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    name="notlar" 
                    value={guestInfo.notlar} 
                    onChange={handleGuestInfoChange} 
                    placeholder="Sipariş ile ilgili notlarınızı buraya yazabilirsiniz." 
                  />
                </Form.Group>

                {/* Ödeme Bilgileri */}
                <h5 className="mb-3 mt-4">Kredi Kartı Bilgileri</h5>
                <Form.Group className="mb-3" controlId="cardHolderName">
                  <Form.Label>Kart Üzerindeki İsim *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="cardHolderName" 
                    value={card.cardHolderName} 
                    onChange={handleCardChange} 
                    placeholder="John Doe" 
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="cardNumber">
                  <Form.Label>Kart Numarası *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="cardNumber" 
                    value={card.cardNumber} 
                    onChange={handleCardChange} 
                    placeholder="1234 5678 9012 3456" 
                    required 
                    maxLength={19}
                  />
                  <Form.Text className="text-muted">
                    Test kartı: 5528 7900 0000 0008
                  </Form.Text>
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="expireMonth">
                      <Form.Label>Ay *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="expireMonth" 
                        value={card.expireMonth} 
                        onChange={handleCardChange} 
                        placeholder="12" 
                        maxLength="2" 
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="expireYear">
                      <Form.Label>Yıl *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="expireYear" 
                        value={card.expireYear} 
                        onChange={handleCardChange} 
                        placeholder="2030" 
                        maxLength="4" 
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="cvc">
                      <Form.Label>CVC *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="cvc" 
                        value={card.cvc} 
                        onChange={handleCardChange} 
                        placeholder="123" 
                        maxLength="4" 
                        required 
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  className="w-100 shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      İşleniyor...
                    </>
                  ) : (
                    `Ödemeyi Tamamla (${calculateTotal().toFixed(2)} TL)`
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal kodu aynı kalabilir */}
      <Modal 
        show={showRegistrationModal} 
        onHide={() => {}} 
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Ödeme Başarılı! 🎉</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success" className="mb-3">
            <strong>Tebrikler!</strong> Ödemeniz başarıyla tamamlandı.
            <br />
            <small>İşlem ID: {paymentId}</small>
            {orderCode && (
              <>
                <br />
                <small>Sipariş Kodu: {orderCode}</small>
              </>
            )}
          </Alert>
          <p>Gelecekteki siparişlerinizi daha kolay takip edebilmek için hesap oluşturmak ister misiniz?</p>
          <ul className="text-muted small">
            <li>Sipariş geçmişinizi görüntüleyebilirsiniz</li>
            <li>Daha hızlı alışveriş yapabilirsiniz</li>
            <li>Kişisel bilgilerinizi güvenle saklayabilirsiniz</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => navigate('/')}>Şimdi Değil</Button>
          <Button variant="success" onClick={() => navigate('/register')}>Hesap Oluştur</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;
