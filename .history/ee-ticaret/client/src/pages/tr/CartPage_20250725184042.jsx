import React, { useContext, useState } from 'react';
import { CartContext } from '../../components/common/CartContext';
import { Container, Table, Image, Button, Modal } from 'react-bootstrap';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const categorySlugMap = {
  electronics: { tr: 'elektronik', en: 'electronics' },
  fashion: { tr: 'moda', en: 'fashion' },
  books: { tr: 'kitaplar', en: 'books' },
  sports: { tr: 'spor', en: 'sports' },
  home_office: { tr: 'ev-ofis', en: 'home-office' }
};

const CartPageTR = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart
  } = useContext(CartContext);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePaymentStart = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setShowLoginModal(true);
      return;
    }

    try {
      const userRes = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!userRes.ok) throw new Error('Kullanıcı verileri alınamadı.');

      const user = await userRes.json();

      const hasMissing =
        !user.ad || !user.soyad || !user.email || !user.telefon ||
        !user.tcKimlikNo ||
        !user.adresler?.[0]?.adres_detay ||
        !user.adresler?.[0]?.sehir ||
        !user.adresler?.[0]?.ilce ||
        !user.adresler?.[0]?.posta_kodu;

      if (hasMissing) {
        navigate('/tr/eksik-bilgi');
        return;
      }

      const response = await fetch('/api/payment/iyzico/checkout-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ user, cartItems, total })
      });

      const result = await response.json();

      if (result.paymentPageUrl) {
        window.location.href = result.paymentPageUrl;
      } else {
        alert('Ödeme başlatılamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Ödeme işlemi hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Sepetiniz</h1>

      {cartItems.length === 0 ? (
        <p>Sepetinizde ürün yok.</p>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Adet</th>
                <th>Birim Fiyat</th>
                <th>Toplam</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const itemId = item.product_id || item.id;
                const itemName = item.name || item.translations?.tr?.name || 'Ürün';
                const categoryKey = item.category_key || 'genel';
                const slug = categorySlugMap[categoryKey]?.tr || categoryKey;

                return (
                  <tr key={itemId}>
                    <td className="d-flex align-items-center gap-3">
                      <Image src={item.image} alt={itemName} width={60} height={60} rounded />
                      <Link to={`/tr/${slug}/${itemId}`} className="text-decoration-none text-dark">
                        <span>{itemName}</span>
                      </Link>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <Button variant="light" size="sm" onClick={() => decreaseQuantity(itemId)}>
                          <FaMinus />
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button variant="light" size="sm" onClick={() => increaseQuantity(itemId)}>
                          <FaPlus />
                        </Button>
                      </div>
                    </td>
                    <td>{item.price.toFixed(2)} ₺</td>
                    <td>{(item.price * item.quantity).toFixed(2)} ₺</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => removeFromCart(itemId)}>
                        <FaTrash /> Sil
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4>
              Toplam: <strong>{total.toFixed(2)} ₺</strong>
            </h4>
            <Button variant="success" size="lg" onClick={handlePaymentStart}>
              Ödeme Yap
            </Button>
          </div>
        </>
      )}

      {/* 🔒 MODAL: Oturum Aç / Misafir */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Devam Etmek İçin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Lütfen oturum açın veya misafir olarak alışverişe devam edin.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => navigate('/giris')}>
            Oturum Aç
          </Button>
          <Button variant="primary" onClick={() => navigate('/tr/misafir-bilgi')}>
            Misafir Olarak Devam Et
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CartPageTR;
