// PaymentPage.js

import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaMapMarkerAlt, FaShoppingCart, FaRegCheckCircle } from 'react-icons/fa';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [card, setCard] = useState({ cardHolderName: '', cardNumber: '', expiry: '', cvc: '' });
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

  // DEĞİŞİKLİK YOK: Component yüklendiğinde verileri çeken kısım
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const fetchInitialData = async () => {
        // Kayıtlı Kartları Çek
        if (token) {
            try {
                const response = await axios.get('http://localhost:5000/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Not: DB'den gelen kart verilerinde `_id`, `kart_ismi`, `kart_numarasi`, `son_kullanma` ve `kart_tipi` alanlarının olduğundan emin olun.
                setSavedCards(response.data.odeme_yontemleri || []);
            } catch (err) {
                console.error("Kayıtlı kartlar çekilemedi:", err);
            }
        }

        // Misafir/Kullanıcı ve Adres Bilgilerini Çek
        const storedGuestInfo = localStorage.getItem('guestInfo');
        const storedAddress = localStorage.getItem('userAddress');
        if (storedGuestInfo) {
            setGuestInfo(JSON.parse(storedGuestInfo));
        } else if (storedAddress) {
            setGuestInfo(JSON.parse(storedAddress));
        }

        // Sepet Bilgisini Çek
        const storedCart = localStorage.getItem('cart');
        if (storedCart) setCart(JSON.parse(storedCart));
    };

    fetchInitialData();
  }, []);

  // DEĞİŞİKLİK YOK: Form elemanlarındaki değişiklikleri yöneten fonksiyon
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        if (formattedValue.length > 19) return;
    } else if (name === 'expiry') {
        formattedValue = value.replace(/[^\d/]/g, '');
        if (formattedValue.length > 2 && formattedValue.indexOf('/') === -1) {
            formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
        }
        if (formattedValue.length > 5) return;
    } else if (name === 'cvc') {
        formattedValue = value.replace(/\D/g, '');
        if (formattedValue.length > 4) return;
    }

    setCard(prev => ({ ...prev, [name]: formattedValue }));
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

  // DEĞİŞİKLİK YOK: Siparişi veritabanına kaydetme
  const saveOrderToDatabase = async (paymentResponse) => {
    try {
        const token = localStorage.getItem('token');
        const orderData = {
            email: guestInfo.email,
            firstName: guestInfo.ad || guestInfo.name,
            lastName: guestInfo.soyad || guestInfo.surname,
            phone: guestInfo.telefon || guestInfo.phone,
            cart: cart,
            totalAmount: calculateTotal(),
            shippingInfo: {
                address: guestInfo.adres_detay || guestInfo.address,
                city: guestInfo.sehir || guestInfo.city,
                district: guestInfo.ilce || guestInfo.district,
                postalCode: guestInfo.posta_kodu || guestInfo.zipCode,
            },
            payment: {
                method: 'iyzico',
                status: 'success',
                iyzicoReference: paymentResponse.paymentId,
                savedCardUsed: !!selectedSavedCard
            }
        };

        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            orderData.userId = payload.userId;
        }

        const orderResponse = await axios.post('http://localhost:5000/orders', orderData);
        if (orderResponse.data.success) {
            setOrderCode(orderResponse.data.orderCode);
        }
    } catch (error) {
        console.error('Sipariş kaydetme hatası:', error);
        setError('Ödeme başarılı ancak sipariş kaydedilemedi. Lütfen bizimle iletişime geçin.');
    }
  };

  // --- DÜZELTİLMİŞ KISIM: Ödeme Formunu Gönderme ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!guestInfo || cart.length === 0) {
        setError('Teslimat bilgileri veya sepetiniz boş. Lütfen önceki adıma dönüp tekrar deneyin.');
        setLoading(false);
        return;
    }

    // Validasyon
    if (selectedSavedCard && (!card.cvc || card.cvc.length < 3)) {
        setError('Kayıtlı kartınız için 3 veya 4 haneli Güvenlik Kodunu (CVC) girmeniz gereklidir.');
        setLoading(false);
        return;
    }
    if (!selectedSavedCard && (!card.cardHolderName || card.cardNumber.replace(/\D/g, '').length !== 16 || card.expiry.length !== 5 || !card.cvc)) {
        setError('Lütfen tüm yeni kart bilgilerini eksiksiz ve doğru bir şekilde doldurun.');
        setLoading(false);
        return;
    }

    // Backend'e gönderilecek veri nesnesi
    const paymentData = {
        ...guestInfo,
        sepet: cart,
        totalPrice: calculateTotal(),
        savedCardId: selectedSavedCard?._id || null,
        cvc: card.cvc,
        card: selectedSavedCard ? null : {
            cardHolderName: card.cardHolderName,
            cardNumber: card.cardNumber.replace(/\D/g, ''),
            expireMonth: card.expiry.split('/')[0],
            expireYear: `20${card.expiry.split('/')[1]}`,
            cvc: card.cvc
        }
    };

    try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/pay', paymentData, {
            headers: {
                "Content-Type": "application/json",
                // Sadece kayıtlı kart kullanılıyorsa yetkilendirme başlığını ekle
                ...(selectedSavedCard && token ? { Authorization: `Bearer ${token}` } : {})
            }
        });

        if (response.data.success) {
            setPaymentId(response.data.paymentId);
            setSuccess('Ödemeniz başarıyla tamamlandı!');
            await saveOrderToDatabase(response.data);
            
            localStorage.removeItem('cart'); // Sepeti temizle
            setShowRegistrationModal(true); // Başarı modalını göster
        } else {
            setError(response.data.message || 'Ödeme sırasında bir hata oluştu.');
        }

    } catch (err) {
        console.error('Ödeme API hatası:', err.response || err);
        if (err.response?.data?.message) {
            setError(err.response.data.message);
        } else if (err.code === 'ERR_NETWORK') {
            setError('Ödeme servisine ulaşılamıyor. İnternet bağlantınızı veya sunucu durumunu kontrol edin.');
        } else {
            setError('Ödeme başarısız oldu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
        }
    } finally {
        setLoading(false);
    }
  };

  // DEĞİŞİKLİK YOK: Diğer yardımcı fonksiyonlar
  const handleRegistrationChoice = (choice) => {
    setShowRegistrationModal(false);
    if (choice === 'register' && !isLoggedIn) {
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/tr/register/afterPay');
    } else {
      localStorage.removeItem('guestInfo');
      navigate('/');
    }
  };

  const handleUseSavedCard = (savedCard) => {
    setError('');
    setSelectedSavedCard(savedCard);
    setCard({ cardHolderName: '', cardNumber: '', expiry: '', cvc: '' });
  };

  const handleUseNewCard = () => {
    setError('');
    setSelectedSavedCard(null);
  };

  const totalPrice = calculateTotal();

  // --- DEĞİŞİKLİK YOK: JSX (Görünüm) Kısmı ---
  // Sizin sağladığınız JSX kodu buraya gelecek.
  // Herhangi bir değişiklik yapmanıza gerek yok.
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
                <Card.Header className="bg-success text-white d-flex align-items-center"><FaMapMarkerAlt className="me-2" />Teslimat ve İletişim Bilgileri</Card.Header>
                <Card.Body>
                  {guestInfo ? (
                    <ListGroup variant="flush">
                      <ListGroup.Item><b>Ad Soyad:</b> {guestInfo.ad || guestInfo.name} {guestInfo.soyad || guestInfo.surname}</ListGroup.Item>
                      <ListGroup.Item><b>Telefon:</b> {guestInfo.telefon || guestInfo.phone}</ListGroup.Item>
                      <ListGroup.Item><b>Email:</b> {guestInfo.email}</ListGroup.Item>
                      <ListGroup.Item><b>Adres:</b> {guestInfo.adres_detay || guestInfo.address}</ListGroup.Item>
                      <ListGroup.Item><b>Şehir/İlçe:</b> {guestInfo.sehir || guestInfo.city} / {guestInfo.ilce || guestInfo.district}</ListGroup.Item>
                      <ListGroup.Item><b>Posta Kodu:</b> {guestInfo.posta_kodu || guestInfo.zipCode}</ListGroup.Item>
                    </ListGroup>
                  ) : <p className="text-muted">Bilgiler bulunamadı.</p>}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-warning">
                <Card.Header className="bg-warning text-dark d-flex align-items-center"><FaShoppingCart className="me-2" />Sipariş Özeti</Card.Header>
                <Card.Body>
                  {cart.length > 0 ? (
                    <>
                      <ListGroup variant="flush">
                        {cart.map((item, index) => (
                          <ListGroup.Item key={index} className="d-flex justify-content-between">
                            <span>{item.translations?.tr?.title || 'Ürün'} x{item.quantity || 1}</span>
                            <strong>{((item.price || 0) * (item.quantity || 1)).toFixed(2)} TL</strong>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                      <hr/>
                      <div className="d-flex justify-content-between fw-bold fs-5 mt-3">
                        <span>Toplam:</span>
                        <span>{totalPrice.toFixed(2)} TL</span>
                      </div>
                    </>
                  ) : <p className="text-muted">Sepetiniz boş.</p>}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mb-4 shadow border-primary">
            <Card.Header as="h5" className="bg-light d-flex align-items-center"><FaCreditCard className="me-2 text-primary" />Kart Bilgileri</Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {isLoggedIn && savedCards.length > 0 && (
                <div className="mb-4">
                  <h6>Kayıtlı Kartlarım</h6>
                  {savedCards.map((sc, index) => (
                    <Button key={index} variant={selectedSavedCard?._id === sc._id ? 'primary' : 'outline-secondary'} className="me-2 mb-2" onClick={() => handleUseSavedCard(sc)}>
                      {sc.kart_ismi} ({sc.kart_numarasi})
                    </Button>
                  ))}
                  <Button variant="outline-info" className="mb-2" onClick={handleUseNewCard} disabled={!selectedSavedCard}>
                    Yeni Kart Kullan
                  </Button>
                  <hr/>
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                {selectedSavedCard ? (
                  <div className="p-3 border rounded bg-light">
                    <h6>Seçili Kart: {selectedSavedCard.kart_ismi} ({selectedSavedCard.kart_numarasi})</h6>
                    <Form.Group as={Col} md="6">
                      <Form.Label>Güvenlik Kodu (CVC) *</Form.Label>
                      <Form.Control type="password" name="cvc" value={card.cvc} onChange={handleChange} placeholder="***" maxLength="4" required />
                    </Form.Group>
                  </div>
                ) : (
                  <Row>
                    <Col md={12} className="mb-3"><Form.Group><Form.Label>Kart Sahibi Adı Soyadı *</Form.Label><Form.Control type="text" name="cardHolderName" value={card.cardHolderName} onChange={handleChange} required /></Form.Group></Col>
                    <Col md={12} className="mb-3"><Form.Group><Form.Label>Kart Numarası *</Form.Label><Form.Control type="text" name="cardNumber" value={card.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" required /></Form.Group></Col>
                    <Col md={6} className="mb-3"><Form.Group><Form.Label>Son Kullanma Tarihi (AA/YY) *</Form.Label><Form.Control type="text" name="expiry" value={card.expiry} onChange={handleChange} placeholder="12/25" required /></Form.Group></Col>
                    <Col md={6} className="mb-3"><Form.Group><Form.Label>CVC *</Form.Label><Form.Control type="password" name="cvc" value={card.cvc} onChange={handleChange} maxLength="4" required /></Form.Group></Col>
                  </Row>
                )}
                <div className="d-grid mt-4">
                  <Button type="submit" variant="primary" size="lg" disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaRegCheckCircle className="me-2" />Ödemeyi Tamamla ({totalPrice.toFixed(2)} TL)</>}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton={false} className="bg-success text-white">
            <Modal.Title><FaRegCheckCircle className="me-2"/>Ödeme Başarılı!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Alert variant="success">Tebrikler! Siparişiniz başarıyla alındı.</Alert>
            <p><strong>İşlem ID:</strong> {paymentId}</p>
            {orderCode && <p><strong>Sipariş Kodu:</strong> {orderCode}</p>}
            {!isLoggedIn && (
                <>
                    <hr/>
                    <p>Siparişlerinizi kolayca takip etmek ve sonraki alışverişlerinizi hızlandırmak için bir hesap oluşturun.</p>
                </>
            )}
        </Modal.Body>
        <Modal.Footer>
            {!isLoggedIn && <Button variant="outline-primary" onClick={() => handleRegistrationChoice('register')}>Hesap Oluştur</Button>}
            <Button variant="success" onClick={() => handleRegistrationChoice('continue')}>Anasayfaya Dön</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;s