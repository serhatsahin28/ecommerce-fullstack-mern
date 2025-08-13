import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../../components/common/CartContext';
import { Container, Row, Col, Card, Button, Form, Image, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const PaymentPageTR = () => {
    // Context ve Hook'lar
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    // State Yönetimi
    const [loading, setLoading] = useState(true);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [error, setError] = useState('');

    // Sayfa için veriler
    const [userAddress, setUserAddress] = useState(null);
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);

    // Yeni kart formu için state'ler
    const [showNewCardForm, setShowNewCardForm] = useState(false);
    const [newCard, setNewCard] = useState({ cardHolderName: '', cardNumber: '', expiryDate: '', cvv: '' });
    const [saveCard, setSaveCard] = useState(false);

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Sayfa yüklendiğinde verileri hazırla
    useEffect(() => {
        const token = localStorage.getItem('token');
        const addressFromStorage = JSON.parse(localStorage.getItem('userAddress'));

        if (!token) {
            navigate('/tr/login');
            return;
        }
        if (!addressFromStorage) {
            alert('Lütfen önce bir teslimat adresi seçin.');
            navigate('/tr/userInfo');
            return;
        }
        if (cartItems.length === 0) {
            navigate('/tr/cart');
            return;
        }

        setUserAddress(addressFromStorage);

        const fetchSavedCards = async () => {
            try {
                // Backend'den kayıtlı kartları çekmek için bir endpoint'iniz olmalı
                const res = await fetch('http://localhost:5000/profile/cards', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSavedCards(data.cards || []);
                    // İlk kartı varsayılan olarak seçili yap
                    if (data.cards && data.cards.length > 0) {
                        setSelectedCardId(data.cards[0]._id);
                    } else {
                        setShowNewCardForm(true); // Kayıtlı kart yoksa yeni kart formunu aç
                    }
                }
            } catch (err) {
                console.error("Kayıtlı kartlar çekilemedi:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedCards();
    }, [navigate, cartItems]);

    // Yeni kart formu alanlarını güncelleyen fonksiyon
    const handleNewCardChange = (e) => {
        const { name, value } = e.target;
        setNewCard(prev => ({ ...prev, [name]: value }));
    };

    // Ödeme işlemini başlatan ana fonksiyon
    const handlePayment = async () => {
        const token = localStorage.getItem('token');
        setPaymentProcessing(true);
        setError('');

        let paymentPayload = {
            cartItems,
            total,
            address: userAddress,
            cardInfo: {}
        };

        // Kullanıcı yeni bir kart mı giriyor yoksa kayıtlı bir kart mı seçti?
        if (showNewCardForm) {
            // Basit bir validasyon
            if (!newCard.cardHolderName || !newCard.cardNumber || !newCard.expiryDate || !newCard.cvv) {
                setError('Lütfen tüm kart bilgilerini eksiksiz doldurun.');
                setPaymentProcessing(false);
                return;
            }
            paymentPayload.cardInfo = {
                details: newCard,
                save: saveCard
            };
        } else {
            if (!selectedCardId) {
                setError('Lütfen bir ödeme yöntemi seçin.');
                setPaymentProcessing(false);
                return;
            }
            paymentPayload.cardInfo = {
                savedCardId: selectedCardId
            };
        }

        try {
            const res = await fetch('http://localhost:5000/pay', { // Ödeme endpoint'iniz
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(paymentPayload)
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.message || 'Ödeme sırasında bir hata oluştu.');
            }

            // Ödeme başarılıysa Iyzico/Stripe vb. sayfasına yönlendir
            if (result.paymentPageUrl) {
                window.location.href = result.paymentPageUrl;
            } else {
                 // Başarılı ama yönlendirme yoksa sipariş onay sayfasına git
                navigate('/tr/order-confirmation');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setPaymentProcessing(false);
        }
    };
    
    // Yükleniyorsa Spinner göster
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="mb-4">Ödeme</h1>
            <Row>
                {/* Sol Sütun: Adres ve Ödeme Bilgileri */}
                <Col md={8}>
                    {/* Teslimat Adresi Kartı */}
                    <Card className="mb-4">
                        <Card.Header as="h5">Teslimat Adresi</Card.Header>
                        <Card.Body>
                            {userAddress && (
                                <>
                                    <p className="fw-bold">{userAddress.adres_ismi}</p>
                                    <p>{userAddress.adres_detay}</p>
                                    <p>{userAddress.ilce} / {userAddress.sehir} - {userAddress.posta_kodu}</p>
                                </>
                            )}
                            <Button variant="outline-primary" size="sm" onClick={() => navigate('/tr/userInfo')}>
                                Adresi Değiştir
                            </Button>
                        </Card.Body>
                    </Card>

                    {/* Ödeme Yöntemi Kartı */}
                    <Card>
                        <Card.Header as="h5">Ödeme Yöntemi</Card.Header>
                        <Card.Body>
                            {savedCards.map(card => (
                                <Form.Check
                                    key={card._id}
                                    type="radio"
                                    name="paymentMethod"
                                    id={`card-${card._id}`}
                                    label={`**** **** **** ${card.last4} - ${card.brand}`}
                                    checked={!showNewCardForm && selectedCardId === card._id}
                                    onChange={() => {
                                        setSelectedCardId(card._id);
                                        setShowNewCardForm(false);
                                    }}
                                    className="mb-2"
                                />
                            ))}

                            <Form.Check
                                type="radio"
                                name="paymentMethod"
                                id="new-card"
                                label="Yeni Kart Ekle"
                                checked={showNewCardForm}
                                onChange={() => {
                                    setShowNewCardForm(true);
                                    setSelectedCardId(null);
                                }}
                            />
                            
                            {showNewCardForm && (
                                <div className="mt-3 p-3 border rounded">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Kart Üzerindeki İsim</Form.Label>
                                        <Form.Control type="text" name="cardHolderName" onChange={handleNewCardChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Kart Numarası</Form.Label>
                                        <Form.Control type="text" name="cardNumber" onChange={handleNewCardChange} placeholder="---- ---- ---- ----"/>
                                    </Form.Group>
                                    <Row>
                                        <Col>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Son Kullanma Tarihi (AA/YY)</Form.Label>
                                                <Form.Control type="text" name="expiryDate" onChange={handleNewCardChange} placeholder="AA/YY" />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="mb-3">
                                                <Form.Label>CVV</Form.Label>
                                                <Form.Control type="text" name="cvv" onChange={handleNewCardChange} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Check
                                        type="checkbox"
                                        label="Bu kartı sonraki alışverişlerim için kaydet"
                                        checked={saveCard}
                                        onChange={(e) => setSaveCard(e.target.checked)}
                                    />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sağ Sütun: Sipariş Özeti */}
                <Col md={4}>
                    <Card className="position-sticky" style={{ top: '20px' }}>
                        <Card.Header as="h5">Sipariş Özeti</Card.Header>
                        <Card.Body>
                            {cartItems.map(item => (
                                <div key={item.id} className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <Image src={item.image} width={50} rounded />
                                        <div className="ms-3">
                                            <div className="fw-bold">{item.name}</div>
                                            <small className="text-muted">{item.quantity} adet</small>
                                        </div>
                                    </div>
                                    <div className="fw-bold">{(item.price * item.quantity).toFixed(2)} ₺</div>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between">
                                <span>Ara Toplam</span>
                                <span>{total.toFixed(2)} ₺</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Kargo</span>
                                <span className="text-success">Ücretsiz</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between h5">
                                <strong>Toplam</strong>
                                <strong>{total.toFixed(2)} ₺</strong>
                            </div>
                        </Card.Body>
                        <Card.Footer>
                            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                            <Button
                                variant="success"
                                size="lg"
                                className="w-100"
                                onClick={handlePayment}
                                disabled={paymentProcessing}
                            >
                                {paymentProcessing ? <Spinner as="span" animation="border" size="sm" /> : 'Ödemeyi Tamamla'}
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PaymentPageTR;