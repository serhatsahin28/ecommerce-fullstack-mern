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
    expiry: '', // Combined field for MM/YY format
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
    // Check session status
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Fetch saved cards (if logged in)
    const fetchSavedCards = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSavedCards(response.data.odeme_yontemleri || []);
        } catch (error) {
          console.error("Saved cards could not be fetched:", error);
        }
      }
    };

    // Get data from localStorage
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    const storedAddress = localStorage.getItem('userAddress');
    
    // Prioritize guestInfo, then use userAddress
    if (storedGuestInfo) {
      const guestData = JSON.parse(storedGuestInfo);
      setGuestInfo(guestData);
    } else if (storedAddress) {
      const addressData = JSON.parse(storedAddress);
      
      // If session is open, get user info
      if (token) {
        const fetchUserInfo = async () => {
          try {
            const response = await axios.get('http://localhost:5000/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Combine address info with user info
            setGuestInfo({
              ...addressData,
              ad: response.data.ad,
              soyad: response.data.soyad,
              telefon: response.data.telefon,
              email: response.data.email
            });
          } catch (error) {
            console.error("User info could not be fetched:", error);
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

    // Fetch saved cards
    fetchSavedCards();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number: 4-digit groups
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length <= 19) {
        setCard(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }

    if (name === 'expiry') {
      // Format as MM/YY
      let formattedValue = value.replace(/[^\d/]/g, '');
      
      // Add slash after 2 characters
      if (formattedValue.length > 2 && !formattedValue.includes('/')) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
      }
      
      // Limit to 5 characters (MM/YY)
      if (formattedValue.length > 5) {
        formattedValue = formattedValue.substring(0, 5);
      }
      
      setCard(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    if (name === 'cvc') {
      // Only allow digits, max 4 characters
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
      
      // Get user ID from token if exists
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
      } else {
        throw new Error(orderResponse.data.message || 'Order could not be saved');
      }
    } catch (error) {
      console.error('Order save error:', error);
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

    // Validate for new card
    if (selectedSavedCard === null) {
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

      // Split expiry into month and year
      const [expireMonth, expireYear] = card.expiry.split('/');
      
      if (!expireMonth || parseInt(expireMonth) < 1 || parseInt(expireMonth) > 12) {
        setError('Please enter a valid month (01-12).');
        setLoading(false);
        return;
      }

      if (!expireYear || expireYear.length !== 2) {
        setError('Please enter a valid year (YY format).');
        setLoading(false);
        return;
      }

      if (!card.cvc || card.cvc.length < 3) {
        setError('CVC code must be at least 3 digits.');
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
        translations: item.translations || { tr: { name: 'Product' } },
        category_title: item.category_title || 'General',
        price: item.price || 0,
        quantity: item.quantity || 1
      })),
      totalPrice: totalPrice,
      
      // For saved card
      // --- FIX STARTS HERE ---
      // Send the actual Iyzico token (e.g., ucs_token), not the database ID (_id).
      // This is the critical change to fix the "invalid card number" error.
      savedCardId: selectedSavedCard ? (selectedSavedCard.ucs_token || null) : null,
      // --- FIX ENDS HERE ---
      cvc: selectedSavedCard !== null ? card.cvc : null,
      
      // For new card
      card: selectedSavedCard === null ? {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: card.cardNumber.replace(/\D/g, ''),
        // Split expiry into month and year
        expireMonth: card.expiry.split('/')[0].padStart(2, '0'),
        expireYear: `20${card.expiry.split('/[1]}`,
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
          expiry: '',
          cvc: ''
        });
        setSelectedSavedCard(null);
        setShowRegistrationModal(true);
      } else {
        setError(paymentResponse.data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.detail) {
        setError(`Error: ${err.response.data.detail}`);
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
      navigate('/tr/register/afterPay');
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
      navigate('/');
    }
  };

  const handleUseSavedCard = (savedCard) => {
    setSelectedSavedCard(savedCard);
    // Reset new card form
    setCard({
      cardHolderName: '',
      cardNumber: '',
      expiry: '',
      cvc: ''
    });
  };

  const handleUseNewCard = () => {
    setSelectedSavedCard(null);
  };

  const totalPrice = calculateTotal();

  // (The rest of the JSX remains unchanged)
  // ...
  return (
    <Container className="py-5">
      {/* ... existing JSX ... */}
    </Container>
  );
};

export default PaymentPage;