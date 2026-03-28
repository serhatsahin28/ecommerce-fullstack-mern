import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// --- DEĞİŞİKLİK 1: Resim importları yerine ikonları import et ---
import { FaCcVisa, FaCcMastercard } from 'react-icons/fa';

// Bu CSS dosyasını import ettiğinizden emin olun
// import './PaymentPage.css'; // veya App.css

const PaymentPage = () => {
  const navigate = useNavigate();

  // --- State Yönetimi ---
  const [card, setCard] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [saveNewCard, setSaveNewCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');

  // --- Veri Yükleme ve Simülasyon ---
  useEffect(() => {
    // LocalStorage'dan misafir ve sepet bilgilerini al
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    
    if (storedGuestInfo) setGuestInfo(JSON.parse(storedGuestInfo));
    if (storedCart) setCart(JSON.parse(storedCart));
    else {
        setCart([
            { id: 1, name: 'Profesyonel React Kitabı', quantity: 2, price: 150.75 },
            { id: 2, name: 'Node.js Geliştirme Seti', quantity: 1, price: 450.50 },
            { id: 3, name: 'CSS Flexbox Posteri', quantity: 3, price: 45.00 },
        ]);
    }

    if (!storedGuestInfo) {
        setGuestInfo({
            ad: 'Ahmet',
            soyad: 'Yılmaz',
            adres_detay: 'Örnek Mah. Test Cad. No: 12/3',
            ilce: 'Kadıköy',
            sehir: 'İstanbul',
        });
    }

    if (isLoggedIn) {
      const fetchedCards = [
        { id: 'card_1', last4: '1234', brand: 'visa', cardHolderName: 'Ahmet Yılmaz' },
        { id: 'card_2', last4: '5678', brand: 'mastercard', cardHolderName: 'Ahmet Yılmaz' }
      ];
      setSavedCards(fetchedCards);
      if (fetchedCards.length > 0) {
        setSelectedCardId(fetchedCards[0].id);
      } else {
        setSelectedCardId('new');
      }
    } else {
      setSelectedCardId('new');
    }

  }, [isLoggedIn]);

  // --- Fonksiyonlar (Aynı kalabilir) ---
  const handleCardSelection = (cardId) => { setSelectedCardId(cardId); setError(''); };
  const handleChange = (e) => { setCard((prev) => ({ ...prev, [name]: value })); }; // Detaylı hali sizde mevcut
  const calculateTotal = () => cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const handleSubmit = async (e) => { 
    e.preventDefault();
    setLoading(true);
    // ... Ödeme mantığı olduğu gibi kalabilir ...
    console.log("Ödeme işlemi başlıyor...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simülasyon
    setLoading(false);
    setShowSuccessModal(true);
    setPaymentId(`pi_${Date.now()}`);
    setOrderCode(`ORD-${Date.now()}`);
  };
  const handleModalClose = () => { setShowSuccessModal(false); navigate('/'); };
  const totalPrice = calculateTotal();

  // --- JSX (Render) ---
  return (
    <div className="payment-page-container" style={{ backgroundColor: '#f8f9fa', padding: '40px 0' }}>
      <Container>
        <Row>
          {/* === SOL SÜTUN: ÖDEME BİLGİLERİ === */}
          <Col lg={7}>
            <Card className="payment-card" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: 'none', borderRadius: '12px' }}>
              <Card.Header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e9ecef' }}>Ödeme Yöntemi</Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {isLoggedIn && savedCards.map(saved => (
                  <div
                    key={saved.id}
                    className={`saved-card mb-2 ${selectedCardId === saved.id ? 'selected' : ''}`}
                    onClick={() => handleCardSelection(saved.id)}
                    style={{ border: `1px solid ${selectedCardId === saved.id ? '#0d6efd' : '#dee2e6'}`, borderRadius: '8px', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s ease-in-out', display: 'flex', alignItems: 'center' }}
                  >
                    <Form.Check
                      type="radio"
                      id={`card-${saved.id}`}
                      name="paymentMethod"
                      checked={selectedCardId === saved.id}
                      readOnly
                      className="me-3"
                    />
                    
                    {/* --- DEĞİŞİKLİK 2: <img> yerine ikon komponentlerini kullan --- */}
                    <div className="card-logo" style={{ fontSize: '2.5rem', marginRight: '1rem', color: '#0d6efd' }}>
                      {saved.brand === 'visa' && <FaCcVisa />}
                      {saved.brand === 'mastercard' && <FaCcMastercard />}
                    </div>
                    
                    <div>
                      <div className="fw-bold">{saved.brand.toUpperCase()} **** {saved.last4}</div>
                      <small className="text-muted">{saved.cardHolderName}</small>
                    </div>
                  </div>
                ))}
                
                {/* Diğer kısımlar aynı kalabilir... */}
                {/* ... Yeni Kart Ekle ve Formu ... */}

              </Card.Body>
            </Card>
          </Col>

          {/* === SAĞ SÜTUN: SİPARİŞ ÖZETİ (Aynı kalabilir) === */}
          <Col lg={5}>
            {/* ... Sipariş Özeti Card'ı ... */}
            {/* ... Teslimat Adresi Card'ı ... */}
            {/* ... Ödemeyi Tamamla Butonu ... */}
          </Col>
        </Row>
      </Container>
      
      {/* ... Modal (Aynı kalabilir) ... */}
    </div>
  );
};

export default PaymentPage;