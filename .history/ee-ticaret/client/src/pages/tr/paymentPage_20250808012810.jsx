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
        // Expect that backend stores iyzico token fields on user profile, e.g. ucsToken/cardToken/token
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
    fetchSavedCards();
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
        formattedValue = formattedValue.substring(0,2) + '/' + formattedValue.substring(2);
      }
      if (formattedValue.length > 5) formattedValue = formattedValue.substring(0,5);
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

  const extractSavedCardToken = (savedCard) => {
    if (!savedCard) return null;
    // Try multiple possible token field names (depends on how you stored card in DB)
    return savedCard.ucsToken || savedCard.ucstoken || savedCard.cardToken || savedCard.card_token || savedCard.token || null;
  };

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
        } catch (err) { console.error('Token decode error:', err); }
      }

      const orderData = {
        userId: userId,
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
        return orderResponse.data;
      } else throw new Error(orderResponse.data.message || 'Order could not be saved');
    } catch (err) {
      console.error('Order save error:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!guestInfo || cart.length === 0) {
      setError('Guest information or cart is empty. Please try again.');
      setLoading(false);
      return;
    }

    const totalPrice = calculateTotal();

    // If using saved card, ensure we have token
    let savedCardToken = null;
    if (selectedSavedCard) {
      savedCardToken = extractSavedCardToken(selectedSavedCard);
      if (!savedCardToken) {
        setError('Seçili kayıtlı kart için geçerli bir token bulunamadı. Lütfen başka bir kart seçin veya yeni kart ekleyin.');
        setLoading(false);
        return;
      }
      if (!card.cvc || card.cvc.length < 3) {
        setError('Kayıtlı kart ile ödeme için CVC gereklidir.');
        setLoading(false);
        return;
      }
    } else {
      // validate new card as before
      if (!card.cardHolderName.trim()) { setError('Cardholder name is required.'); setLoading(false); return; }
      const cardNumberDigits = card.cardNumber.replace(/\D/g, '');
      if (cardNumberDigits.length !== 16) { setError('Card number must be 16 digits.'); setLoading(false); return; }
      const [expireMonth, expireYear] = card.expiry.split('/');
      if (!expireMonth || parseInt(expireMonth) < 1 || parseInt(expireMonth) > 12) { setError('Please enter a valid month (01-12).'); setLoading(false); return; }
      if (!expireYear || expireYear.length !== 2) { setError('Please enter a valid year (YY format).'); setLoading(false); return; }
      if (!card.cvc || card.cvc.length < 3) { setError('CVC code must be at least 3 digits.'); setLoading(false); return; }
    }

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
      // IMPORTANT: send the actual iyzico token, NOT your local DB id
      savedCardToken: savedCardToken, // <-- this is the iyzico token (ucsToken/cardToken)
      cvc: selectedSavedCard ? card.cvc : null,
      card: selectedSavedCard ? null : {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: card.cardNumber.replace(/\D/g, ''),
        expireMonth: card.expiry.split('/')[0].padStart(2, '0'),
        expireYear: `20${card.expiry.split('/')[1]}`,
        cvc: card.cvc
      }
    };

    try {
      const resp = await axios.post('http://localhost:5000/pay', paymentData);
      if (resp.data.success) {
        await saveOrderToDatabase(resp.data);
        setPaymentId(resp.data.paymentId || resp.data.payment_id || '');
        setCard({ cardHolderName: '', cardNumber: '', expiry: '', cvc: '' });
        setSelectedSavedCard(null);
        setShowRegistrationModal(true);
      } else {
        setError(resp.data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else if (err.response?.data?.detail) setError(`Error: ${err.response.data.detail}`);
      else setError('Payment failed. Please try again.');
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

  const handleUseSavedCard = (savedCard) => {
    setSelectedSavedCard(savedCard);
    setCard({ cardHolderName:'', cardNumber:'', expiry:'', cvc:'' });
  };

  const handleUseNewCard = () => setSelectedSavedCard(null);

  const totalPrice = calculateTotal();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h2 className="mb-4 text-center text-primary">
            <FaCreditCard className="me-2" />
            Payment Information
          </h2>

          {/* ... (UI şablonunu aynen korudum; büyük kısmı aynı) */}
          {/* Saved cards list, selected card UI etc. */}
          {/* Örnek olarak kayıtlı kart seçili iken sadece CVC alanı çıkıyor — bunu senin mevcut kodunda yaptığın gibi kullandım */}
          
          <Card className="mb-4 shadow border-primary">
            <Card.Header className="bg-light d-flex align-items-center">
              <FaCreditCard className="me-2 text-primary fs-4" />
              <h5 className="mb-0">Card Information</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

              {isLoggedIn && savedCards.length > 0 && (
                <div className="mb-4">
                  <h5 className="mb-3">Your Saved Cards</h5>
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
                                <i className={`fab fa-cc-${(savedCard.kart_tipi || '').toLowerCase()} fa-2x`}></i>
                              </div>
                              <div>
                                <div className="fw-bold">{savedCard.kart_ismi}</div>
                                <div className="text-muted">{savedCard.kart_numarasi}</div>
                                <div className="text-muted small">Expires: {savedCard.son_kullanma}</div>
                                <div className="text-muted small">Token: {extractSavedCardToken(savedCard) ? 'OK' : 'Missing'}</div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                    <Col md={12} className="mt-2">
                      <Button variant="outline-primary" size="sm" onClick={handleUseNewCard} disabled={selectedSavedCard === null}>
                        <i className="fas fa-plus me-1"></i> Use New Card
                      </Button>
                    </Col>
                  </Row>
                  <hr />
                </div>
              )}

              {selectedSavedCard && (
                <div className="mb-4 p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Selected Card</h6>
                    <Button variant="link" size="sm" onClick={handleUseNewCard}>Use Different Card</Button>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3">
                      <i className={`fab fa-cc-${(selectedSavedCard.kart_tipi || '').toLowerCase()} fa-2x`}></i>
                    </div>
                    <div>
                      <div className="fw-bold">{selectedSavedCard.kart_ismi}</div>
                      <div className="text-muted">{selectedSavedCard.kart_numarasi}</div>
                      <div className="text-muted small">Expires: {selectedSavedCard.son_kullanma}</div>
                    </div>
                  </div>

                  <Form.Group>
                    <Form.Label>Security Code (CVC/CVV) *</Form.Label>
                    <Form.Control 
                      type="password"
                      name="cvc"
                      value={card.cvc}
                      onChange={handleChange}
                      placeholder="3-digit code on back of card"
                      maxLength="4"
                      required
                    />
                    <Form.Text className="text-muted">Security code is required for each transaction.</Form.Text>
                  </Form.Group>
                </div>
              )}

              {!selectedSavedCard && (
                <Form onSubmit={handleSubmit}>
                  {/* Yeni kart formu tamamen aynı */}
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Cardholder Name *</Form.Label>
                        <Form.Control type="text" name="cardHolderName" value={card.cardHolderName} onChange={handleChange} placeholder="John Doe" required />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Card Number *</Form.Label>
                        <Form.Control type="text" name="cardNumber" value={card.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" required />
                        <Form.Text className="text-muted">Test card: 5528 7900 0000 0008</Form.Text>
                      </Form.Group>
                    </Col>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Expiration Date (MM/YY) *</Form.Label>
                          <Form.Control type="text" name="expiry" value={card.expiry} onChange={handleChange} placeholder="12/25" maxLength="5" required />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>CVC *</Form.Label>
                          <Form.Control type="password" name="cvc" value={card.cvc} onChange={handleChange} placeholder="123" maxLength="4" required />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Row>

                  <div className="d-grid mt-4">
                    <Button type="submit" variant="primary" size="lg" disabled={loading} className="py-3 fw-bold">
                      {loading ? (<><Spinner size="sm" animation="border" className="me-2" />Processing...</>) : (<><FaRegCheckCircle className="me-2" />Complete Payment ({totalPrice.toFixed(2)} TL)</>)}
                    </Button>
                  </div>
                </Form>
              )}

              {selectedSavedCard && (
                <div className="d-grid mt-4">
                  <Button type="button" variant="primary" size="lg" disabled={loading || !card.cvc} onClick={handleSubmit} className="py-3 fw-bold">
                    {loading ? (<><Spinner size="sm" animation="border" className="me-2" />Processing...</>) : (<><FaRegCheckCircle className="me-2" />Complete Payment ({totalPrice.toFixed(2)} TL)</>)}
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Güvenli ödeme UI (senin kodu aynen korudum) */}
          <div className="bg-light p-4 rounded text-center border">
            <h5 className="text-muted mb-3">Secure Payment</h5>
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
            <p className="text-muted mt-3 small">All payments are secured with 256-bit SSL encryption. Your card details are never stored.</p>
          </div>
        </Col>
      </Row>

      {/* Modal kısmı aynen kalabilir */}
      <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false} size="lg">
        <Modal.Header className="bg-success text-white">
          <Modal.Title><FaRegCheckCircle className="me-2" /> Payment Successful! 🎉</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center mb-4">
            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4">
              <FaRegCheckCircle className="text-success" size={48} />
            </div>
          </div>
          <Alert variant="success" className="mb-4">
            <strong>Congratulations!</strong> Your payment was completed successfully.
            <div className="mt-2"><small className="d-block">Transaction ID: {paymentId}</small>{orderCode && (<small className="d-block">Order Code: {orderCode}</small>)}</div>
          </Alert>

          {!isLoggedIn && (
            <>
              <h5 className="text-center mb-3">Create an account to easily track future orders</h5>
              <div className="row mb-4">
                {[ 'View order history','Shop faster','Get exclusive discounts','Track order status' ].map((t,i) => (
                  <div className="col-md-6 mb-3" key={i}>
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="text-center">
                        <h5 className="text-success">✓ {t}</h5>
                        <p className="text-muted small"></p>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          {!isLoggedIn && <Button variant="outline-primary" size="lg" onClick={() => handleRegistrationChoice('register')} className="px-5">Create Account</Button>}
          <Button variant="success" size="lg" onClick={() => handleRegistrationChoice('continue')} className="px-5">Continue</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;