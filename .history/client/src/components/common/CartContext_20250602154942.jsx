// src/pages/CartPage.jsx
import React, { useContext } from 'react';
import { Container, Table } from 'react-bootstrap';

export default function CartPage() {
  const { cartItems } = useContext(CartContext);

  return (
    <Container className="py-5">
      <h1 className="mb-4">Sepetiniz</h1>
      {cartItems.length === 0 ? (
        <p>Sepetiniz boş.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Ürün</th>
              <th>Adet</th>
              <th>Fiyat</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.price} ₺</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
