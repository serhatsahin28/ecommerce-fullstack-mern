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

const CartPageEN = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart
  } = useContext(CartContext);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  localStorage.setItem(
    'cartData',
    JSON.stringify({ cartItems, total })
  );

  const handlePaymentStart = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setShowLoginModal(true);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Could not fetch user data');
      const user = await res.json();
      
      const missingInfo = !user.firstName || !user.lastName || !user.email || !user.phone ||
        !user.address?.[0]?.addressLine ||
        !user.address?.[0]?.city ||
        !user.address?.[0]?.district ||
        !user.address?.[0]?.postalCode;

      if (missingInfo) {
        navigate('/en/userInfo');
        return;
      }

      const paymentRes = await fetch('http://localhost:5000/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ user, cartItems, price: total })
      });

      const result = await paymentRes.json();

      if (result.paymentPageUrl) {
        window.location.href = result.paymentPageUrl;
      } else {
        alert('Could not initiate payment.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const itemId = item.product_id || item.id;
                const itemName = item.name || item.translations?.en?.name || 'Product';
                const categoryKey = item.category_key || 'general';
                const slug = categorySlugMap[categoryKey]?.en || categoryKey;

                return (
                  <tr key={itemId}>
                    <td className="d-flex align-items-center gap-3">
                      <Image src={item.image} alt={itemName} width={60} height={60} rounded />
                      <Link to={`/en/${slug}/${itemId}`} className="text-decoration-none text-dark">
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
                        <FaTrash /> Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4>
              Total: <strong>{total.toFixed(2)} ₺</strong>
            </h4>
            <Button variant="success" size="lg" onClick={handlePaymentStart}>
              Checkout
            </Button>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>To Continue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please log in or continue as a guest.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => navigate('/en/login')}>
            Log In
          </Button>
          <Button variant="primary" onClick={() => navigate('/en/guestInfo')}>
            Continue as Guest
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CartPageEN;