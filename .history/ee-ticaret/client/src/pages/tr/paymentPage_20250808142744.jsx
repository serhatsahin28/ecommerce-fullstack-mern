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
    expiry: '',
    cvc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const fetchSavedCards = async () => {
      if (!token) return;
      try {
        const response = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Sunucudan gelen 'odeme_yontemleri' dizisindeki her objenin
        // 'ucs_token' (veya veritabanındaki adı ne ise) bir alan içerdiğini varsayıyoruz.
        setSavedCards(response.data.odeme_yontemleri || []);
      } catch (err) {
        console.error("Saved cards could not be fetched:", err);
      }
    };

    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    const storedAddress = localStorage.getItem('userAddress');

    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    } else if (storedAddress) {
      const addressData = JSON.parse(storedAddress);
      if (token) {
        (async () => {
          try {
            const response = await axios.get('http://localhost:5000/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            setGuestInfo({
              ...addressData,
              ad: response.data.ad, soyad: response.data.soyad,
              telefon: response.data.telefon, email: response.data.email
            });
          } catch (err) { 
            console.error("User info could not be fetched:", err);
            setGuestInfo(addressData); 
          }
        })();
      } else {
        setGuestInfo(addressData);
      }
    }

    if (storedCart) setCart(JSON.parse(storedCart));
    fetchSavedCards();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length <= 19) setCard(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'expiry') {
      let formattedValue = value.replace(/[^\d/]/g, '');
      if (formattedValue.length > 2 && !formattedValue.includes('/')) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
      }
      if (formattedValue.length > 5) formattedValue = formattedValue.substring(0, 5);
      setCard(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'cvc') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) setCard(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setCard(prev => ({ ...prev, [name]: value }));
    }
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

  const saveOrderToDatabase = async (paymentResponse) => {
    try {
      const token = localStorage.getItem('token');
      let userId = null;
      if (token) {
        try {
          const payload = token.split('.')[1];
          userId = JSON.parse(atob(payload)).userId;
        } catch (err) { console.error('Token decode error:', err); }
      }

      const orderData = {
        userId,
        email: guestInfo.email,
        firstName: guestInfo.ad || guestInfo.name || '',
        lastName: guestInfo.soyad || guestInfo.surname || '',
        phone: guestInfo.telefon || guestInfo.phone || '',
        cart: cart.map(item => ({
          product_id: item.id || item.product_id,
          name: item.translations?.tr?.name || 'Product',
          category: item.category_title || 'General',
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
      } else {
        console.error('Order could not be saved:', orderResponse.data.message);
      }
    } catch (error) {
      console.error('Order save error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!guestInfo || cart.length === 0) {
      setError('Teslimat bilgileri veya sepet boş. Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    let ucsToken = null;
    if (selectedSavedCard) {
      // Veritabanından gelen kart objesindeki token alanını bul.
      // Yaygın isimleri kontrol et (DB'deki isme göre düzenle). Örn: ucs_token, ucsToken, cardToken vb.
      ucsToken = selectedSavedCard.ucs_token || selectedSavedCard.ucsToken;
      
      if (!ucsToken) {
        setError('Seçilen kayıtlı kart için geçerli bir ödeme tokenı bulunamadı. Lütfen yeni bir kart ile deneyin veya kartı silip tekrar ekleyin.');
        setLoading(false);
        return;
      }
      if (!card.cvc || card.cvc.length < 3) {
        setError('Kayıtlı kart için geçerli bir CVC kodu girmelisiniz.');
        setLoading(false);
        return;
      }
    } else { // Yeni kart doğrulama
        if (!card.cardHolderName.trim()) {
            setError('Kart sahibi adı zorunludur.'); setLoading(false); return;
        }
        if (card.cardNumber.replace(/\D/g, '').length !== 16) {
            setError('Kart numarası 16 haneli olmalıdır.'); setLoading(false); return;
        }
        if (!card.expiry.match(/^\d{2}\/\d{2}$/)) {
            setError('Son kullanma tarihi GG/YY formatında olmalıdır.'); setLoading(false); return;
        }
        if (!card.cvc || card.cvc.length < 3) {
            setError('CVC kodu en az 3 haneli olmalıdır.'); setLoading(false); return;
        }
    }

    const totalPrice = calculateTotal();
    const expiryParts = card.expiry.split('/');
    
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
        translations: item.translations || { tr: { name: 'Product' } },
        category_title: item.category_title || 'General',
        price: item.price || 0,
        quantity: item.quantity || 1
      })),
      totalPrice: totalPrice,

      // TEMİZLENMİŞ VERİ GÖNDERİMİ: Backend artık sadece bu alanlara bakacak.
      savedCardId: ucsToken, // Değişkenin adı backend'de 'savedCardId' olarak beklendiği için böyle bırakıldı, ancak değeri ARTIK TOKEN.
      cvc: selectedSavedCard ? card.cvc : null,

      // Sadece yeni kart seçiliyse bu obje dolu olacak.
      card: selectedSavedCard ? null : {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: card.cardNumber.replace(/\s/g, ''),
        expireMonth: expiryParts[0],
        expireYear: `20${expiryParts[1]}`,
        cvc: card.cvc
      }
    };

    try {
      const paymentResponse = await axios.post('http://localhost:5000/pay', paymentData);

      if (paymentResponse.data.success) {
        await saveOrderToDatabase(paymentResponse.data);
        setPaymentId(paymentResponse.data.paymentId);
        setCard({ cardHolderName: '', cardNumber: '', expiry: '', cvc: '' });
        setSelectedSavedCard(null);
        setShowRegistrationModal(true);
      } else {
        setError(paymentResponse.data.message || 'Ödeme başarısız oldu.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme sırasında beklenmedik bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationChoice = (choice) => {
    setShowRegistrationModal(false);
    if (choice === 'register' && !isLoggedIn) {
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/tr/register/afterPay');
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
      localStorage.removeItem('userAddress'); // Temizlik için bu da eklendi.
      navigate('/');
    }
  };

  const handleUseSavedCard = (savedCard) => {
    setSelectedSavedCard(savedCard);
    setCard({ cardHolderName: '', cardNumber: '', expiry: '', cvc: '' });
    setError(''); // Kart değiştirildiğinde hatayı temizle
  };

  const handleUseNewCard = () => {
    setSelectedSavedCard(null);
    setError(''); // Kart değiştirildiğinde hatayı temizle
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
                      <ListGroup.Item><b>Ad Soyad:</b> {guestInfo.ad || guestInfo.name} {guestInfo.soyad || guestInfo.surname}</ListGroup.Item>
                      <ListGroup.Item><b>Telefon:</b> {guestInfo.telefon || guestInfo.phone}</ListGroup.Item>
                      <ListGroup.Item><b>E-posta:</b> {guestInfo.email}</ListGroup.Item>
                      <ListGroup.Item><b>Adres:</b> {guestInfo.adres_detay || guestInfo.address}</ListGroup.Item>
                      <ListGroup.Item><b>İl/İlçe:</b> {guestInfo.sehir || guestInfo.city} / {guestInfo.ilce || guestInfo.district}</ListGroup.Item>
                      <ListGroup.Item><b>Posta Kodu:</b> {guestInfo.posta_kodu || guestInfo.zipCode}</ListGroup.Item>
                    </ListGroup>
                  ) : <p className="text-muted">Bilgiler bulunamadı</p>}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-warning">
                <Card.Header className="bg-warning text-dark d-flex align-items-center">
                  <FaShoppingCart className="me-2" />
                  Sipariş Özeti
                </Card.Header>
                <Card.Body>
                  {cart.length > 0 ? (
                    <>
                      <ListGroup variant="flush">
                        {cart.map((item, index) => (
                          <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center px-0">
                            <span>{item.translations?.tr?.name || 'Ürün'} x {item.quantity || 1}</span>
                            <span>{((item.price || 0) * (item.quantity || 1)).toFixed(2)} TL</span>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                      <hr/>
                      <div className="d-flex justify-content-between fw-bold fs-5">
                          <span>Toplam:</span>
                          <span>{totalPrice.toFixed(2)} TL</span>
                      </div>
                    </>
                  ) : <p className="text-muted p-3">Sepetiniz boş</p>}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card className="mb-4 shadow border-primary">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Kart Bilgileri</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {isLoggedIn && savedCards.length > 0 && (
                <div className="mb-4">
                  <h5 className="mb-3">Kayıtlı Kartlarım</h5>
                  <Row>
                    {savedCards.map((savedCard) => (
                      <Col md={6} key={savedCard._id} className="mb-3">
                        <Card 
                          className={`cursor-pointer ${selectedSavedCard?._id === savedCard._id ? 'border-primary border-2' : ''}`}
                          onClick={() => handleUseSavedCard(savedCard)}
                        >
                          <Card.Body className="d-flex align-items-center">
                            <i className={`fab fa-cc-${savedCard.kart_tipi?.toLowerCase()} fa-2x me-3`}></i>
                            <div>
                              <div className="fw-bold">{savedCard.kart_ismi}</div>
                              <div className="text-muted">{savedCard.kart_numarasi}</div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                   <Button variant="link" size="sm" onClick={handleUseNewCard} disabled={!selectedSavedCard}>
                        Yeni Kart Kullan
                   </Button>
                  <hr />
                </div>
              )}
              
              <Form onSubmit={handleSubmit}>
                {selectedSavedCard ? (
                  <div className="mb-4 p-3 border rounded bg-light">
                    <h6>Seçili Kart: {selectedSavedCard.kart_ismi} ({selectedSavedCard.kart_numarasi})</h6>
                    <Form.Group as={Row} className="mt-3">
                      <Form.Label column sm="3">Güvenlik Kodu (CVC) *</Form.Label>
                      <Col sm="4">
                        <Form.Control 
                          type="password" name="cvc" value={card.cvc}
                          onChange={handleChange} placeholder="***" maxLength="4" required 
                        />
                      </Col>
                    </Form.Group>
                  </div>
                ) : (
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group><Form.Label>Kart Sahibi Adı Soyadı *</Form.Label><Form.Control type="text" name="cardHolderName" value={card.cardHolderName} onChange={handleChange} required /></Form.Group>
                    </Col>
                    <Col md={7} className="mb-3">
                      <Form.Group><Form.Label>Kart Numarası *</Form.Label><Form.Control type="text" name="cardNumber" value={card.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" required /></Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group><Form.Label>Son Kul. Tar. (AA/YY) *</Form.Label><Form.Control type="text" name="expiry" value={card.expiry} onChange={handleChange} placeholder="12/25" required /></Form.Group>
                    </Col>
                    <Col md={2} className="mb-3">
                      <Form.Group><Form.Label>CVC *</Form.Label><Form.Control type="password" name="cvc" value={card.cvc} onChange={handleChange} placeholder="123" required /></Form.Group>
                    </Col>
                  </Row>
                )}
                
                <div className="d-grid mt-4">
                  <Button type="submit" variant="primary" size="lg" disabled={loading} className="py-3 fw-bold">
                    {loading ? <><Spinner size="sm" animation="border" className="me-2" /> İşleniyor...</> : <><FaRegCheckCircle className="me-2" /> Ödemeyi Tamamla ({totalPrice.toFixed(2)} TL)</>}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton={false} className="bg-success text-white">
          <Modal.Title><FaRegCheckCircle className="me-2" /> Ödeme Başarılı!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
            <h4 className="mb-3">Siparişiniz başarıyla alındı.</h4>
            <p>Sipariş kodunuz: <strong>{orderCode}</strong></p>
            <p>İşlem referans numaranız: <small>{paymentId}</small></p>
            {!isLoggedIn && <p className="mt-4">Siparişlerinizi takip etmek ve daha hızlı alışveriş yapmak için şimdi üye olabilirsiniz.</p>}
        </Modal.Body>
        <Modal.Footer>
          {!isLoggedIn && <Button variant="outline-primary" onClick={() => handleRegistrationChoice('register')}>Hesap Oluştur</Button>}
          <Button variant="success" onClick={() => handleRegistrationChoice('continue')}>Alışverişe Devam Et</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;