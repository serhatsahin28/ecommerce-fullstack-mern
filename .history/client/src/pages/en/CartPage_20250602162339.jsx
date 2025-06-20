import React, { useContext } from 'react';
import { CartContext } from '../../components/common/CartContext';
import { Container, Table, Image, Button } from 'react-bootstrap';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const CartPageEN = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart
  } = useContext(CartContext);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Container className="py-5">
      <h1 className="mb-4">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is currently empty.</p>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td className="d-flex align-items-center gap-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={60}
                      rounded
                    />
                    <span>{item.name}</span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <Button variant="light" size="sm" onClick={() => decreaseQuantity(item.id)}>
                        <FaMinus />
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button variant="light" size="sm" onClick={() => increaseQuantity(item.id)}>
                        <FaPlus />
                      </Button>
                    </div>
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FaTrash /> Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4>
              Total: <strong>${total.toFixed(2)}</strong>
            </h4>
            <Button variant="success" size="lg">
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default CartPageEN;
