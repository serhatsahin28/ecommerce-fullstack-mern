// import React, { useState, useEffect } from 'react';
// import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const PaymentPageEn = () => {
//   const navigate = useNavigate();
//   const [card, setCard] = useState({
//     cardHolderName: '',
//     cardNumber: '',
//     expireMonth: '',
//     expireYear: '',
//     cvc: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [guestInfo, setGuestInfo] = useState(null);
//   const [cart, setCart] = useState([]);
//   const [showRegistrationModal, setShowRegistrationModal] = useState(false);
//   const [paymentId, setPaymentId] = useState('');
//   const [orderCode, setOrderCode] = useState(''); // For the order code

//   useEffect(() => {
//     const storedGuestInfo = localStorage.getItem('guestInfo');
//     const storedCart = localStorage.getItem('cart');
    
//     if (storedGuestInfo) {
//       setGuestInfo(JSON.parse(storedGuestInfo));
//     }
//     if (storedCart) {
//       setCart(JSON.parse(storedCart));
//     }

//     console.log('🔍 Stored Guest Info:', storedGuestInfo ? JSON.parse(storedGuestInfo) : null);
//     console.log('🔍 Stored Cart:', storedCart ? JSON.parse(storedCart) : null);
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === 'cardNumber') {
//       const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
//       if (formattedValue.length <= 19) {
//         setCard((prev) => ({ ...prev, [name]: formattedValue }));
//       }
//       return;
//     }

//     if (name === 'expireMonth') {
//       const numericValue = value.replace(/\D/g, '');
//       if (numericValue.length <= 2 && (numericValue === '' || (parseInt(numericValue) >= 1 && parseInt(numericValue) <= 12))) {
//         setCard((prev) => ({ ...prev, [name]: numericValue }));
//       }
//       return;
//     }

//     if (name === 'expireYear') {
//       const numericValue = value.replace(/\D/g, '');
//       if (numericValue.length <= 4) {
//         setCard((prev) => ({ ...prev, [name]: numericValue }));
//       }
//       return;
//     }

//     if (name === 'cvc') {
//       const numericValue = value.replace(/\D/g, '');
//       if (numericValue.length <= 4) {
//         setCard((prev) => ({ ...prev, [name]: numericValue }));
//       }
//       return;
//     }

//     setCard((prev) => ({ ...prev, [name]: value }));
//   };

//   const calculateTotal = () => {
//     return cart.reduce((acc, item) => {
//       const price = item.price || item.fiyat || 0;
//       const quantity = item.quantity || item.adet || 1;
//       return acc + (price * quantity);
//     }, 0);
//   };

//   const saveOrderToDatabase = async (paymentResponse) => {
//     try {
//       console.log('💾 Saving order to the database...');
      
//       const orderData = {
//         userId: null,
//         email: guestInfo.email,
//         // *** BAŞLANGIÇ: DÜZELTİLMİŞ ALAN 1 ***
//         // Veritabanı için doğru anahtarlar kullanılıyor
//         firstName: guestInfo.firstName || '',
//         lastName: guestInfo.lastName || '',
//         phone: guestInfo.phone || '',
//         // *** BİTİŞ: DÜZELTİLMİŞ ALAN 1 ***
        
//         cart: cart.map(item => ({
//           product_id: item.id || item.product_id,
//           name: item.name || item.title || 'Product',
//           category: item.category_title || item.category || 'General',
//           price: item.price || item.fiyat || 0,
//           quantity: item.quantity || item.adet || 1
//         })),
        
//         totalAmount: calculateTotal(),
        
//         // *** BAŞLANGIÇ: DÜZELTİLMİŞ ALAN 2 ***
//         shippingInfo: {
//           address: guestInfo.addressDetail || '',
//           city: guestInfo.city || '',
//           district: guestInfo.district || '',
//           postalCode: guestInfo.postalCode || '',
//           notes: guestInfo.notes || ''
//         },
//         // *** BİTİŞ: DÜZELTİLMİŞ ALAN 2 ***
        
//         payment: {
//           method: 'iyzico',
//           status: 'success',
//           iyzicoReference: paymentResponse.paymentId || paymentResponse.conversationId,
//           date: new Date()
//         }
//       };

//       console.log('📤 Sending order data:', orderData);
//       const orderResponse = await axios.post('http://localhost:5000/orders', orderData);
      
//       if (orderResponse.data.success) {
//         console.log('✅ Order saved successfully:', orderResponse.data);
//         setOrderCode(orderResponse.data.orderCode);
//         return orderResponse.data;
//       } else {
//         console.error('❌ Could not save order:', orderResponse.data);
//         throw new Error(orderResponse.data.message || 'Could not save the order');
//       }
//     } catch (error) {
//       console.error('💥 Order saving error:', error);
//       return null;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     if (!guestInfo || cart.length === 0) {
//       setError('Guest information or cart is empty. Please try again.');
//       setLoading(false);
//       return;
//     }

//     // Card validations... (no changes here)

//     const totalPrice = calculateTotal();
//     const cardNumberDigits = card.cardNumber.replace(/\D/g, '');
    
//     // *** BAŞLANGIÇ: ANA DÜZELTME ALANI ***
//     // Backend'in beklediği format. guestInfo objesinden doğru anahtarlar okunuyor
//     // ve backend'in beklediği Türkçe anahtarlara atanıyor.
//     const paymentData = {
//       ad: guestInfo.firstName || '',
//       soyad: guestInfo.lastName || '',
//       email: guestInfo.email || '',
//       telefon: guestInfo.phone || '',
//       adres_detay: guestInfo.addressDetail || '',
//       sehir: guestInfo.city || '',
//       posta_kodu: guestInfo.postalCode || '',
      
//       sepet: cart.map(item => ({
//         product_id: item.id || item.product_id,
//         translations: item.translations || { en: { title: item.name || item.title || 'Product' } },
//         category_title: item.category_title || item.category || 'General',
//         price: item.price || item.fiyat || 0,
//         quantity: item.quantity || item.adet || 1
//       })),
//       totalPrice: totalPrice,
      
//       card: {
//         cardHolderName: card.cardHolderName.trim(),
//         cardNumber: cardNumberDigits,
//         expireMonth: card.expireMonth.padStart(2, '0'),
//         expireYear: card.expireYear,
//         cvc: card.cvc
//       }
//     };
//     // *** BİTİŞ: ANA DÜZELTME ALANI ***

//     console.log('📤 Frontend - Gönderilen ödeme verisi:', paymentData); 

//     try {
//       const paymentResponse = await axios.post('http://localhost:5000/pay', paymentData);

//       console.log('📥 Frontend - Payment API Response:', paymentResponse.data);

//       if (paymentResponse.data.success) {
//         console.log('✅ Payment successful, saving order...');
        
//         await saveOrderToDatabase(paymentResponse.data);
        
//         setPaymentId(paymentResponse.data.paymentId);
        
//         setCard({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
        
//         setSuccess('');
//         setShowRegistrationModal(true);
        
//       } else {
//         setError(paymentResponse.data.message || 'Payment failed. Please try again.');
//         if (paymentResponse.data.error) console.error('Payment Error Detail:', paymentResponse.data.error);
//       }
//     } catch (err) {
//       console.error('API Error:', err);
      
//       if (err.response?.data?.message) {
//         setError(err.response.data.message);
//       } else {
//         setError('Payment failed. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRegistrationChoice = (choice) => {
//     setShowRegistrationModal(false);
    
//     if (choice === 'register') {
//       localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
//       navigate('/en/register/afterPay');
//     } else {
//       localStorage.removeItem('cart');
//       localStorage.removeItem('guestInfo');
//       navigate('/');
//     }
//   };

//   const totalPrice = calculateTotal();

//   // JSX kısmı (değişiklik yok)
//   return (
//     <Container className="py-5">
//       <Row className="justify-content-center">
//         <Col md={8}>
//           <h2 className="mb-4">Payment Information</h2>
          
//           {cart.length > 0 && (
//             <Card className="mb-4">
//               <Card.Header><h5>Cart Summary</h5></Card.Header>
//               <Card.Body>
//                 {cart.map((item, index) => (
//                   <div key={index} className="d-flex justify-content-between">
//                     <span>{item.name || item.title || 'Product'}</span>
//                     <span>{((item.price || item.fiyat || 0) * (item.quantity || item.adet || 1)).toFixed(2)} USD</span>
//                   </div>
//                 ))}
//                 <hr />
//                 <div className="d-flex justify-content-between">
//                   <strong>Total: {totalPrice.toFixed(2)} USD</strong>
//                 </div>
//               </Card.Body>
//             </Card>
//           )}

//           {error && <Alert variant="danger">{error}</Alert>}
//           {success && !showRegistrationModal && <Alert variant="success">{success}</Alert>}

//           <Card>
//             <Card.Body>
//               <Form onSubmit={handleSubmit}>
//                 <Form.Group className="mb-3"><Form.Label>Name on Card *</Form.Label><Form.Control type="text" name="cardHolderName" value={card.cardHolderName} onChange={handleChange} placeholder="John Doe" required /></Form.Group>
//                 <Form.Group className="mb-3"><Form.Label>Card Number *</Form.Label><Form.Control type="text" name="cardNumber" value={card.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" required /><Form.Text className="text-muted">Test card: 5528 7900 0000 0008</Form.Text></Form.Group>
//                 <Row>
//                   <Col md={4}><Form.Group className="mb-3"><Form.Label>Month *</Form.Label><Form.Control type="text" name="expireMonth" value={card.expireMonth} onChange={handleChange} placeholder="MM" maxLength="2" required /></Form.Group></Col>
//                   <Col md={4}><Form.Group className="mb-3"><Form.Label>Year *</Form.Label><Form.Control type="text" name="expireYear" value={card.expireYear} onChange={handleChange} placeholder="YYYY" maxLength="4" required /></Form.Group></Col>
//                   <Col md={4}><Form.Group className="mb-3"><Form.Label>CVC *</Form.Label><Form.Control type="text" name="cvc" value={card.cvc} onChange={handleChange} placeholder="123" maxLength="4" required /></Form.Group></Col>
//                 </Row>
//                 <Button type="submit" variant="primary" size="lg" className="w-100" disabled={loading}>
//                   {loading ? (<><Spinner size="sm" animation="border" className="me-2" />Processing...</>) : (`Complete Payment (${totalPrice.toFixed(2)} USD)`)}
//                 </Button>
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
//         <Modal.Header><Modal.Title>Payment Successful! 🎉</Modal.Title></Modal.Header>
//         <Modal.Body>
//           <Alert variant="success" className="mb-3">
//             <strong>Congratulations!</strong> Your payment has been processed successfully.<br /><small>Transaction ID: {paymentId}</small>
//             {orderCode && (<><br /><small>Order Code: {orderCode}</small></>)}
//           </Alert>
//           <p>Would you like to create an account to easily track your future orders?</p>
//           <ul className="text-muted small">
//             <li>View your order history</li><li>Shop faster next time</li><li>Get notified about special discounts</li>
//           </ul>
//         </Modal.Body>
//         <Modal.Footer className="justify-content-center">
//           <Button variant="primary" size="lg" onClick={() => handleRegistrationChoice('register')} className="me-3">Create Account</Button>
//           <Button variant="outline-secondary" size="lg" onClick={() => handleRegistrationChoice('continue')}>Continue as Guest</Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default PaymentPageEn;

import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [success, setSuccess] = useState('');
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState(''); // For the order code

  useEffect(() => {
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    
    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    }
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    console.log('🔍 Stored Guest Info:', storedGuestInfo ? JSON.parse(storedGuestInfo) : null);
    console.log('🔍 Stored Cart:', storedCart ? JSON.parse(storedCart) : null);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length <= 19) {
        setCard((prev) => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }

    if (name === 'expireMonth') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 2 && (numericValue === '' || (parseInt(numericValue) >= 1 && parseInt(numericValue) <= 12))) {
        setCard((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    if (name === 'expireYear') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setCard((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    if (name === 'cvc') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        setCard((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setCard((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.price || item.fiyat || 0;
      const quantity = item.quantity || item.adet || 1;
      return acc + (price * quantity);
    }, 0);
  };

  const saveOrderToDatabase = async (paymentResponse) => {
    try {
      console.log('💾 Saving order to the database...');
      
      const orderData = {
        userId: null,
        email: guestInfo.email,
        // *** BAŞLANGIÇ: DÜZELTİLMİŞ ALAN 1 ***
        // Veritabanı için doğru anahtarlar kullanılıyor
        firstName: guestInfo.firstName || '',
        lastName: guestInfo.lastName || '',
        phone: guestInfo.phone || '',
        // *** BİTİŞ: DÜZELTİLMİŞ ALAN 1 ***
        
        cart: cart.map(item => ({
          product_id: item.id || item.product_id,
          name: item.name || item.title || 'Product',
          category: item.category_title || item.category || 'General',
          price: item.price || item.fiyat || 0,
          quantity: item.quantity || item.adet || 1
        })),
        
        totalAmount: calculateTotal(),
        
        // *** BAŞLANGIÇ: DÜZELTİLMİŞ ALAN 2 ***
        shippingInfo: {
          address: guestInfo.addressDetail || '',
          city: guestInfo.city || '',
          district: guestInfo.district || '',
          postalCode: guestInfo.postalCode || '',
          notes: guestInfo.notes || ''
        },
        // *** BİTİŞ: DÜZELTİLMİŞ ALAN 2 ***
        
        payment: {
          method: 'iyzico',
          status: 'success',
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
        console.error('❌ Could not save order:', orderResponse.data);
        throw new Error(orderResponse.data.message || 'Could not save the order');
      }
    } catch (error) {
      console.error('💥 Order saving error:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!guestInfo || cart.length === 0) {
      setError('Guest information or cart is empty. Please try again.');
      setLoading(false);
      return;
    }

    // Card validations... (no changes here)

    const totalPrice = calculateTotal();
    const cardNumberDigits = card.cardNumber.replace(/\D/g, '');
    
    // *** BAŞLANGIÇ: ANA DÜZELTME ALANI ***
    // Backend'in beklediği format. guestInfo objesinden doğru anahtarlar okunuyor
    // ve backend'in beklediği Türkçe anahtarlara atanıyor.
    const paymentData = {
      ad: guestInfo.firstName || '',
      soyad: guestInfo.lastName || '',
      email: guestInfo.email || '',
      telefon: guestInfo.phone || '',
      adres_detay: guestInfo.addressDetail || '',
      sehir: guestInfo.city || '',
      posta_kodu: guestInfo.postalCode || '',
      
      sepet: cart.map(item => ({
        product_id: item.id || item.product_id,
        translations: item.translations || { en: { title: item.name || item.title || 'Product' } },
        category_title: item.category_title || item.category || 'General',
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
    // *** BİTİŞ: ANA DÜZELTME ALANI ***

    console.log('📤 Frontend - Gönderilen ödeme verisi:', paymentData); 

    try {
      const paymentResponse = await axios.post('http://localhost:5000/pay', paymentData);

      console.log('📥 Frontend - Payment API Response:', paymentResponse.data);

      if (paymentResponse.data.success) {
        console.log('✅ Payment successful, saving order...');
        
        await saveOrderToDatabase(paymentResponse.data);
        
        setPaymentId(paymentResponse.data.paymentId);
        
        setCard({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
        
        setSuccess('');
        setShowRegistrationModal(true);
        
      } else {
        setError(paymentResponse.data.message || 'Payment failed. Please try again.');
        if (paymentResponse.data.error) console.error('Payment Error Detail:', paymentResponse.data.error);
      }
    } catch (err) {
      console.error('API Error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationChoice = (choice) => {
    setShowRegistrationModal(false);
    
    if (choice === 'register') {
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/en/register/afterPay');
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
      navigate('/');
    }
  };

  const totalPrice = calculateTotal();

  // JSX kısmı (değişiklik yok)
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h2 className="mb-4">Payment Information</h2>
          
          {cart.length > 0 && (
            <Card className="mb-4">
              <Card.Header><h5>Cart Summary</h5></Card.Header>
              <Card.Body>
                {cart.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between">
                    <span>{item.name || item.title || 'Product'}</span>
                    <span>{((item.price || item.fiyat || 0) * (item.quantity || item.adet || 1)).toFixed(2)} USD</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total: {totalPrice.toFixed(2)} USD</strong>
                </div>
              </Card.Body>
            </Card>
          )}

          {error && <Alert variant="danger">{error}</Alert>}
          {success && !showRegistrationModal && <Alert variant="success">{success}</Alert>}

          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3"><Form.Label>Name on Card *</Form.Label><Form.Control type="text" name="cardHolderName" value={card.cardHolderName} onChange={handleChange} placeholder="John Doe" required /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Card Number *</Form.Label><Form.Control type="text" name="cardNumber" value={card.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" required /><Form.Text className="text-muted">Test card: 5528 7900 0000 0008</Form.Text></Form.Group>
                <Row>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label>Month *</Form.Label><Form.Control type="text" name="expireMonth" value={card.expireMonth} onChange={handleChange} placeholder="MM" maxLength="2" required /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label>Year *</Form.Label><Form.Control type="text" name="expireYear" value={card.expireYear} onChange={handleChange} placeholder="YYYY" maxLength="4" required /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label>CVC *</Form.Label><Form.Control type="text" name="cvc" value={card.cvc} onChange={handleChange} placeholder="123" maxLength="4" required /></Form.Group></Col>
                </Row>
                <Button type="submit" variant="primary" size="lg" className="w-100" disabled={loading}>
                  {loading ? (<><Spinner size="sm" animation="border" className="me-2" />Processing...</>) : (`Complete Payment (${totalPrice.toFixed(2)} USD)`)}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
        <Modal.Header><Modal.Title>Payment Successful! 🎉</Modal.Title></Modal.Header>
        <Modal.Body>
          <Alert variant="success" className="mb-3">
            <strong>Congratulations!</strong> Your payment has been processed successfully.<br /><small>Transaction ID: {paymentId}</small>
            {orderCode && (<><br /><small>Order Code: {orderCode}</small></>)}
          </Alert>
          <p>Would you like to create an account to easily track your future orders?</p>
          <ul className="text-muted small">
            <li>View your order history</li><li>Shop faster next time</li><li>Get notified about special discounts</li>
          </ul>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="primary" size="lg" onClick={() => handleRegistrationChoice('register')} className="me-3">Create Account</Button>
          <Button variant="outline-secondary" size="lg" onClick={() => handleRegistrationChoice('continue')}>Continue as Guest</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPageEn;