import React, { useEffect, useState } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const PaymentPage = () => {
  const [checkoutHtml, setCheckoutHtml] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const guestInfo = localStorage.getItem('guestInfo');
    const cart = localStorage.getItem('cart'); // Sepet bilgisi
    if (!guestInfo || !cart) {
      setError('Misafir bilgileri veya sepet bulunamadı.');
      setLoading(false);
      return;
    }

    const data = {
      ...JSON.parse(guestInfo),
      sepet: JSON.parse(cart),
      price: JSON.parse(cart).reduce((acc, item) => acc + item.fiyat * item.adet, 0),
      ip: '', // İstersen buraya kullanıcı IP'si ekle (isteğe bağlı)
      adres: JSON.parse(guestInfo).adres_detay
    };

    axios.post('/initialize', data)
      .then(res => {
        setCheckoutHtml(res.data.htmlContent);
        setLoading(false);
      })
      .catch(err => {
        setError('Ödeme başlatılamadı. Lütfen tekrar deneyin.');
        setLoading(false);
      });
  }, []);

  if (loading) return <Container className="py-5"><Spinner animation="border" /> Ödeme formu hazırlanıyor...</Container>;

  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5">
      <h2>Ödeme</h2>
      <div dangerouslySetInnerHTML={{ __html: checkoutHtml }} />
    </Container>
  );
};

export default PaymentPage;
