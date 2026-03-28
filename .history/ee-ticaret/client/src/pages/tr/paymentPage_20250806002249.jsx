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
  const [orderCode, setOrderCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Yeni state

  useEffect(() => {
    // Oturum durumunu kontrol et
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // localStorage'dan verileri al
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
              ad: response.data.ad,
              soyad: response.data.soyad,
              telefon: response.data.telefon,
              email: response.data.email
            });
          } catch (error) {
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
  }, []);

  // ... diğer fonksiyonlar aynı ...

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

  // ... diğer kodlar aynı ...

  return (
    <Container className="py-5">
      {/* ... önceki kodlar aynı ... */}

      {/* Başarılı Ödeme Modalı */}
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
              {orderCode && (
                <small className="d-block">Sipariş Kodu: {orderCode}</small>
              )}
            </div>
          </Alert>
          
          {/* Sadece oturum açık değilse hesap oluşturma teklifini göster */}
          {!isLoggedIn && (
            <>
              <h5 className="text-center mb-3">Gelecekteki siparişlerinizi daha kolay takip edebilmek için hesap oluşturun</h5>
              
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center">
                      <h5 className="text-success">✓ Sipariş geçmişinizi görüntüleyin</h5>
                      <p className="text-muted small">Tüm siparişlerinizi tek bir yerden takip edebilirsiniz</p>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-6 mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center">
                      <h5 className="text-success">✓ Daha hızlı alışveriş yapın</h5>
                      <p className="text-muted small">Adres ve ödeme bilgileriniz kaydedilir</p>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-6 mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center">
                      <h5 className="text-success">✓ Özel indirimlerden haberdar olun</h5>
                      <p className="text-muted small">Üyelere özel kampanyalardan yararlanın</p>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-6 mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center">
                      <h5 className="text-success">✓ Sipariş durumunu takip edin</h5>
                      <p className="text-muted small">Siparişinizin durumunu anlık olarak görün</p>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          {/* Sadece oturum açık değilse Hesap Oluştur butonunu göster */}
          {!isLoggedIn && (
            <Button 
              variant="outline-primary" 
              size="lg"
              onClick={() => handleRegistrationChoice('register')}
              className="px-5"
            >
              Hesap Oluştur
            </Button>
          )}
          <Button 
            variant="success" 
            size="lg"
            onClick={() => handleRegistrationChoice('continue')}
            className="px-5"
          >
            Devam Et
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;