import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaMapMarkerAlt, FaShoppingCart, FaRegCheckCircle } from 'react-icons/fa';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState(null);
  const [showSavedCards, setShowSavedCards] = useState(false);

  useEffect(() => {
    // Oturum durumunu kontrol et
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Kayıtlı kartları getir (eğer giriş yapılmışsa)
    const fetchSavedCards = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSavedCards(response.data.odeme_yontemleri || []);
        } catch (error) {
          console.error("Kayıtlı kartlar alınamadı:", error);
        }
      }
    };

    // localStorage'dan verileri al
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    const storedAddress = localStorage.getItem('userAddress');
    
    // Öncelikle guestInfo'yu kontrol et, yoksa userAddress'i kullan
    if (storedGuestInfo) {
      const guestData = JSON.parse(storedGuestInfo);
      setGuestInfo(guestData);
    } else if (storedAddress) {
      const addressData = JSON.parse(storedAddress);
      
      // Oturum açıkken adres bilgilerini al
      if (token) {
        // Kullanıcı bilgilerini API'den çek
        const fetchUserInfo = async () => {
          try {
            const response = await axios.get('http://localhost:5000/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Adres bilgileri ile kullanıcı bilgilerini birleştir
            setGuestInfo({
              ...addressData,
              ad: response.data.ad,
              soyad: response.data.soyad,
              telefon: response.data.telefon,
              email: response.data.email
            });
          } catch (error) {
            console.error("Kullanıcı bilgileri alınamadı:", error);
            setGuestInfo(addressData);
          }
        };
        
        fetchUserInfo();
      } else {
        setGuestInfo(addressData);
      }
    }
    
    if (storedCart) {
      const cartData = JSON.parse(storedCart);
      setCart(cartData);
    }

    // Kayıtlı kartları getir
    fetchSavedCards();
  }, []);

