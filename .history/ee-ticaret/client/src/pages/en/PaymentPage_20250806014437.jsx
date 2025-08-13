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
    // Check session status
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Get data from localStorage
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    const storedAddress = localStorage.getItem('userAddress');
    
    // First check guestInfo, if not available, use userAddress
    if (storedGuestInfo) {
      const guestData = JSON.parse(storedGuestInfo);
      setGuestInfo(guestData);
    } else if (storedAddress) {
      const addressData = JSON.parse(storedAddress);
      
      // If session is open, get user's personal information
      if (token) {
        const fetchUserInfo = async () => {
          try {
            const response = await axios.get('http://localhost:5000/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // *** DÜZELTME BAŞLANGICI ***
            // Combine address info with user info from API
            // The API sends Turkish keys (ad, soyad), so we map them to English keys.
            setGuestInfo({
              ...addressData, // Keep address from localStorage
              firstName: response.data.ad, // Map 'ad' to 'firstName'
              lastName: response.data.soyad, // Map 'soyad' to 'lastName'
              phone: response.data.telefon, // Map 'telefon' to 'phone'
              email: response.data.email, // 'email' is likely the same
            });
            // *** DÜZELTME SONU ***

          } catch (error) {
            console.error("Failed to get user information:", error);
            // If API fails, at least show address info
            setGuestInfo(addressData);
          }
        };
        
        fetchUserInfo();
      } else {
        // If not logged in, just use the guest/address info
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
        // Use fallbacks to handle both guest and logged-in user data structures
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

    // Validation checks...
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
    // ... other validations

    const totalPrice = calculateTotal();
    
    // The payment payload requires Turkish keys ('ad', 'soyad')
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
    
    // Clear sensitive data after transaction
    localStorage.removeItem('cart');
    localStorage.removeItem('guestInfo');
    localStorage.removeItem('userAddress');

    if (choice === 'register' && !isLoggedIn) {
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/en/register/afterPay');
    } else {
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
                        {/* Now `firstName` and `lastName` will have values */}
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
                    </ListGroup>
                  ) : (
                    <p className="text-muted">Information not found</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            {/* The rest of the component remains the same */}
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
          
          {/* Payment Form... (unchanged) */}
          {/* Modal... (unchanged) */}
          
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentPageEn;