import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaUser, FaMapMarkerAlt, FaShoppingCart, FaRegCheckCircle } from 'react-icons/fa';

const PaymentPage = () => {
  const navigate = useNavigate();
  // Mevcut state'leriniz olduğu gibi kalıyor
  const [card, setCard] = useState({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');

  // === DEĞİŞİKLİK 1: KULLANICININ OTURUM DURUMUNU TUTMAK İÇİN YENİ BİR STATE ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // === DEĞİŞİKLİK 2: SAYFA YÜKLENİRKEN OTURUM KONTROLÜ YAP ===
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    // === DEĞİŞİKLİKLER BİTTİ, GERİ KALAN HER ŞEY AYNI ===
    
    // localStorage'dan misafir ve sepet bilgisi oku
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    const storedAddress = localStorage.getItem('userAddress');
    
    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    } else if (storedAddress) {
      setGuestInfo(JSON.parse(storedAddress));
    }
    
    if (storedCart) {
      const cartData = JSON.parse(storedCart);
      if (Array.isArray(cartData)) { // Gelen verinin bir dizi olduğundan emin olalım
        setCart(cartData);
      }
    }

    console.log('Oturum açık mı?', token ? 'Evet' : 'Hayır');
  }, []);

  // Orijinal fonksiyonlarınızın tamamı değiştirilmeden olduğu gibi bırakıldı.
  const handleChange = (e) => { /* ... orijinal kodunuz ... */ };
  const calculateTotal = () => { /* ... orijinal kodunuz ... */ };
  const saveOrderToDatabase = async (paymentResponse) => { /* ... orijinal kodunuz ... */ };
  const handleSubmit = async (e) => { /* ... orijinal kodunuz ... */ };

  const handleRegistrationChoice = (choice) => {
    setShowRegistrationModal(false);
    
    // "Hesap Oluştur" seçeneği sadece misafir kullanıcılar için çalışır.
    if (choice === 'register' && !isLoggedIn) { 
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/tr/register/afterPay');
    } else {
      // "Devam et" diyen misafir kullanıcı veya "Anasayfaya dön" diyen giriş yapmış kullanıcı
      // her zaman bu bloğu çalıştırır.
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
      localStorage.removeItem('userAddress'); // userAddress'i de temizleyelim
      navigate('/');
    }
  };

  const totalPrice = calculateTotal();

  return (
    // Sayfanın JSX yapısının geri kalanı olduğu gibi kalıyor...
    <Container className="py-5">
      {/* ... Row, Col, Card gibi tüm bileşenleriniz burada ... */}


      {/* === DEĞİŞİKLİK 3: MODAL İÇERİĞİ VE BUTONLAR DİNAMİK HALE GETİRİLDİ === */}
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
          <Alert variant="success" className="text-center mb-4">
            <strong>Tebrikler!</strong> Ödemeniz başarıyla tamamlandı.
            <div className="mt-2">
              <small className="d-block">İşlem ID: {paymentId}</small>
              {orderCode && (<small className="d-block">Sipariş Kodu: {orderCode}</small>)}
            </div>
          </Alert>
          
          {/* KOŞULLU BÖLÜM: Kullanıcı giriş yapmışsa farklı, yapmamışsa farklı metin göster */}
          {isLoggedIn ? (
            <div className="text-center">
              <h5>Siparişinizi "Hesabım" sayfanızdan takip edebilirsiniz.</h5>
              <p className="text-muted">Bizi tercih ettiğiniz için teşekkür ederiz!</p>
            </div>
          ) : (
            <>
              <h5 className="text-center mb-3">Gelecekteki siparişlerinizi daha kolay takip edebilmek için hesap oluşturun</h5>
              <div className="row mb-4">
                {/* ... "Hesap oluşturmanın faydaları" kartları olduğu gibi kalıyor ... */}
              </div>
            </>
          )}

        </Modal.Body>
        <Modal.Footer className="justify-content-center">
           {/* KOŞULLU BÖLÜM: Kullanıcı giriş yapmışsa tek buton, yapmamışsa iki buton göster */}
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