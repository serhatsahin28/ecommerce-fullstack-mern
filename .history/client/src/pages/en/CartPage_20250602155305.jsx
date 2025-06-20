
// CartPage.jsx (src/pages/en/CartPage.jsx)
import React, { useContext } from 'react';
import { CartContext } from '../../components/common/CartContext';
import { Container, Table } from 'react-bootstrap';

export default function CartPageEN() {
  const { cartItems } = useContext(CartContext);

  return (
    <Container className="py-5">
      <h1 className="mb-4">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>${item.price}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}