// PaymentPage.js

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
  const [success, setSuccess] = useState('');
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
        setSavedCards(response.data.odeme_yontemleri || []);
      } catch (err) {
        console.error("Kayıtlı kartlar getirilemedi:", err);
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
              ad: response.data.ad,
              soyad: response.data.soyad,
              telefon: response.data.telefon,
              email: response.data.email
            });
          } catch (err) {
            setGuestInfo(addressData);
          }
        })();
      } else {
        setGuestInfo(addressData);
      }
    }

    if (storedCart) setCart(JSON.parse(storedCart));
    if (token) fetchSavedCards();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length <= 19) setCard(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    if (name === 'expiry') {
      let formattedValue = value.replace(/[^\d/]/g, '');
      if (formattedValue.length > 2 && !formattedValue.includes('/')) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
      }
      if (formattedValue.length > 5) formattedValue = formattedValue.substring(0, 5);
      setCard(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    if (name === 'cvc') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) setCard(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

  const saveOrderToDatabase = async (paymentResponse) => {
    try {
      const token = localStorage.getItem('token');
      let userId = null;
      if (token) {
        try {
          const payload = token.split('.')[1];
          const decodedPayload = atob(payload);
          const payloadData = JSON.parse(decodedPayload);
          userId = payloadData.userId;
        } catch (err) { console.error('Token decode hatası:', err); }
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
      const orderResponse = await axios.post('http://localhost:5000/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (orderResponse.data.success) {
        setOrderCode(orderResponse.data.orderCode);
        return orderResponse.data;
      } else {
        throw new Error(orderResponse.data.message || 'Sipariş kaydedilemedi');
      }
    } catch (error) {
      console.error('Sipariş kaydetme hatası:', error);
      setError(error.response?.data?.message || 'Sipariş oluşturulurken bir hata oluştu.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!guestInfo || cart.length === 0) {
      setError('Teslimat bilgileri veya sepet boş. Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    // Kart geçerlilik kontrolleri
    if (selectedSavedCard) {
        if (!card.cvc || card.cvc.length < 3) {
            setError('Güvenlik kodu (CVC) en az 3 haneli olmalıdır.');
            setLoading(false);
            return;
        }
    } else {
      if (!card.cardHolderName.trim()) {
        setError('Kart sahibi adı zorunludur.'); setLoading(false); return;
      }
      if (card.cardNumber.replace(/\D/g, '').length !== 16) {
        setError('Kart numarası 16 haneli olmalıdır.'); setLoading(false); return;
      }
      const [expireMonth, expireYear] = card.expiry.split('/');
      if (!expireMonth || !expireYear || expireYear.length !== 2 || parseInt(expireMonth) < 1 || parseInt(expireMonth) > 12) {
        setError('Geçerli bir son kullanma tarihi girin (AA/YY).'); setLoading(false); return;
      }
      if (!card.cvc || card.cvc.length < 3) {
        setError('CVC kodu en az 3 haneli olmalıdır.'); setLoading(false); return;
      }
    }

    // Ortak bilgileri hazırla
    const commonData = {
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
      }))
    };
    
    // Ödeme verisini duruma göre oluştur
    let paymentData;
    if (selectedSavedCard) {
      // Kayıtlı kart ile ödeme
      paymentData = {
        ...commonData,
        savedCardId: selectedSavedCard._id, // Sadece kartın ID'si gönderilir
        cvc: card.cvc // Sadece CVC gönderilir
      };
    } else {
      // Yeni kart ile ödeme
      paymentData = {
        ...commonData,
        card: {
          cardHolderName: card.cardHolderName.trim(),
          cardNumber: card.cardNumber.replace(/\D/g, ''),
          expireMonth: card.expiry.split('/')[0].padStart(2, '0'),
          expireYear: `20${card.expiry.split('/')[1]}`,
          cvc: card.cvc
        }
      };
    }

    try {
      const token = localStorage.getItem('token');
      const paymentResponse = await axios.post('http://localhost:5000/pay', paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (paymentResponse.data.success) {
        const orderResult = await saveOrderToDatabase(paymentResponse.data);
        if (orderResult) {
            setPaymentId(paymentResponse.data.paymentId);
            setCard({ cardHolderName: '', cardNumber: '', expiry: '', cvc: '' });
            setSelectedSavedCard(null);
            setShowRegistrationModal(true);
            // Ödeme sonrası sepeti temizle
            localStorage.removeItem('cart');
            setCart([]);
        }
      } else {
        setError(paymentResponse.data.message || 'Ödeme başarısız. Lütfen tekrar deneyin.');
      }
    } catch (err) {
        setError(err.response?.data?.message || 'Ödeme sırasında beklenmedik bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
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
      localStorage.removeItem('guestInfo');
      navigate('/');
    }
  };

  const handleUseSavedCard = (savedCard) => {
    setSelectedSavedCard(savedCard);
    setCard({ cardHolderName: '', cardNumber: '', expiry: '', cvc: '' });
    setError('');
  };

  const handleUseNewCard = () => {
    setSelectedSavedCard(null);
    setError('');
  };

  const totalPrice = calculateTotal();

  return (
    <Container className="py-5">
      {/* ... Diğer JSX kodları aynı kalabilir ... */}

      {/* Ödeme Formu ve Butonları */}
      <Card className="mb-4 shadow border-primary">
            <Card.Header className="bg-light d-flex align-items-center">
              <FaCreditCard className="me-2 text-primary fs-4" />
              <h5 className="mb-0">Kart Bilgileri</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}> {/* Formu en dışa taşıdık */}
                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

                {/* Kayıtlı Kartlar Bölümü */}
                {isLoggedIn && savedCards.length > 0 && (
                   <div className="mb-4">
                     {/* ... Kayıtlı kart listeleme JSX'i aynı kalabilir ... */}
                   </div>
                )}
                
                {/* Seçili Kart Bölümü */}
                {selectedSavedCard && (
                  <div className="mb-4 p-3 border rounded bg-light">
                    {/* ... Seçili kart JSX'i aynı kalabilir ... */}
                    <Form.Group>
                        <Form.Label>Güvenlik Kodu (CVC/CVV) *</Form.Label>
                        <Form.Control type="password" name="cvc" value={card.cvc} onChange={handleChange} placeholder="Kartın arkasındaki 3 haneli kod" maxLength="4" required />
                    </Form.Group>
                  </div>
                )}
                
                {/* Yeni Kart Formu */}
                {!selectedSavedCard && (
                    <Row>
                        {/* ... Yeni kart form JSX'i aynı kalabilir ... */}
                    </Row>
                )}
                
                {/* TEK ÖDEME BUTONU */}
                <div className="d-grid mt-4">
                    <Button type="submit" variant="primary" size="lg" disabled={loading || (selectedSavedCard && !card.cvc)} className="py-3 fw-bold">
                        {loading ? (
                            <><Spinner size="sm" animation="border" className="me-2" /> İşleniyor...</>
                        ) : (
                            <><FaRegCheckCircle className="me-2" /> Ödemeyi Tamamla ({totalPrice.toFixed(2)} TL)</>
                        )}
                    </Button>
                </div>
              </Form> {/* Formu burada kapattık */}
            </Card.Body>
          </Card>

      {/* ... Kalan JSX (Güvenli Ödeme ve Modal) aynı kalabilir ... */}
    </Container>
  );
};

export default PaymentPage;