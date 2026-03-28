import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaUser, FaMapMarkerAlt, FaShoppingCart, FaRegCheckCircle } from 'react-icons/fa';

const PaymentPage = () => {
  const navigate = useNavigate();
  
  // Orijinal State'leriniz olduğu gibi duruyor
  const [card, setCard] = useState({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');
  
  // === DEĞİŞİKLİK 1: Oturum durumunu tutmak için yeni state eklendi. ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    // === DEĞİŞİKLİK 2: Sayfa yüklendiğinde oturum kontrolü yapılır. ===
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true); // Token varsa kullanıcı giriş yapmıştır.
    }
    // === DEĞİŞİKLİK SONU ===

    // Orijinal useEffect mantığınızın geri kalanı olduğu gibi devam ediyor.
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    const storedAddress = localStorage.getItem('userAddress');
    
    if (storedGuestInfo) {
      const guestData = JSON.parse(storedGuestInfo);
      setGuestInfo(guestData);
    } else if (storedAddress) {
      const addressData = JSON.parse(storedAddress);
      setGuestInfo(addressData); // Başlangıçta bu atanır.
      if (token) {
        // Oturum açıksa, eksik bilgileri (ad, soyad vb.) API'den çekip birleştirebiliriz.
        // Bu mantık orijinal kodunuzda zaten vardı ve korunuyor.
        const fetchUserInfo = async () => {
          try {
            const response = await axios.get('http://localhost:5000/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            setGuestInfo(prev => ({ ...prev, ...response.data }));
          } catch (error) {
            console.error("Kullanıcı bilgileri alınamadı, sadece adres bilgileri kullanılıyor:", error);
          }
        };
        fetchUserInfo();
      }
    }
    
    if (storedCart) {
      const cartData = JSON.parse(storedCart);
      if(Array.isArray(cartData)) {
        setCart(cartData);
      }
    }
  }, []);

  // Tüm orijinal fonksiyonlarınız hiç değiştirilmeden burada yer alıyor.
  const handleChange = (e) => { /* ... Orijinal kodunuz ... */ };
  const calculateTotal = () => { /* ... Orijinal kodunuz ... */ };
  const saveOrderToDatabase = async (paymentResponse) => { /* ... Orijinal kodunuz ... */ };
  const handleSubmit = async (e) => { /* ... Orijinal kodunuz ... */ };

  const handleRegistrationChoice = (choice) => {
    setShowRegistrationModal(false);
    
    // Sadece misafir kullanıcılar ('!isLoggedIn') hesap oluşturabilir.
    if (choice === 'register' && !isLoggedIn) {
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/tr/register/afterPay');
    } else {
      // Misafir kullanıcı 'Devam et' dediğinde veya
      // giriş yapmış kullanıcı tek butona tıkladığında burası çalışır.
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
      localStorage.removeItem('userAddress'); // Temizlik
      navigate('/');
    }
  };

  const totalPrice = calculateTotal();

  // Orijinal JSX yapınız hiç değiştirilmeden burada yer alıyor.
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h2 className="mb-4 text-center text-primary">
            <FaCreditCard className="me-2" />
            Ödeme Bilgileri
          </h2>
          
          <Row className="mb-4">
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-success">
                {/* ... Teslimat Kartı (olduğu gibi) ... */}
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-warning">
                 {/* ... Sipariş Özeti Kartı (olduğu gibi) ... */}
              </Card>
            </Col>
          </Row>
          
          <Card className="mb-4 shadow border-primary">
            {/* ... Ödeme Formu (olduğu gibi) ... */}
          </Card>
          
          <div className="bg-light p-4 rounded text-center border">
            {/* ... Güvenli Ödeme Bölümü (olduğu gibi) ... */}
          </div>
        </Col>
      </Row>

      {/* === DEĞİŞİKLİK 3: Sadece bu Modal'ın içeriği dinamik hale getirildi. === */}
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
          <div className="text-center mb-4">
            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4">
              <FaRegCheckCircle className="text-success" size={48} />
            </div>
          </div>
          
          <Alert variant="success" className="mb-4">
            <strong>Tebrikler!</strong> Ödemeniz başarıyla tamamlandı.
            <div className="mt-2">
              <small className="d-block">İşlem ID: {paymentId}</small>
              {orderCode && (<small className="d-block">Sipariş Kodu: {orderCode}</small>)}
            </div>
          </Alert>

          {/* Dinamik İçerik: Oturum açıksa farklı, değilse farklı metin gösterilir. */}
          {isLoggedIn ? (
            <div className="text-center">
              <h5 className="mb-3">Siparişinizi "Hesabım" sayfanızdan takip edebilirsiniz.</h5>
              <p className="text-muted">Bizi tercih ettiğiniz için teşekkür ederiz!</p>
            </div>
          ) : (
            <>
              <h5 className="text-center mb-3">Gelecekteki siparişlerinizi daha kolay takip edebilmek için hesap oluşturun</h5>
              <div className="row mb-4">
                {/* Orijinal "Hesap oluşturma faydaları" kartlarınız olduğu gibi burada */}
                <div className="col-md-6 mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center">
                      <h5 className="text-success">✓ Sipariş geçmişinizi görüntüleyin</h5>
                      <p className="text-muted small">Tüm siparişlerinizi tek bir yerden takip edebilirsiniz</p>
                    </Card.Body>
                  </Card>
                </div>
                {/* Diğer 3 kart... */}
              </div>
            </>
          )}

        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          {/* Dinamik Butonlar: Oturum açıksa tek buton, değilse iki buton gösterilir. */}
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