import React, { useContext } from 'react';
import { CartContext } from '../../components/common/CartContext';
import { Container, Table, Image } from 'react-bootstrap';

export default function CartPageTR() {
  const { cartItems } = useContext(CartContext);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Container className="py-5">
      <h1 className="mb-4">Sepetiniz</h1>

      {cartItems.length === 0 ? (
        <p>Sepetiniz boş.</p>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Adet</th>
                <th>Birim Fiyat</th>
                <th>Toplam</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td className="d-flex align-items-center gap-3">
                    <Image src={item.image} alt={item.name} width={60} height={60} rounded />
                    <span>{item.name}</span>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.price} ₺</td>
                  <td>{(item.price * item.quantity).toFixed(2)} ₺</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h4 className="text-end mt-4">
            Toplam: <strong>{total.toFixed(2)} ₺</strong>
          </h4>
        </>
      )}
    </Container>
  );
}