const handleChange = (e) => {
  const { name, value } = e.target;
  
  // Son kullanma tarihi için özel işleme
  if (name === 'expiry') {
    // Sadece sayıları ve eğik çizgi kabul et
    let formattedValue = value.replace(/[^\d/]/g, '');
    
    // Format: AA/YY (2/2)
    const parts = formattedValue.split('/');
    let month = parts[0] || '';
    let year = parts[1] || '';
    
    // Ay kısmı 12'yi geçemez
    if (month.length > 0) {
      month = month.substring(0, 2);
      if (parseInt(month) > 12) month = '12';
    }
    
    // Yıl kısmı 2 karakterle sınırlı
    if (year.length > 0) {
      year = year.substring(0, 2);
    }
    
    // Değeri birleştir
    formattedValue = month + (year ? '/' + year : '');
    
    setCard(prev => ({ 
      ...prev, 
      expiry: formattedValue,
      expireMonth: month,
      expireYear: year
    }));
  }
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return acc + (price * quantity);
    }, 0);
  };

  const saveOrderToDatabase = async (paymentResponse) => {
    try {
      const token = localStorage.getItem('token');
      let userId = null;
      
      // Token varsa userId'yi çözümle
      if (token) {
        try {
          const payload = token.split('.')[1];
          const decodedPayload = atob(payload);
          const payloadData = JSON.parse(decodedPayload);
          userId = payloadData.userId;
        } catch (error) {
          console.error('Token decode hatası:', error);
        }
      }

      const orderData = {
        userId: userId,
        email: guestInfo.email,
        firstName: guestInfo.ad || guestInfo.name || '',
        lastName: guestInfo.soyad || guestInfo.surname || '',
        phone: guestInfo.telefon || guestInfo.phone || '',
        
        cart: cart.map(item => ({
          product_id: item.id || item.product_id,
          name: item.translations?.tr?.name || 'Ürün',
          category: item.category_title || 'Genel',
          price: item.price || 0,
          quantity: item.quantity || 1
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
          date: new Date(),
          savedCardUsed: selectedSavedCard !== null
        }
      };

      const orderResponse = await axios.post('http://localhost:5000/orders', orderData);
      
      if (orderResponse.data.success) {
        setOrderCode(orderResponse.data.orderCode);
        return orderResponse.data;
      } else {
        throw new Error(orderResponse.data.message || 'Sipariş kaydedilemedi');
      }
    } catch (error) {
      console.error('Sipariş kaydetme hatası:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!guestInfo || cart.length === 0) {
      setError('Misafir bilgileri veya sepet boş. Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    // Kayıtlı kart seçilmediyse form validasyonu yap
    if (selectedSavedCard === null) {
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
    }

    const totalPrice = calculateTotal();
    
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
        translations: item.translations || { tr: { name: 'Ürün' } },
        category_title: item.category_title || 'Genel',
        price: item.price || 0,
        quantity: item.quantity || 1
      })),
      totalPrice: totalPrice,
      
      // Kayıtlı kart kullanılıyorsa
      savedCardId: selectedSavedCard !== null ? selectedSavedCard.id || selectedSavedCard._id : null,
      cvc: selectedSavedCard !== null ? card.cvc : null,
      
      // Yeni kart kullanılıyorsa
      card: selectedSavedCard === null ? {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: cardNumberDigits,
        expireMonth: card.expireMonth.padStart(2, '0'),
        expireYear: card.expireYear,
        cvc: card.cvc
      } : null
    };

    try {
      const paymentResponse = await axios.post('http://localhost:5000/pay', paymentData);

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
        setSelectedSavedCard(null);
        setShowRegistrationModal(true);
      } else {
        setError(paymentResponse.data.message || 'Ödeme başarısız. Lütfen tekrar deneyin.');
      }
    } catch (err) {
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

  const handleUseSavedCard = (card) => {
    setSelectedSavedCard(card);
    setCard({
      cardHolderName: '',
      cardNumber: '',
      expireMonth: '',
      expireYear: '',
      cvc: ''
    });
  };

  const handleUseNewCard = () => {
    setSelectedSavedCard(null);
    setCard({
      cardHolderName: '',
      cardNumber: '',
      expireMonth: '',
      expireYear: '',
      cvc: ''
    });
  };

  const totalPrice = calculateTotal();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h2 className="mb-4 text-center text-primary">
            <FaCreditCard className="me-2" />
            Ödeme Bilgileri
          </h2>
          
          <Row className="mb-4">
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-success">
                <Card.Header className="bg-success text-white d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />
                  Teslimat ve İletişim Bilgileri
                </Card.Header>
                <Card.Body>
                  {guestInfo ? (
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex align-items-center">
                        <span className="fw-bold me-2">Ad Soyad:</span>
                        <span>{guestInfo.ad || guestInfo.name} {guestInfo.soyad || guestInfo.surname}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex align-items-center">
                        <span className="fw-bold me-2">Telefon:</span>
                        <span>{guestInfo.telefon || guestInfo.phone}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex align-items-center">
                        <span className="fw-bold me-2">E-posta:</span>
                        <span>{guestInfo.email}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex align-items-center">
                        <span className="fw-bold me-2">Adres:</span>
                        <span>{guestInfo.adres_detay || guestInfo.address}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex align-items-center">
                        <span className="fw-bold me-2">Şehir/İlçe:</span>
                        <span>{guestInfo.sehir || guestInfo.city} / {guestInfo.ilce || guestInfo.district}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex align-items-center">
                        <span className="fw-bold me-2">Posta Kodu:</span>
                        <span>{guestInfo.posta_kodu || guestInfo.zipCode}</span>
                      </ListGroup.Item>
                    </ListGroup>
                  ) : (
                    <p className="text-muted">Bilgiler bulunamadı</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-warning">
                <Card.Header className="bg-warning text-dark d-flex align-items-center">
                  <FaShoppingCart className="me-2" />
                  Sipariş Özeti
                </Card.Header>
                <Card.Body className="p-0">
                  {cart.length > 0 ? (
                    <div className="p-3">
                      <div className="border-bottom pb-2 mb-2">
                        <h6 className="fw-bold mb-3">Sepetinizdeki Ürünler</h6>
                        <ListGroup variant="flush">
                          {cart.map((item, index) => (
                            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center border-0 px-0">
                              <div>
                                <div className="fw-medium">
                                  {item.translations?.tr?.name || 'Ürün'}
                                </div>
                                <div className="text-muted small mt-1">
                                  {item.category_title || 'Kategori'} • {item.quantity || 1} adet
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="fw-bold">
                                  {((item.price || 0) * (item.quantity || 1)).toFixed(2)} TL
                                </div>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                      
                      <div className="border-top pt-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Ara Toplam:</span>
                          <span>{totalPrice.toFixed(2)} TL</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Kargo Ücreti:</span>
                          <span>Ücretsiz</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-2 border-top">
                          <span>Toplam:</span>
                          <span>{totalPrice.toFixed(2)} TL</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted p-3">Sepet boş</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Ödeme Formu */}
          <Card className="mb-4 shadow border-primary">
            <Card.Header className="bg-light d-flex align-items-center">
              <FaCreditCard className="me-2 text-primary fs-4" />
              <h5 className="mb-0">Kart Bilgileri</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
              
             {/* Kayıtlı Kartlar Bölümü */}
{isLoggedIn && savedCards.length > 0 && (
  <div className="mb-4">
    <h5 className="mb-3">Kayıtlı Kartlarınız</h5>
    
    <Row>
      {savedCards.map((savedCard, index) => (
        <Col md={6} key={index} className="mb-3">
          <Card 
            className={`cursor-pointer ${selectedSavedCard?._id === savedCard._id ? 'border-primary border-2' : ''}`}
            onClick={() => handleUseSavedCard(savedCard)}
          >
            <Card.Body className="py-3">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className={`fab fa-cc-${savedCard.kart_tipi.toLowerCase()} fa-2x`}></i>
                </div>
                <div>
                  <div className="fw-bold">{savedCard.kart_ismi}</div>
                  <div className="text-muted">{savedCard.kart_numarasi}</div>
                  <div className="text-muted small">Son Kullanma: {savedCard.son_kullanma}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
      
      <Col md={12} className="mt-2">
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={handleUseNewCard}
        >
          <i className="fas fa-plus me-1"></i> Yeni Kart Kullan
        </Button>
      </Col>
    </Row>
    
    <hr />
  </div>
)}
              
            {selectedSavedCard && (
  <div className="mb-4 p-3 border rounded bg-light">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h6>Seçili Kart</h6>
      <Button 
        variant="link" 
        size="sm"
        onClick={handleUseNewCard}
      >
        Farklı Kart Kullan
      </Button>
    </div>
    
    <div className="d-flex align-items-center mb-3">
      <div className="me-3">
        <i className={`fab fa-cc-${selectedSavedCard.kart_tipi.toLowerCase()} fa-2x`}></i>
      </div>
      <div>
        <div className="fw-bold">{selectedSavedCard.kart_ismi}</div>
        <div className="text-muted">{selectedSavedCard.kart_numarasi}</div>
        <div className="text-muted small">Son Kullanma: {selectedSavedCard.son_kullanma}</div>
      </div>
    </div>
    
    <Form.Group>
      <Form.Label>Güvenlik Kodu (CVC/CVV) *</Form.Label>
      <Form.Control 
        type="password" 
        name="cvc" 
        value={card.cvc}
        onChange={handleChange} 
        placeholder="Kartınızın arkasındaki 3 haneli kod"
        maxLength="3"
        required 
      />
      <Form.Text className="text-muted">
        Güvenlik nedeniyle her işlemde CVV kodunuzu girmeniz gerekmektedir.
      </Form.Text>
    </Form.Group>
  </div>
)}
              
              {/* Yeni kart formu (sadece kayıtlı kart seçilmediyse göster) */}
              {!selectedSavedCard && (
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
                    
                    <Row>
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
                  </Row>
                  
                  <div className="d-grid mt-4">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg"
                      disabled={loading}
                      className="py-3 fw-bold"
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
              )}
              
              {/* Kayıtlı kart seçildiğinde ödeme butonu */}
              {selectedSavedCard && (
                <div className="d-grid mt-4">
                  <Button 
                    type="button" 
                    variant="primary" 
                    size="lg"
                    disabled={loading || !card.cvc}
                    onClick={handleSubmit}
                    className="py-3 fw-bold"
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
              )}
            </Card.Body>
          </Card>
          
          <div className="bg-light p-4 rounded text-center border">
            <h5 className="text-muted mb-3">Güvenli Ödeme</h5>
            <div className="d-flex justify-content-center gap-4 mt-3">
              <div className="bg-white p-2 rounded shadow-sm">
                <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" width="48" />
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" width="48" />
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <img src="https://img.icons8.com/color/48/000000/amex.png" alt="Amex" width="48" />
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
          
          {/* Sadece oturum açık değilse hesap oluşturma teklifini göster */}
          {!isLoggedIn && (
            <>
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
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          {/* Sadece oturum açık değilse Hesap Oluştur butonunu göster */}
          {!isLoggedIn && (
            <Button 
              variant="outline-primary" 
              size="lg"
              onClick={() => handleRegistrationChoice('register')}
              className="px-5"
            >
              Hesap Oluştur
            </Button>
          )}
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