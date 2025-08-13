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
  const [orderCode, setOrderCode] = useState(''); // Order code

  useEffect(() => {
    // Read guest and cart information from localStorage
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    
    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    }
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    // Print to console for debugging
    console.log('🔍 Stored Guest Info:', storedGuestInfo ? JSON.parse(storedGuestInfo) : null);
    console.log('🔍 Stored Cart:', storedCart ? JSON.parse(storedCart) : null);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format the card number (add a space every 4 digits)
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length <= 19) { // 16 digits + 3 spaces
        setCard((prev) => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }

    // Only digits and max 2 characters for month
    if (name === 'expireMonth') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 2 && (numericValue === '' || (parseInt(numericValue) >= 1 && parseInt(numericValue) <= 12))) {
        setCard((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // Only digits and max 4 characters for year
    if (name === 'expireYear') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setCard((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // Only digits and max 4 characters for CVC
    if (name === 'cvc') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setCard((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setCard((prev) => ({ ...prev, [name]: value }));
  };

  // Function to calculate total price
  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.price || item.fiyat || 0;
      const quantity = item.quantity || item.adet || 1;
      return acc + (price * quantity);
    }, 0);
  };

  // Function to save the order to the database
  const saveOrderToDatabase = async (paymentResponse) => {
    try {
      console.log('💾 Saving order to the database...');
      
      const orderData = {
        // User info (null for guest user)
        userId: null, // Guest user
        email: guestInfo.email,
        firstName: guestInfo.ad || guestInfo.name || '',
        lastName: guestInfo.soyad || guestInfo.surname || '',
        phone: guestInfo.telefon || guestInfo.phone || '',
        
        // Cart info - convert to the expected format for backend
        cart: cart.map(item => ({
          product_id: item.id || item.product_id,
          name: item.name || item.title || 'Product',
          category: item.category_title || item.category || 'General',
          price: item.price || item.fiyat || 0,
          quantity: item.quantity || item.adet || 1
        })),
        
        // Total amount
        totalAmount: calculateTotal(),
        
        // Shipping info
        shippingInfo: {
          address: guestInfo.adres_detay || guestInfo.address || '',
          city: guestInfo.sehir || guestInfo.city || '',
          district: guestInfo.ilce || guestInfo.district || '',
          postalCode: guestInfo.posta_kodu || guestInfo.zipCode || '',
          notes: guestInfo.notlar || guestInfo.notes || ''
        },
        
        // Payment info
        payment: {
          method: 'iyzico',
          status: 'success', // Payment is successful
          iyzicoReference: paymentResponse.paymentId || paymentResponse.conversationId,
          date: new Date()
        }
      };

      console.log('📤 Sending order data:', orderData);

      const orderResponse = await axios.post('http://localhost:5000/orders', orderData);
      
      if (orderResponse.data.success) {
        console.log('✅ Order saved successfully:', orderResponse.data);
        setOrderCode(orderResponse.data.orderCode);
        return orderResponse.data;
      } else {
        console.error('❌ Order could not be saved:', orderResponse.data);
        throw new Error(orderResponse.data.message || 'Order could not be saved');
      }
      
    } catch (error) {
      console.error('💥 Error saving order:', error);
      // We won't show the error to the user since the payment was successful
      // Just log it in the console
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validations
    if (!guestInfo || cart.length === 0) {
      setError('Guest information or cart is empty. Please try again.');
      setLoading(false);
      return;
    }

    // Card validations
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

    if (!card.expireMonth || parseInt(card.expireMonth) < 1 || parseInt(card.expireMonth) > 12) {
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
    
    // Payment data in backend expected format
    const paymentData = {
      // Send guest info separately
      ad: guestInfo.ad || guestInfo.name || '',
      soyad: guestInfo.soyad || guestInfo.surname || '',
      email: guestInfo.email || '',
      telefon: guestInfo.telefon || guestInfo.phone || '',
      adres_detay: guestInfo.adres_detay || guestInfo.address || '',
      sehir: guestInfo.sehir || guestInfo.city || '',
      posta_kodu: guestInfo.posta_kodu || guestInfo.zipCode || '',
      
      // Cart and price
      sepet: cart.map(item => ({
        product_id: item.id || item.product_id,
        translations: item.translations || { tr: { title: item.name || item.title || 'Product' } },
        category_title: item.category_title || item.category || 'General',
        price: item.price || item.fiyat || 0,
        quantity: item.quantity || item.adet || 1
      })),
      totalPrice: totalPrice,
      
      // Card information
      card: {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: cardNumberDigits, // Only digits
        expireMonth: card.expireMonth.padStart(2, '0'), // Format as 01, 02, etc.
        expireYear: card.expireYear,
        cvc: card.cvc
      }
    };

    console.log('📤 Frontend - Sent payment data:', paymentData);

    try {
      // 1. First process the payment
      const paymentResponse = await axios.post('http://localhost:5000/pay', paymentData);

      console.log('📥 Frontend - Payment API Response:', paymentResponse.data);

      if (paymentResponse.data.success) {
        console.log('✅ Payment successful, saving order...');
        
        // 2. If payment is successful, save the order in the database
        const orderData = await saveOrderToDatabase(paymentResponse.data);
        
        if (orderData) {
          setPaymentId(paymentResponse.data.paymentId || paymentResponse.data.conversationId);
          setSuccess(`Your payment was successful! Order Code: ${orderData.orderCode}`);
        } else {
          setError('There was an issue saving your order. Please try again.');
        }
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      setError('There was an error processing your payment. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <Container>
      <Row className="mt-5">
        <Col md={{ span: 6, offset: 3 }}>
          <h2>Payment Page</h2>
          
          {/* Display Success/Errors */}
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Payment Form */}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formCardHolderName">
              <Form.Label>Cardholder Name</Form.Label>
              <Form.Control
                type="text"
                name="cardHolderName"
                value={card.cardHolderName}
                onChange={handleChange}
                placeholder="Enter cardholder name"
                required
              />
            </Form.Group>

            <Form.Group controlId="formCardNumber">
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type="text"
                name="cardNumber"
                value={card.cardNumber}
                onChange={handleChange}
                placeholder="Enter card number"
                maxLength="19"
                required
              />
            </Form.Group>

            <Form.Row>
              <Col>
                <Form.Group controlId="formExpireMonth">
                  <Form.Label>Expire Month</Form.Label>
                  <Form.Control
                    type="text"
                    name="expireMonth"
                    value={card.expireMonth}
                    onChange={handleChange}
                    placeholder="MM"
                    maxLength="2"
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formExpireYear">
                  <Form.Label>Expire Year</Form.Label>
                  <Form.Control
                    type="text"
                    name="expireYear"
                    value={card.expireYear}
                    onChange={handleChange}
                    placeholder="YYYY"
                    maxLength="4"
                    required
                  />
                </Form.Group>
              </Col>
            </Form.Row>

            <Form.Group controlId="formCVC">
              <Form.Label>CVC</Form.Label>
              <Form.Control
                type="text"
                name="cvc"
                value={card.cvc}
                onChange={handleChange}
                placeholder="CVC"
                maxLength="4"
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" block disabled={loading}>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Pay Now'
              )}
            </Button>
          </Form>

          {/* Registration Modal */}
          <Modal show={showRegistrationModal} onHide={() => setShowRegistrationModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Registration</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Do you want to register?</p>
              <Button variant="secondary" onClick={() => setShowRegistrationModal(false)}>
                No
              </Button>
              <Button variant="primary" onClick={() => navigate('/register')}>
                Yes
              </Button>
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentPage;
