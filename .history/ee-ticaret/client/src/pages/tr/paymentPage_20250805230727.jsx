import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();

  // State'ler
  const [card, setCard] = useState({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');

  // Sayfa yüklendiğinde localStorage'dan verileri al
  useEffect(() => {
    const storedGuestInfo = JSON.parse(localStorage.getItem('guestInfo'));
    const storedCart = JSON.parse(localStorage.getItem('cart'));

    if (!storedGuestInfo || !storedCart || storedCart.length === 0) {
      alert('Ödeme bilgileri eksik. Lütfen sürece baştan başlayın.');
      navigate('/tr/cart'); // Sepete veya misafir formuna yönlendir
      return;
    }
    
    setGuestInfo(storedGuestInfo);
    setCart(storedCart);
  }, [navigate]);

  // Kart formu için handleChange fonksiyonu (iyileştirilmiş)
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case 'cardNumber':
        formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        if (formattedValue.length > 19) return;
        break;
      case 'expireMonth':
      case 'expireYear':
      case 'cvc':
        formattedValue = value.replace(/\D/g, '');
        break;
      default:
        break;
    }
    setCard((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // Toplam fiyatı hesapla
  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  };
  
  // Ödeme başarılı olduktan sonra siparişi DB'ye kaydet
  const saveOrderToDatabase = async (paymentResponse) => {
    try {
      const orderData = {
        userId: null,
        email: guestInfo.email,
        firstName: guestInfo.ad,
        lastName: guestInfo.soyad,
        phone: guestInfo.telefon,
        cart: cart.map(item => ({
          product_id: item.id || item.product_id,
          name: item.name || 'Ürün',
          category: item.category_title || 'Genel',
          price: item.price || 0,
          quantity: item.quantity || 1
        })),
        totalAmount: calculateTotal(),
        shippingInfo: {
          address: guestInfo.adres_detay,
          city: guestInfo.sehir,
          district: guestInfo.ilce,
          postalCode: guestInfo.posta_kodu,
        },
        payment: {
          method: 'iyzico',
          status: 'success',
          iyzicoReference: paymentResponse.paymentId || paymentResponse.conversationId,
          date: new Date()
        }
      };

      const orderResponse = await axios.post('http://localhost:5000/orders', orderData);
      
      if (orderResponse.data.success) {
        setOrderCode(orderResponse.data.orderCode);
        console.log('✅ Sipariş başarıyla kaydedildi:', orderResponse.data);
      } else {
        throw new Error(orderResponse.data.message || 'Sipariş kaydedilemedi');
      }
    } catch (error) {
      console.error('💥 Sipariş kaydetme hatası:', error);
      // Bu hata kullanıcıya gösterilmez, sadece loglanır.
    }
  };

  // Form gönderildiğinde çalışacak ana fonksiyon
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basit Validasyon
    const cardNumberDigits = card.cardNumber.replace(/\s/g, '');
    if (cardNumberDigits.length !== 16 || !card.cardHolderName || !card.expireMonth || card.expireYear.length !== 4 || card.cvc.length < 3) {
      setError('Lütfen tüm kart bilgilerini doğru ve eksiksiz doldurun.');
      setLoading(false);
      return;
    }

    const paymentData = {
      ...guestInfo,
      sepet: cart,
      totalPrice: calculateTotal(),
      card: {
        cardHolderName: card.cardHolderName,
        cardNumber: cardNumberDigits,
        expireMonth: card.expireMonth,
        expireYear: card.expireYear,
        cvc: card.cvc
      }
    };

    try {
      // 1. Ödeme isteği
      const paymentResponse = await axios.post('http://localhost:5000/pay', paymentData);

      if (paymentResponse.data.success) {
        // 2. Sipariş kaydı
        await saveOrderToDatabase(paymentResponse.data);
        setPaymentId(paymentResponse.data.paymentId);
        setShowRegistrationModal(true);
      } else {
        setError(paymentResponse.data.message || 'Ödeme başarısız oldu.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bir sunucu hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Modal'daki seçim sonrası yönlendirme
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

  const totalPrice = calculateTotal();

  if (!guestInfo || !cart) {
    return <Container className="d-flex justify-content-center py-5"><Spinner animation="border" /></Container>;
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Ödemeyi Tamamla</h1>
      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Sol Sütun: Misafir & Ödeme Bilgileri */}
          <Col md={7}>
            {/* Misafir Bilgileri Özeti */}
            <Card className="mb-4">
              <Card.Header as="h5">Teslimat Bilgileri</Card.Header>
              <Card.Body>
                <p><strong>Alıcı:</strong> {guestInfo.ad} {guestInfo.soyad}</p>
                <p><strong>E-posta:</strong> {guestInfo.email}</p>
                <p><strong>Adres:</strong> {guestInfo.adres_detay}, {guestInfo.ilce}/{guestInfo.sehir} {guestInfo.posta_kodu}</p>
                <Button variant="outline-secondary" size="sm" onClick={() => navigate('/tr/guestInfo')}>
                  Bilgileri Düzenle
                </Button>
              </Card.Body>
            </Card>

            {/* Kredi Kartı Formu */}
            <Card>
              <Card.Header as="h5">Ödeme Yöntemi</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Kart Üzerindeki İsim</Form.Label>
                  <Form.Control type="text" name="cardHolderName" value={card.cardHolderName} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Kart Numarası</Form.Label>
                  <Form.Control type="text" name="cardNumber" value={card.cardNumber} onChange={handleChange} placeholder="---- ---- ---- ----" required />
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Son Kul. Ay</Form.Label>
                      <Form.Control type="text" name="expireMonth" value={card.expireMonth} onChange={handleChange} placeholder="AA" maxLength="2" required />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Son Kul. Yıl</Form.Label>
                      <Form.Control type="text" name="expireYear" value={card.expireYear} onChange={handleChange} placeholder="YYYY" maxLength="4" required />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>CVC</Form.Label>
                      <Form.Control type="text" name="cvc" value={card.cvc} onChange={handleChange} placeholder="123" maxLength="4" required />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Sağ Sütun: Sipariş Özeti */}
          <Col md={5}>
            <Card className="position-sticky" style={{ top: '20px' }}>
              <Card.Header as="h5">Sipariş Özeti</Card.Header>
              <ListGroup variant="flush">
                {cart.map((item, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between">
                    <span>{item.name} ({item.quantity} adet)</span>
                    <span>{(item.price * item.quantity).toFixed(2)} TL</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Card.Body>
                <div className="d-flex justify-content-between h5">
                  <strong>Toplam Tutar</strong>
                  <strong>{totalPrice.toFixed(2)} TL</strong>
                </div>
              </Card.Body>
              <Card.Footer>
                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                <Button type="submit" variant="success" size="lg" className="w-100" disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" /> : `Ödemeyi Tamamla`}
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Form>
      
      {/* Kayıt Olma Seçeneği Modal */}
      <Modal show={showRegistrationModal} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Ödeme Başarılı! 🎉</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success">
            <strong>Tebrikler!</strong> Siparişiniz başarıyla alındı.
            {orderCode && <p className="mb-0 mt-2">Sipariş Kodunuz: <strong>{orderCode}</strong></p>}
            <small className="d-block mt-1">İşlem ID: {paymentId}</small>
          </Alert>
          <p className="mt-3">Gelecekteki siparişlerinizi kolayca takip etmek ve özel fırsatlardan yararlanmak için bir hesap oluşturmanızı öneririz.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => handleRegistrationChoice('continue')}>
            Hayır, Teşekkürler
          </Button>
          <Button variant="primary" onClick={() => handleRegistrationChoice('register')}>
            Hesap Oluştur
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;