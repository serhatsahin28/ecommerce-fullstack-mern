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
      if (!res.ok) throw new Error('Failed to fetch user data');

      const user = await res.json();
      const incomplete = 
        !user.firstName || 
        !user.lastName || 
        !user.email || 
        !user.phone ||
        !user.idNumber ||
        !user.addresses?.[0]?.addressDetail ||
        !user.addresses?.[0]?.city ||
        !user.addresses?.[0]?.district ||
        !user.addresses?.[0]?.postalCode;

      if (incomplete) {
        navigate('/en/userInfo');
        return;
      }

      const paymentRes = await fetch('/pay', {
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
        alert('Failed to start payment.');
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
                const itemId = item.id || item._id || item.productId;
                const itemName = item.name?.en || item.name || 'Product';
                const categoryKey = item.category_key || 'general';
                const slug = categorySlugMap[categoryKey]?.en || categoryKey;

                return (
                  <tr key={`cart-item-${itemId}-${Date.now()}`}>
                    <td className="d-flex align-items-center gap-3">
                      <Image 
                        src={item.image} 
                        alt={itemName} 
                        width={60} 
                        height={60} 
                        rounded 
                      />
                      <Link 
                        to={`/en/${slug}/${itemId}`} 
                        className="text-decoration-none text-dark"
                      >
                        <span>{itemName}</span>
                      </Link>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <Button 
                          variant="light" 
                          size="sm" 
                          onClick={() => decreaseQuantity(itemId)}
                        >
                          <FaMinus />
                        </Button>
                        <span className="mx-2">{item.quantity || 0}</span>
                        <Button 
                          variant="light" 
                          size="sm" 
                          onClick={() => increaseQuantity(itemId)}
                        >
                          <FaPlus />
                        </Button>
                      </div>
                    </td>
                    <td>{(item.price || 0).toFixed(2)} $</td>
                    <td>{((item.price || 0) * (item.quantity || 0)).toFixed(2)} $</td>
                    <td>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => removeFromCart(itemId)}
                      >
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
              Total: <strong>{total.toFixed(2)} $</strong>
            </h4>
            <Button variant="success" size="lg" onClick={handlePaymentStart}>
              Proceed to Payment
            </Button>
          </div>
        </>
      )}

      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Continue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please sign in or continue as guest.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => navigate('/en/login')}>
            Sign In
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