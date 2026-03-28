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
        // Mask kart numaralarını
        const maskedCards = response.data.odeme_yontemleri.map(card => ({
          ...card,
          kart_numarasi: `**** **** **** ${card.kart_numarasi.slice(-4)}`
        }));
        setSavedCards(maskedCards || []);
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
    // ... (Aynen kalacak) ...
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

    // Yeni kart için validasyon
    if (selectedSavedCard === null) {
      // ... (Aynen kalacak) ...
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

      // Kayıtlı kart için sadece ID ve CVC gönder
      savedCardId: selectedSavedCard !== null ? selectedSavedCard._id : null,
      cvc: selectedSavedCard !== null ? card.cvc : null,

      // Yeni kart için tüm detaylar
      ...(selectedSavedCard === null && {
        card: {
          cardHolderName: card.cardHolderName.trim(),
          cardNumber: card.cardNumber.replace(/\D/g, ''),
          expireMonth: card.expiry.split('/')[0].padStart(2, '0'),
          expireYear: `20${card.expiry.split('/')[1]}`,
          cvc: card.cvc
        }
      })
    };

    try {
      const endpoint = selectedSavedCard 
        ? 'http://localhost:5000/pay-with-saved-card' 
        : 'http://localhost:5000/pay';
      
      const paymentResponse = await axios.post(endpoint, paymentData);

      if (paymentResponse.data.success) {
        const orderResult = await saveOrderToDatabase(paymentResponse.data);
        setPaymentId(paymentResponse.data.paymentId);
        setCard({ cardHolderName: '', cardNumber: '', expiry: '', cvc: '' });
        setSelectedSavedCard(null);
        setShowRegistrationModal(true);
      } else {
        setError(paymentResponse.data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      // ... (Hata yönetimi aynen kalacak) ...
    } finally {
      setLoading(false);
    }
  };

  // ... (Diğer fonksiyonlar aynen kalacak) ...

  return (
    <Container className="py-5">
      {/* ... (JSX kodu aynen kalacak) ... */}
    </Container>
  );
};

export default PaymentPage; 