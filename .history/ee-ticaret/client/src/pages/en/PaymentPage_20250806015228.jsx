import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaMapMarkerAlt, FaShoppingCart, FaRegCheckCircle } from 'react-icons/fa';

const PaymentPageEn = () => {
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
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    const storedAddress = localStorage.getItem('userAddress');
    
    if (storedGuestInfo) {
      const guestData = JSON.parse(storedGuestInfo);
      setGuestInfo(guestData);
    } else if (storedAddress) {
      const addressData = JSON.parse(storedAddress);
      
      if (token) {
        const fetchUserInfo = async () => {
          try {
            const response = await axios.get('http://localhost:5000/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            setGuestInfo({
              ...addressData,
              firstName: response.data.ad,
              lastName: response.data.soyad,
              phone: response.data.telefon,
              email: response.data.email,
            });

          } catch (error) {
            console.error("Failed to get user information:", error);
            setGuestInfo(addressData);
          }
        };
        
        fetchUserInfo();
      } else {
        setGuestInfo(addressData);
      }
    }
    
    if (storedCart) {
      try {
        const cartData = JSON.parse(storedCart);
        setCart(cartData);
      } catch (e) {
        console.error("Failed to parse cart data from localStorage", e);
        setCart([]);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length <= 19) {
        setCard(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }

    if (name === 'expireMonth') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 2 && (numericValue === '' || (parseInt(numericValue) >= 1 && parseInt(numericValue) <= 12))) {
        setCard(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    if (name === 'expireYear') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setCard(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    if (name === 'cvc') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setCard(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setCard(prev => ({ ...prev, [name]: value }));
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
      
      if (token) {
        try {
          const payload = token.split('.')[1];
          const decodedPayload = atob(payload);
          const payloadData = JSON.parse(decodedPayload);
          userId = payloadData.userId;
        } catch (error) {
          console.error('Token decode error:', error);
        }
      }

      const orderData = {
        userId: userId,
        email: guestInfo.email,
        firstName: guestInfo.firstName || guestInfo.ad || '',
        lastName: guestInfo.lastName || guestInfo.soyad || '',
        phone: guestInfo.phone || guestInfo.telefon || '',
        cart: cart.map(item => ({
          product_id: item.id || item.product_id,
          name: item.translations?.en?.name || 'Product',
          category: item.category_title || 'General',
          price: item.price || 0,
          quantity: item.quantity || 1
        })),
        totalAmount: calculateTotal(),
        shippingInfo: {
          address: guestInfo.address || guestInfo.adres_detay || '',
          city: guestInfo.city || guestInfo.sehir || '',
          district: guestInfo.district || guestInfo.ilce || '',
          postalCode: guestInfo.postalCode || guestInfo.posta_kodu || '',
          notes: guestInfo.notes || guestInfo.notlar || ''
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
        return orderResponse.data;
      } else {
        throw new Error(orderResponse.data.message || 'Order could not be saved');
      }
    } catch (error) {
      console.error('Order save error:', error);
      setError('An error occurred while saving your order. However, your payment was successful. Please contact support.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!guestInfo || cart.length === 0) {
      setError('Guest information or cart is empty. Please try again.');
      setLoading(false);
      return;
    }
    if (!card.cardHolderName.trim()) {
      setError('Cardholder name is required.');
      setLoading(false);
      return;
    }
    const cardNumberDigits = card.cardNumber.replace(/\D/g, '');
    if (cardNumberDigits.length !== 16) {
      setError('Card number must be 16 digits.');
      setLoading(false);
      return;
    }
    if (!card.expireMonth || parseInt(card.expireMonth, 10) < 1 || parseInt(card.expireMonth, 10) > 12) {
      setError('Please enter a valid month (01-12).');
      setLoading(false);
      return;
    }
    if (!card.expireYear || card.expireYear.length !== 4) {
      setError('Please enter a valid year (YYYY format).');
      setLoading(false);
      return;
    }
    if (!card.cvc || card.cvc.length < 3) {
      setError('CVC code must be at least 3 digits.');
      setLoading(false);
      return;
    }

    const totalPrice = calculateTotal();
    
    const paymentData = {
      ad: guestInfo.firstName || guestInfo.ad || '',
      soyad: guestInfo.lastName || guestInfo.soyad || '',
      email: guestInfo.email || '',
      telefon: guestInfo.phone || guestInfo.telefon || '',
      adres_detay: guestInfo.address || guestInfo.adres_detay || '',
      sehir: guestInfo.city || guestInfo.sehir || '',
      posta_kodu: guestInfo.postalCode || guestInfo.posta_kodu || '',
      sepet: cart.map(item => ({
        product_id: item.id || item.product_id,
        translations: item.translations || { en: { name: 'Product' } },
        category_title: item.category_title || 'General',
        price: item.price || 0,
        quantity: item.quantity || 1
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
      const paymentResponse = await axios.post('http://localhost:5000/pay', paymentData);

      if (paymentResponse.data.success) {
        await saveOrderToDatabase(paymentResponse.data);
        setPaymentId(paymentResponse.data.paymentId);
        setCard({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
        setShowRegistrationModal(true);
      } else {
        setError(paymentResponse.data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || 'Payment failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationChoice = (choice) => {
    setShowRegistrationModal(false);
    
    if (choice === 'register' && !isLoggedIn) {
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/en/register/afterPay');
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
      localStorage.removeItem('userAddress');
      navigate('/en');
    }
  };

  const totalPrice = calculateTotal();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h2 className="mb-4 text-center text-primary">
            <FaCreditCard className="me-2" />
            Payment Information
          </h2>
          
          <Row className="mb-4">
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-success">
                <Card.Header className="bg-success text-white d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />
                  Delivery and Contact Information
                </Card.Header>
                <Card.Body>
                  {guestInfo ? (
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <span className="fw-bold me-2">Full Name:</span>
                        <span>{guestInfo.firstName} {guestInfo.lastName}</span>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <span className="fw-bold me-2">Phone:</span>
                        <span>{guestInfo.phone}</span>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <span className="fw-bold me-2">Email:</span>
                        <span>{guestInfo.email}</span>
                      </ListGroup.Item>
                      {/* *** DÜZELTİLEN ALAN BAŞLANGICI *** */}
                      <ListGroup.Item>
                        <span className="fw-bold me-2">Address:</span>
                        <span>{guestInfo.address || guestInfo.adres_detay}</span>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <span className="fw-bold me-2">City/District:</span>
                        <span>{guestInfo.city || guestInfo.sehir} / {guestInfo.district || guestInfo.ilce}</span>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <span className="fw-bold me-2">Postal Code:</span>
                        <span>{guestInfo.postalCode || guestInfo.posta_kodu}</span>
                      </ListGroup.Item>
                      {/* *** DÜZELTİLEN ALAN SONU *** */}
                    </ListGroup>
                  ) : (
                    <p className="text-muted">Information not found</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-warning">
                <Card.Header className="bg-warning text-dark d-flex align-items-center">
                  <FaShoppingCart className="me-2" />
                  Order Summary
                </Card.Header>
                <Card.Body className="p-0">
                  {cart.length > 0 ? (
                    <div className="p-3">
                      <div className="border-bottom pb-2 mb-2">
                        <h6 className="fw-bold mb-3">Products in Your Cart</h6>
                        <ListGroup variant="flush">
                          {cart.map((item, index) => (
                            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center border-0 px-0">
                              <div>
                                <div className="fw-medium">
                                  {item.translations?.en?.name || 'Product'}
                                </div>
                                <div className="text-muted small mt-1">
                                  {item.category_title || 'Category'} • {item.quantity || 1} pcs
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
                          <span>Subtotal:</span>
                          <span>{totalPrice.toFixed(2)} TL</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Shipping Fee:</span>
                          <span className="text-success">Free</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-2 border-top">
                          <span>Total:</span>
                          <span>{totalPrice.toFixed(2)} TL</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted p-3">Cart is empty</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card className="mb-4 shadow border-primary">
            <Card.Header className="bg-light d-flex align-items-center">
              <FaCreditCard className="me-2 text-primary fs-4" />
              <h5 className="mb-0">Card Information</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Cardholder Name *</Form.Label>
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
                      <Form.Label>Card Number *</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="cardNumber" 
                        value={card.cardNumber}
                        onChange={handleChange} 
                        placeholder="1234 5678 9012 3456"
                        required 
                      />
                      <Form.Text className="text-muted">
                        Test card: 5528 7900 0000 0008
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Expiration Month *</Form.Label>
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
                      <Form.Label>Expiration Year *</Form.Label>
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
                    disabled={loading || cart.length === 0}
                    className="py-3 fw-bold"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaRegCheckCircle className="me-2" />
                        Complete Payment ({totalPrice.toFixed(2)} TL)
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
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
            <p className="text-muted mt-3 small">
              All payments are secured with 256-bit SSL encryption. Your card information is never stored.
            </p>
          </div>
        </Col>
      </Row>

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
            Payment Successful! 🎉
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center mb-4">
            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4">
              <FaRegCheckCircle className="text-success" size={48} />
            </div>
          </div>
          
          <Alert variant="success" className="mb-4">
            <strong>Congratulations!</strong> Your payment has been completed successfully.
            <div className="mt-2">
              <small className="d-block">Transaction ID: {paymentId}</small>
              {orderCode && (
                <small className="d-block">Order Code: <strong>{orderCode}</strong></small>
              )}
            </div>
          </Alert>
          
          {!isLoggedIn && (
            <>
              <h5 className="text-center mb-3">Create an account to easily track your future orders</h5>
              <Row className="mb-4">
                <Col md={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-3">
                      <h6 className="text-success">✓ View your order history</h6>
                      <p className="text-muted small mb-0">Track all your orders in one place</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-3">
                      <h6 className="text-success">✓ Shop faster</h6>
                      <p className="text-muted small mb-0">Save your address and payment information</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-3">
                      <h6 className="text-success">✓ Get exclusive discounts</h6>
                      <p className="text-muted small mb-0">Benefit from members-only campaigns</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-3">
                      <h6 className="text-success">✓ Track order status</h6>
                      <p className="text-muted small mb-0">Instantly see the status of your orders</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-top-0 pt-0">
          {!isLoggedIn && (
            <Button 
              variant="outline-primary" 
              size="lg"
              onClick={() => handleRegistrationChoice('register')}
              className="px-5"
            >
              Create Account
            </Button>
          )}
          <Button 
            variant="success" 
            size="lg"
            onClick={() => handleRegistrationChoice('continue')}
            className="px-5"
          >
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPageEn;