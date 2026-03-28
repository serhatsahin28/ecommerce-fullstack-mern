import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaUser, FaMapMarkerAlt, FaShoppingCart, FaRegCheckCircle } from 'react-icons/fa';

const PaymentPage = () => {
  const navigate = useNavigate();
  // State'leriniz olduğu gibi kalıyor
  const [card, setCard] = useState({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');

  // === YENİ STATE: KULLANICININ OTURUM DURUMUNU TUTAR ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // --- Oturum kontrolü eklendi ---
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    // --- ---

    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    const storedAddress = localStorage.getItem('userAddress');
    
    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    } else if (storedAddress) {
      const addressData = JSON.parse(storedAddress);
      setGuestInfo(addressData); // Başlangıçta sadece adres bilgisini al
    }
    
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    
  }, []);

  // Diğer tüm fonksiyonlarınız (handleChange, calculateTotal, handleSubmit, vs.)
  // olduğu gibi, değiştirilmeden kalıyor.
  const calculateTotal = () => { /* ... orijinal kodunuz ... */ };
  const handleChange = (e) => { /* ... orijinal kodunuz ... */ };
  const saveOrderToDatabase = async (paymentResponse) => { /* ... orijinal kodunuz ... */ };
  const handleSubmit = async (e) => { /* ... orijinal kodunuz ... */ };

  const handleRegistrationChoice = (choice) => {
    setShowRegistrationModal(false);
    
    if (choice === 'register' && !isLoggedIn) { // Sadece misafir kullanıcı kayıt olabilir
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/tr/register/afterPay');
    } else {
      // "Devam Et" diyen herkes (misafir veya kayıtlı) veya
      // kayıtlı olup butona basan herkes buraya gelir.
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
      localStorage.removeItem('userAddress'); // userAddress'i de temizleyelim
      navigate('/');
    }
  };

  const totalPrice = calculateTotal();

  return (
    <Container className="py-5">
      {/* Sayfanın geri kalanı (Form, Kartlar vb.) olduğu gibi kalıyor */}
      {/* ... */}

      {/* === BAŞARILI ÖDEME MODALI (DİNAMİK HALE GETİRİLDİ) === */}
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
            Ödeme Başarılı! 🎉
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Alert variant="success" className="mb-4 text-center">
            <strong>Tebrikler!</strong> Ödemeniz başarıyla tamamlandı.
            <div className="mt-2">
              <small className="d-block">İşlem ID: {paymentId}</small>
              {orderCode && <small className="d-block">Sipariş Kodu: {orderCode}</small>}
            </div>
          </Alert>
          
          {/* === KOŞULLU RENDER: OTURUM AÇIKSA FARKLI, KAPALIYSA FARKLI METİN === */}
          {isLoggedIn ? (
            <div className="text-center">
                <h5>Siparişinizi "Hesabım" sayfasından takip edebilirsiniz.</h5>
                <p className="text-muted">Bizi tercih ettiğiniz için teşekkür ederiz!</p>
            </div>
          ) : (
            <>
              <h5 className="text-center mb-3">Gelecekteki siparişlerinizi daha kolay takip edebilmek için hesap oluşturun</h5>
              <div className="row mb-4">
                {/* Kayıt olmanın faydalarını gösteren kartlar... */}
                {/* ... */}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          {/* === KOŞULLU RENDER: OTURUM AÇIKSA TEK BUTON, KAPALIYSA İKİ BUTON === */}
          {isLoggedIn ? (
            <Button 
                variant="success" 
                size="lg"
                onClick={() => handleRegistrationChoice('continue')}
                className="px-5"
            >
                Anasayfaya Dön
            </Button>
          ) : (
            <>
              <Button 
                variant="outline-primary" 
                size="lg"
                onClick={() => handleRegistrationChoice('register')}
                className="px-5"
              >
                Hesap Oluştur
              </Button>
              <Button 
                variant="success" 
                size="lg"
                onClick={() => handleRegistrationChoice('continue')}
                className="px-5"
              >
                Devam Et
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;