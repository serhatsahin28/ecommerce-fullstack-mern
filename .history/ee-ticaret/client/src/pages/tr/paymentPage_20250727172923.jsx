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
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  useEffect(() => {
    // localStorage'dan misafir ve sepet bilgisi oku
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    
    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    }
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    // Debug için konsola yazdır
    console.log('🔍 Stored Guest Info:', storedGuestInfo ? JSON.parse(storedGuestInfo) : null);
    console.log('🔍 Stored Cart:', storedCart ? JSON.parse(storedCart) : null);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Kart numarası formatını düzenle (her 4 rakamda bir boşluk)
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length <= 19) { // 16 rakam + 3 boşluk
        setCard((prev) => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }

    // Ay için sadece rakam ve max 2 karakter
    if (name === 'expireMonth') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 2 && (numericValue === '' || (parseInt(numericValue) >= 1 && parseInt(numericValue) <= 12))) {
        setCard((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // Yıl için sadece rakam ve max 4 karakter
    if (name === 'expireYear') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setCard((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // CVC için sadece rakam ve max 4 karakter
    if (name === 'cvc') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setCard((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setCard((prev) => ({ ...prev, [name]: value }));
  };

  // Toplam fiyat hesaplama fonksiyonu
  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.price || item.fiyat || 0;
      const quantity = item.quantity || item.adet || 1;
      return acc + (price * quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validasyonlar
    if (!guestInfo || cart.length === 0) {
      setError('Misafir bilgileri veya sepet boş. Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    // Kart validasyonları
    if (!card.cardHolderName.trim()) {
      setError('Kart üzerindeki isim zorunludur.');
      setLoading(false);
      return;
    }

    const cardNumberDigits = card.cardNumber.replace(/\D/g, '');
    if (cardNumberDigits.length !== 16) {
      setError('Kart numarası 16 haneli olmalıdır.');
      setLoading(false);
      return;
    }

    if (!card.expireMonth || parseInt(card.expireMonth) < 1 || parseInt(card.expireMonth) > 12) {
      setError('Geçerli bir ay giriniz (01-12).');
      setLoading(false);
      return;
    }

    if (!card.expireYear || card.expireYear.length !== 4) {
      setError('Geçerli bir yıl giriniz (YYYY formatında).');
      setLoading(false);
      return;
    }

    if (!card.cvc || card.cvc.length < 3) {
      setError('CVC kodu en az 3 haneli olmalıdır.');
      setLoading(false);
      return;
    }

    const totalPrice = calculateTotal();
    
    // Backend'in beklediği format
    const paymentData = {
      // Misafir bilgileri ayrı ayrı gönder
      ad: guestInfo.ad || guestInfo.name || '',
      soyad: guestInfo.soyad || guestInfo.surname || '',
      email: guestInfo.email || '',
      telefon: guestInfo.telefon || guestInfo.phone || '',
      adres_detay: guestInfo.adres_detay || guestInfo.address || '',
      sehir: guestInfo.sehir || guestInfo.city || '',
      posta_kodu: guestInfo.posta_kodu || guestInfo.zipCode || '',
      
      // Sepet ve fiyat
      sepet: cart.map(item => ({
        product_id: item.id || item.product_id,
        translations: item.translations || { tr: { title: item.name || item.title || 'Ürün' } },
        category_title: item.category_title || item.category || 'Genel',
        price: item.price || item.fiyat || 0,
        quantity: item.quantity || item.adet || 1
      })),
      totalPrice: totalPrice,
      
      // Kart bilgileri
      card: {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: cardNumberDigits, // Sadece rakamlar
        expireMonth: card.expireMonth.padStart(2, '0'), // 01, 02 formatında
        expireYear: card.expireYear,
        cvc: card.cvc
      }
    };

    console.log('📤 Frontend - Gönderilen veri:', paymentData);

    try {
      const res = await axios.post('http://localhost:5000/pay', paymentData);

      console.log('📥 Frontend - API Response:', res.data);

      if (res.data.success) {
        console.log('✅ Ödeme başarılı, modal açılıyor...');
        setPaymentId(res.data.paymentId);
        
        // Form temizle
        setCard({
          cardHolderName: '',
          cardNumber: '',
          expireMonth: '',
          expireYear: '',
          cvc: ''
        });
        
        // Success mesajını kaldır ve direkt modalı göster
        setSuccess('');
        setShowRegistrationModal(true);
        console.log('🔔 Modal state:', true);
        
      } else {
        setError(res.data.message || 'Ödeme başarısız. Lütfen tekrar deneyin.');
        
        // Detaylı hata göster
        if (res.data.error) {
          console.error('Ödeme Hatası Detayı:', res.data.error);
        }
      }
    } catch (err) {
      console.error('API Hatası:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.detail) {
        setError(`Hata: ${err.response.data.detail}`);
      } else {
        setError('Ödeme başarısız. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationChoice = (choice) => {
    setShowRegistrationModal(false);
    
    if (choice === 'register') {
      // Kayıt sayfasına yönlendir - guestInfo'yu localStorage'da tut
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/register'); // React Router ile yönlendirme
      console.log('Kayıt sayfasına yönlendiriliyor...');
    } else {
      // Kayıt olmadan devam et - localStorage temizle
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
      navigate('/'); // Ana sayfaya yönlendir
      console.log('Ana sayfaya yönlendiriliyor...');
    }
  };

  // Debug bilgileri
  const totalPrice = calculateTotal();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h2 className="mb-4">Ödeme Bilgileri</h2>
          
          {/* Sepet Özeti */}
          {cart.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5>Sepet Özeti</h5>
              </Card.Header>
              <Card.Body>
                {cart.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between">
                    <span>{item.name || item.title || 'Ürün'}</span>
                    <span>{((item.price || item.fiyat || 0) * (item.quantity || item.adet || 1)).toFixed(2)} TL</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Toplam: {totalPrice.toFixed(2)} TL</strong>
                </div>
              </Card.Body>
            </Card>
          )}

          {error && <Alert variant="danger">{error}</Alert>}
          {/* Success mesajını sadece modal açık değilken göster */}
          {success && !showRegistrationModal && <Alert variant="success">{success}</Alert>}

          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Kart Üzerindeki İsim *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="cardHolderName" 
                    value={card.cardHolderName}
                    onChange={handleChange} 
                    placeholder="John Doe"
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Kart Numarası *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="cardNumber" 
                    value={card.cardNumber}
                    onChange={handleChange} 
                    placeholder="1234 5678 9012 3456"
                    required 
                  />
                  <Form.Text className="text-muted">
                    Test kartı: 5528 7900 0000 0008
                  </Form.Text>
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ay *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="expireMonth" 
                        value={card.expireMonth}
                        onChange={handleChange} 
                        placeholder="12"
                        maxLength="2"
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Yıl *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="expireYear" 
                        value={card.expireYear}
                        onChange={handleChange} 
                        placeholder="2030"
                        maxLength="4"
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVC *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="cvc" 
                        value={card.cvc}
                        onChange={handleChange} 
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
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      İşleniyor...
                    </>
                  ) : (
                    `Ödemeyi Tamamla (${totalPrice.toFixed(2)} TL)`
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Kayıt Olma Seçeneği Modal */}
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
          </Alert>
          <p>Gelecekteki siparişlerinizi daha kolay takip edebilmek için hesap oluşturmak ister misiniz?</p>
          <ul className="text-muted small">
            <li>Sipariş geçmişinizi görüntüleyebilirsiniz</li>
            <li>Daha hızlı alışveriş yapabilirsiniz</li>
            <li>Özel indirimlerden haberdar olabilirsiniz</li>
          </ul>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => handleRegistrationChoice('register')}
            className="me-3"
          >
            Hesap Oluştur
          </Button>
          <Button 
            variant="outline-secondary" 
            size="lg"
            onClick={() => handleRegistrationChoice('continue')}
          >
            Devam Et
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;