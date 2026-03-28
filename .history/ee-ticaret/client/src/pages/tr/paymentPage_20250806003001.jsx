import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaUser, FaMapMarkerAlt, FaShoppingCart, FaRegCheckCircle } from 'react-icons/fa';

const PaymentPage = () => {
  const navigate = useNavigate();
  
  // Orijinal State'ler
  const [card, setCard] = useState({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]); // Başlangıçta boş dizi olduğundan emin ol
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    // Oturum kontrolü
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    
    // Güvenli veri okuma
    try {
      const storedGuestInfo = localStorage.getItem('guestInfo');
      const storedAddress = localStorage.getItem('userAddress');
      let infoData = null;

      if (storedGuestInfo) {
        infoData = JSON.parse(storedGuestInfo);
      } else if (storedAddress) {
        infoData = JSON.parse(storedAddress);
      }
      setGuestInfo(infoData);

    } catch (e) {
      console.error("Adres/Misafir bilgisi okunurken hata:", e);
      setGuestInfo(null); // Hata durumunda null yap
    }

    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const cartData = JSON.parse(storedCart);
        if (Array.isArray(cartData)) {
          setCart(cartData);
        }
      }
    } catch (e) {
      console.error("Sepet bilgisi okunurken hata:", e);
      setCart([]); // Hata durumunda boş dizi yap
    }
  }, []);

  // Orijinal Fonksiyonlar
  const handleChange = (e) => {
    // ... Orijinal kodunuz (değiştirilmedi) ...
    const { name, value } = e.target;
    setCard(prev => ({ ...prev, [name]: value }));
  };
  
  // SAVUNMALI HALE GETİRİLMİŞ calculateTotal FONKSİYONU
  const calculateTotal = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return 0; // Eğer sepet bir dizi değilse veya boşsa, 0 döndür
    }
    return cart.reduce((acc, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return acc + (price * quantity);
    }, 0);
  };
  
  const saveOrderToDatabase = async (paymentResponse) => {
    // ... Orijinal kodunuz (değiştirilmedi) ...
  };
  
  const handleSubmit = async (e) => {
    // ... Orijinal kodunuz (değiştirilmedi) ...
  };
  
  const handleRegistrationChoice = (choice) => {
    // ... Önceki yanıttaki dinamik versiyon (değiştirilmedi) ...
  };

  const totalPrice = calculateTotal(); // Bu satır artık hata vermeyecek.

  // JSX Arayüz
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
                <Card.Header className="bg-success text-white d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />
                  Teslimat ve İletişim Bilgileri
                </Card.Header>
                <Card.Body>
                  {/* SAVUNMALI VERİ GÖSTERİMİ */}
                  {guestInfo ? (
                    <ListGroup variant="flush">
                      <ListGroup.Item><strong>Ad Soyad:</strong> {guestInfo.ad || guestInfo.name} {guestInfo.soyad || guestInfo.surname}</ListGroup.Item>
                      <ListGroup.Item><strong>E-posta:</strong> {guestInfo.email}</ListGroup.Item>
                      <ListGroup.Item><strong>Telefon:</strong> {guestInfo.telefon || guestInfo.phone}</ListGroup.Item>
                      <ListGroup.Item><strong>Adres:</strong> {guestInfo.adres_detay || guestInfo.address}</ListGroup.Item>
                      <ListGroup.Item><strong>Şehir/İlçe:</strong> {guestInfo.sehir || guestInfo.city} / {guestInfo.ilce || guestInfo.district}</ListGroup.Item>
                      <ListGroup.Item><strong>Posta Kodu:</strong> {guestInfo.posta_kodu || guestInfo.zipCode}</ListGroup.Item>
                    </ListGroup>
                  ) : (
                    <p className="text-muted m-0">Teslimat bilgileri bulunamadı.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-warning">
                <Card.Header className="bg-warning text-dark d-flex align-items-center">
                  <FaShoppingCart className="me-2" />
                  Sipariş Özeti
                </Card.Header>
                <Card.Body className="p-0">
                  {/* SAVUNMALI VERİ GÖSTERİMİ */}
                  {Array.isArray(cart) && cart.length > 0 ? (
                    <div className="p-3">
                      <h6 className="fw-bold mb-3">Sepetinizdeki Ürünler</h6>
                      <ListGroup variant="flush">
                        {cart.map((item, index) => (
                          <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center border-0 px-0">
                             {/* ... Orijinal ListGroup.Item içeriğiniz ... */}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                      <hr/>
                      <div className="d-flex justify-content-between fw-bold fs-5">
                          <span>Toplam:</span>
                          <span>{totalPrice.toFixed(2)} TL</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted p-3 text-center m-0">Sepetiniz boş.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card className="mb-4 shadow border-primary">
            {/* ... Ödeme Formu ... */}
          </Card>
          
          <div className="bg-light p-4 rounded text-center border">
            {/* ... Güvenli Ödeme Logoları ... */}
          </div>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showRegistrationModal} /* ... */ >
         {/* ... Önceki yanıttaki dinamik modal ... */}
      </Modal>
    </Container>
  );
};

export default PaymentPage;