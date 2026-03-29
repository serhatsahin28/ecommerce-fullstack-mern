import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaUser, FaMapMarkerAlt, FaShoppingCart, FaRegCheckCircle } from 'react-icons/fa';

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
  const [orderCode, setOrderCode] = useState('');
  const [activeTab, setActiveTab] = useState('payment');

  useEffect(() => {
    // localStorage'dan misafir ve sepet bilgisi oku
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    const storedAddress = localStorage.getItem('userAddress');
    
    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    } else if (storedAddress) {
      setGuestInfo(JSON.parse(storedAddress));
    }
    
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    console.log('🔍 Stored Guest Info:', storedGuestInfo ? JSON.parse(storedGuestInfo) : null);
    console.log('🔍 Stored Cart:', storedCart ? JSON.parse(storedCart) : null);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Kart numarası formatını düzenle (her 4 rakamda bir boşluk)
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length <= 19) {
        setCard(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }

    // Ay için sadece rakam ve max 2 karakter
    if (name === 'expireMonth') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 2 && (numericValue === '' || (parseInt(numericValue) >= 1 && parseInt(numericValue) <= 12))) {
        setCard(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // Yıl için sadece rakam ve max 4 karakter
    if (name === 'expireYear') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setCard(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // CVC için sadece rakam ve max 4 karakter
    if (name === 'cvc') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setCard(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setCard(prev => ({ ...prev, [name]: value }));
  };

  // Toplam fiyat hesaplama fonksiyonu
  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.price || item.fiyat || 0;
      const quantity = item.quantity || item.adet || 1;
      return acc + (price * quantity);
    }, 0);
  };

  // Sipariş kaydetme fonksiyonu
  const saveOrderToDatabase = async (paymentResponse) => {
    try {
      console.log('💾 Sipariş veritabanına kaydediliyor...');
      
      const orderData = {
        userId: null,
        email: guestInfo.email,
        firstName: guestInfo.ad || guestInfo.name || '',
        lastName: guestInfo.soyad || guestInfo.surname || '',
        phone: guestInfo.telefon || guestInfo.phone || '',
        
        cart: cart.map(item => ({
          product_id: item.id || item.product_id,
          name: item.name || item.title || 'Ürün',
          category: item.category_title || item.category || 'Genel',
          price: item.price || item.fiyat || 0,
          quantity: item.quantity || item.adet || 1
        })),
        
        totalAmount: calculateTotal(),
        
        shippingInfo: {
          address: guestInfo.adres_detay || guestInfo.address || '',
          city: guestInfo.sehir || guestInfo.city || '',
          district: guestInfo.ilce || guestInfo.district || '',
          postalCode: guestInfo.posta_kodu || guestInfo.zipCode || '',
          notes: guestInfo.notlar || guestInfo.notes || ''
        },
        
        payment: {
          method: 'iyzico',
          status: 'success',
          iyzicoReference: paymentResponse.paymentId || paymentResponse.conversationId,
          date: new Date()
        }
      };

      console.log('📤 Sipariş verisi gönderiliyor:', orderData);

      const orderResponse = await axios.post(`${import.meta.env.VITE_API_URL}/orders', orderData);
      
      if (orderResponse.data.success) {
        console.log('✅ Sipariş başarıyla kaydedildi:', orderResponse.data);
        setOrderCode(orderResponse.data.orderCode);
        return orderResponse.data;
      } else {
        console.error('❌ Sipariş kaydedilemedi:', orderResponse.data);
        throw new Error(orderResponse.data.message || 'Sipariş kaydedilemedi');
      }
      
    } catch (error) {
      console.error('💥 Sipariş kaydetme hatası:', error);
      return null;
    }
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
      ad: guestInfo.ad || guestInfo.name || '',
      soyad: guestInfo.soyad || guestInfo.surname || '',
      email: guestInfo.email || '',
      telefon: guestInfo.telefon || guestInfo.phone || '',
      adres_detay: guestInfo.adres_detay || guestInfo.address || '',
      sehir: guestInfo.sehir || guestInfo.city || '',
      posta_kodu: guestInfo.posta_kodu || guestInfo.zipCode || '',
      
      sepet: cart.map(item => ({
        product_id: item.id || item.product_id,
        translations: item.translations || { tr: { title: item.name || item.title || 'Ürün' } },
        category_title: item.category_title || item.category || 'Genel',
        price: item.price || item.fiyat || 0,
        quantity: item.quantity || item.adet || 1
      })),
      totalPrice: totalPrice,
      
      card: {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: cardNumberDigits,
        expireMonth: card.expireMonth.padStart(2, '0'),
        expireYear: card.expireYear,
        cvc: card.cvc
      }
    };

    try {
      const paymentResponse = await axios.post(`${import.meta.env.VITE_API_URL}/pay', paymentData);

      if (paymentResponse.data.success) {
        const orderResult = await saveOrderToDatabase(paymentResponse.data);
        setPaymentId(paymentResponse.data.paymentId);
        setCard({
          cardHolderName: '',
          cardNumber: '',
          expireMonth: '',
          expireYear: '',
          cvc: ''
        });
        setShowRegistrationModal(true);
      } else {
        setError(paymentResponse.data.message || 'Ödeme başarısız. Lütfen tekrar deneyin.');
        
        if (paymentResponse.data.error) {
          console.error('Ödeme Hatası Detayı:', paymentResponse.data.error);
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
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/tr/register/afterPay');
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
      navigate('/');
    }
  };

  // Debug bilgileri
  const totalPrice = calculateTotal();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h2 className="mb-4 text-center text-primary">
            <FaCreditCard className="me-2" />
            Ödeme Bilgileri
          </h2>
          
          {/* Bilgi Kartları */}
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="h-100 shadow-sm border-primary">
                <Card.Header className="bg-primary text-white">
                  <FaUser className="me-2" />
                  Müşteri Bilgileri
                </Card.Header>
                <Card.Body>
                  {guestInfo ? (
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Ad Soyad:</strong> {guestInfo.ad || guestInfo.name} {guestInfo.soyad || guestInfo.surname}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>E-posta:</strong> {guestInfo.email}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Telefon:</strong> {guestInfo.telefon || guestInfo.phone}
                      </ListGroup.Item>
                    </ListGroup>
                  ) : (
                    <p className="text-muted">Müşteri bilgisi bulunamadı</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-3">
              <Card className="h-100 shadow-sm border-success">
                <Card.Header className="bg-success text-white">
                  <FaMapMarkerAlt className="me-2" />
                  Teslimat Adresi
                </Card.Header>
                <Card.Body>
                  {guestInfo ? (
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Adres:</strong> {guestInfo.adres_detay || guestInfo.address}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Şehir:</strong> {guestInfo.sehir || guestInfo.city}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>İlçe:</strong> {guestInfo.ilce || guestInfo.district}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Posta Kodu:</strong> {guestInfo.posta_kodu || guestInfo.zipCode}
                      </ListGroup.Item>
                    </ListGroup>
                  ) : (
                    <p className="text-muted">Adres bilgisi bulunamadı</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-3">
              <Card className="h-100 shadow-sm border-warning">
                <Card.Header className="bg-warning text-dark">
                  <FaShoppingCart className="me-2" />
                  Sipariş Özeti
                </Card.Header>
                <Card.Body>
                  {cart.length > 0 ? (
                    <>
                      <ListGroup variant="flush">
                        {cart.map((item, index) => (
                          <ListGroup.Item key={index} className="d-flex justify-content-between">
                            <div>
                              <span>{item.name || item.title || 'Ürün'}</span>
                              <Badge bg="secondary" className="ms-2">
                                {item.quantity || item.adet || 1} adet
                              </Badge>
                            </div>
                            <span>
                              {((item.price || item.fiyat || 0) * (item.quantity || item.adet || 1)).toFixed(2)} TL
                            </span>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Toplam:</span>
                        <span>{totalPrice.toFixed(2)} TL</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted">Sepet boş</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Ödeme Formu */}
          <Card className="mb-4 shadow">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaCreditCard className="me-2 text-primary" />
                Kart Bilgileri
              </h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
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
                  </Col>
                  
                  <Col md={12} className="mb-3">
                    <Form.Group>
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
                  </Col>
                  
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Son Kullanma Ayı *</Form.Label>
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
                  
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Son Kullanma Yılı *</Form.Label>
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
                  
                  <Col md={4} className="mb-3">
                    <Form.Group>
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
                
                <div className="d-grid mt-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={loading}
                    className="py-3"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <FaRegCheckCircle className="me-2" />
                        Ödemeyi Tamamla ({totalPrice.toFixed(2)} TL)
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <div className="bg-light p-4 rounded text-center">
            <h5 className="text-muted">Güvenli Ödeme</h5>
            <div className="d-flex justify-content-center gap-4 mt-3">
              <div className="bg-white p-2 rounded shadow-sm">
                <img src="img.icons8.com/color/48/000000/visa.png" alt="Visa" width="48" />
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <img src="img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" width="48" />
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <img src="img.icons8.com/color/48/000000/amex.png" alt="Amex" width="48" />
              </div>
            </div>
            <p className="text-muted mt-3 small">
              Tüm ödemeler 256-bit SSL şifrelemesi ile güvence altındadır. Kart bilgileriniz asla saklanmaz.
            </p>
          </div>
        </Col>
      </Row>

      {/* Başarılı Ödeme Modalı */}
      <Modal 
        show={showRegistrationModal} 
        onHide={() => {}} 
        centered
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header className="bg-success text-white">
          <Modal.Title>
            <FaRegCheckCircle className="me-2" />
            Ödeme Başarılı! 🎉
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center mb-4">
            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4">
              <FaRegCheckCircle className="text-success" size={48} />
            </div>
          </div>
          
          <Alert variant="success" className="mb-4">
            <strong>Tebrikler!</strong> Ödemeniz başarıyla tamamlandı.
            <div className="mt-2">
              <small className="d-block">İşlem ID: {paymentId}</small>
              {orderCode && (
                <small className="d-block">Sipariş Kodu: {orderCode}</small>
              )}
            </div>
          </Alert>
          
          <h5 className="text-center mb-3">Gelecekteki siparişlerinizi daha kolay takip edebilmek için hesap oluşturun</h5>
          
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <h5 className="text-success">✓ Sipariş geçmişinizi görüntüleyin</h5>
                  <p className="text-muted small">Tüm siparişlerinizi tek bir yerden takip edebilirsiniz</p>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-6 mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <h5 className="text-success">✓ Daha hızlı alışveriş yapın</h5>
                  <p className="text-muted small">Adres ve ödeme bilgileriniz kaydedilir</p>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-6 mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <h5 className="text-success">✓ Özel indirimlerden haberdar olun</h5>
                  <p className="text-muted small">Üyelere özel kampanyalardan yararlanın</p>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-6 mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <h5 className="text-success">✓ Sipariş durumunu takip edin</h5>
                  <p className="text-muted small">Siparişinizin durumunu anlık olarak görün</p>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button 
            variant="outline-primary" 
            size="lg"
            onClick={() => handleRegistrationChoice('register')}
            className="px-5"
          >
            Hesap Oluştur
          </Button>
          <Button 
            variant="success" 
            size="lg"
            onClick={() => handleRegistrationChoice('continue')}
            className="px-5"
          >
            Devam Et
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;