import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Örnek kart logosu, projenizde uygun bir yere ekleyin

// Bu CSS dosyasını import ettiğinizden emin olun
import './PaymentPage.css'; 

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
  
  // Yeni eklenen state'ler
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Kullanıcının giriş yapıp yapmadığını simüle eder
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null); // 'new' veya kartın id'si
  const [saveNewCard, setSaveNewCard] = useState(false); // Yeni kartı kaydetme tercihi

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);
  
  // Ödeme sonrası modal için
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
        // Test için örnek sepet verisi
        setCart([
            { id: 1, name: 'Profesyonel React Kitabı', quantity: 2, price: 150.75 },
            { id: 2, name: 'Node.js Geliştirme Seti', quantity: 1, price: 450.50 },
            { id: 3, name: 'CSS Flexbox Posteri', quantity: 3, price: 45.00 },
        ]);
    }

    if (!storedGuestInfo) {
        // Test için örnek adres bilgisi
        setGuestInfo({
            ad: 'Ahmet',
            soyad: 'Yılmaz',
            adres_detay: 'Örnek Mah. Test Cad. No: 12/3',
            ilce: 'Kadıköy',
            sehir: 'İstanbul',
        });
    }

    // Kullanıcı giriş yapmışsa kayıtlı kartlarını getir (API çağrısı simülasyonu)
    if (isLoggedIn) {
      // Normalde burası `axios.get('/api/user/cards')` gibi bir çağrı olurdu
      const fetchedCards = [
        { id: 'card_1', last4: '1234', brand: 'visa', cardHolderName: 'Ahmet Yılmaz' },
        { id: 'card_2', last4: '5678', brand: 'mastercard', cardHolderName: 'Ahmet Yılmaz' }
      ];
      setSavedCards(fetchedCards);
      // İlk kartı varsayılan olarak seç
      if (fetchedCards.length > 0) {
        setSelectedCardId(fetchedCards[0].id);
      } else {
        setSelectedCardId('new'); // Kayıtlı kart yoksa yeni kart formunu göster
      }
    } else {
      setSelectedCardId('new'); // Misafir kullanıcı her zaman yeni kart girer
    }

  }, [isLoggedIn]);

  // --- Fonksiyonlar ---
  const handleCardSelection = (cardId) => {
    setSelectedCardId(cardId);
    setError(''); // Seçim değiştiğinde hatayı temizle
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Mevcut input formatlama ve validasyon mantığı...
    // (Kodun kısalığı için orijinal kodunuzdaki bu bölümü buraya kopyalamadım, aynı kalabilir)
    setCard((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Yeni kart formu validasyonu (sadece yeni kart seçiliyse)
    if (selectedCardId === 'new') {
      const cardNumberDigits = card.cardNumber.replace(/\D/g, '');
      if (cardNumberDigits.length !== 16 || !card.cardHolderName || !card.expireMonth || !card.expireYear || !card.cvc) {
        setError('Lütfen tüm kart bilgilerini eksiksiz doldurun.');
        setLoading(false);
        return;
      }
    }
    
    // Backend'e gönderilecek ödeme verisi
    const paymentData = {
      totalPrice: calculateTotal(),
      cart: cart, // ...
      userInfo: guestInfo, // ...
      paymentMethod: {
        type: selectedCardId === 'new' ? 'NEW_CARD' : 'SAVED_CARD',
        cardDetails: selectedCardId === 'new' ? { ...card, saveCard: saveNewCard } : null,
        cardId: selectedCardId !== 'new' ? selectedCardId : null
      }
    };
    
    console.log("🚀 Ödeme için backend'e gönderilecek veri:", paymentData);
    
    try {
      // 1. Ödemeyi yap (API simülasyonu)
      // const response = await axios.post('http://localhost:5000/pay', paymentData);
      // Simülasyon için 2 saniye bekletelim
      await new Promise(resolve => setTimeout(resolve, 2000));
      const fakeResponse = { data: { success: true, paymentId: `pi_${Date.now()}` } };
      
      if (fakeResponse.data.success) {
        // 2. Ödeme başarılıysa siparişi kaydet (API simülasyonu)
        // const orderResult = await axios.post('http://localhost:5000/orders', ...);
        const fakeOrderResult = { data: { success: true, orderCode: `ORD-${Date.now()}` } };

        setPaymentId(fakeResponse.data.paymentId);
        setOrderCode(fakeOrderResult.data.orderCode);
        setShowSuccessModal(true);

        // Formu temizle
        setCard({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
      } else {
        setError("Ödeme işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Gerçek bir uygulamada kullanıcıyı "Siparişlerim" sayfasına yönlendirebilirsiniz.
    localStorage.removeItem('cart');
    localStorage.removeItem('guestInfo');
    navigate('/');
  };

  const totalPrice = calculateTotal();

  // --- JSX (Render) ---
  return (
    <div className="payment-page-container">
      <Container>
        <Row>
          {/* === SOL SÜTUN: ÖDEME BİLGİLERİ === */}
          <Col lg={7}>
            <Card className="payment-card">
              <Card.Header>Ödeme Yöntemi</Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Kayıtlı Kartlar (Giriş yapmış kullanıcı için) */}
                {isLoggedIn && savedCards.map(saved => (
                  <div
                    key={saved.id}
                    className={`saved-card mb-2 ${selectedCardId === saved.id ? 'selected' : ''}`}
                    onClick={() => handleCardSelection(saved.id)}
                  >
                    <Form.Check
                      type="radio"
                      id={`card-${saved.id}`}
                      name="paymentMethod"
                      checked={selectedCardId === saved.id}
                      onChange={() => handleCardSelection(saved.id)}
                      className="me-3"
                    />
                    <img 
                        src={saved.brand === 'visa' ? visaLogo : mastercardLogo} 
                        alt={saved.brand}
                        className="card-logo"
                    />
                    <div>
                      <div className="fw-bold">{saved.brand.toUpperCase()} **** {saved.last4}</div>
                      <small className="text-muted">{saved.cardHolderName}</small>
                    </div>
                  </div>
                ))}
                
                {/* Yeni Kart Ekle Seçeneği */}
                <div
                    className={`saved-card mb-2 ${selectedCardId === 'new' ? 'selected' : ''}`}
                    onClick={() => handleCardSelection('new')}
                >
                    <Form.Check
                      type="radio"
                      id="card-new"
                      name="paymentMethod"
                      label={<span className="fw-bold">Yeni Kart ile Öde</span>}
                      checked={selectedCardId === 'new'}
                      onChange={() => handleCardSelection('new')}
                    />
                </div>

                {/* Yeni Kart Formu */}
                {selectedCardId === 'new' && (
                  <div className="payment-form-container">
                    <Form id="payment-form" onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Kart Üzerindeki İsim</Form.Label>
                        <Form.Control type="text" name="cardHolderName" value={card.cardHolderName} onChange={handleChange} required />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Kart Numarası</Form.Label>
                        <Form.Control type="text" name="cardNumber" value={card.cardNumber} onChange={handleChange} placeholder="XXXX XXXX XXXX XXXX" required />
                      </Form.Group>
                      <Row>
                        <Col><Form.Label>Son Kul. Ay</Form.Label><Form.Control type="text" name="expireMonth" value={card.expireMonth} onChange={handleChange} placeholder="MM" required /></Col>
                        <Col><Form.Label>Son Kul. Yıl</Form.Label><Form.Control type="text" name="expireYear" value={card.expireYear} onChange={handleChange} placeholder="YYYY" required /></Col>
                        <Col><Form.Label>CVC</Form.Label><Form.Control type="text" name="cvc" value={card.cvc} onChange={handleChange} placeholder="123" required /></Col>
                      </Row>
                      {isLoggedIn && (
                        <Form.Check
                          type="checkbox"
                          id="save-card-checkbox"
                          label="Kartımı sonraki alışverişler için güvenle kaydet"
                          checked={saveNewCard}
                          onChange={(e) => setSaveNewCard(e.target.checked)}
                          className="mt-3"
                        />
                      )}
                    </Form>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* === SAĞ SÜTUN: SİPARİŞ ÖZETİ === */}
          <Col lg={5}>
            <Card className="summary-card">
              <Card.Header>Sipariş Özeti</Card.Header>
              <Card.Body>
                {cart.map((item, index) => (
                  <div key={index} className="summary-item">
                    <span className="summary-item-name">{item.name} <span className="text-muted">x {item.quantity}</span></span>
                    <span className="summary-item-price">{(item.price * item.quantity).toFixed(2)} TL</span>
                  </div>
                ))}
                <hr/>
                <div className="summary-item">
                  <span>Ara Toplam</span>
                  <span>{totalPrice.toFixed(2)} TL</span>
                </div>
                <div className="summary-item">
                  <span>Kargo</span>
                  <span className='text-success'>Ücretsiz</span>
                </div>
                <div className="d-flex justify-content-between total-row">
                  <span>Toplam</span>
                  <span>{totalPrice.toFixed(2)} TL</span>
                </div>
              </Card.Body>
            </Card>

            {guestInfo && (
              <Card className="summary-card">
                <Card.Header>Teslimat Adresi</Card.Header>
                <Card.Body>
                  <strong>{guestInfo.ad} {guestInfo.soyad}</strong>
                  <p className="mb-0">{guestInfo.adres_detay}</p>
                  <p className="mb-0">{guestInfo.ilce} / {guestInfo.sehir}</p>
                </Card.Body>
              </Card>
            )}

            <div className="d-grid">
              <Button 
                type="submit" 
                form="payment-form" // Form dışındaki butonu forma bağlar
                variant="primary" 
                size="lg"
                disabled={loading}
              >
                {loading ? <Spinner as="span" animation="border" size="sm" /> : `Ödemeyi Tamamla`}
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
      
      {/* Misafir kullanıcı için ödeme sonrası kayıt olma modal'ı */}
      {/* Not: Bu modal, orijinal kodunuzdaki gibi misafir akışı için bırakılmıştır. */}
      <Modal show={showSuccessModal} onHide={handleModalClose} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Ödeme Başarılı! 🎉</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success">
            <strong>Tebrikler!</strong> Siparişiniz alındı.
            {orderCode && <div>Sipariş Kodu: <strong>{orderCode}</strong></div>}
            <small className="text-muted">İşlem ID: {paymentId}</small>
          </Alert>
          {!isLoggedIn ? (
            <>
              <p>Siparişlerinizi kolayca takip etmek ve gelecekte daha hızlı alışveriş yapmak için bir hesap oluşturun.</p>
              <div className="d-grid gap-2 mt-4">
                 <Button variant="primary" size="lg" onClick={() => navigate('/register')}>Hesap Oluştur</Button>
                 <Button variant="outline-secondary" onClick={handleModalClose}>Teşekkürler, Gerek Yok</Button>
              </div>
            </>
          ) : (
            <p>Sipariş detaylarını "Hesabım" sayfanızda bulabilirsiniz.</p>
          )}
        </Modal.Body>
        {isLoggedIn && (
            <Modal.Footer>
                <Button variant="primary" onClick={handleModalClose}>Siparişi Görüntüle</Button>
            </Modal.Footer>
        )}
      </Modal>
    </div>
  );
};

export default PaymentPage;