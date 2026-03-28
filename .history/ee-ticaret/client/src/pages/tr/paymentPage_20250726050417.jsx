import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';

const PaymentPage = () => {
  const [guestInfo, setGuestInfo] = useState(null);
  const [kartNo, setKartNo] = useState('');
  const [sonKullanmaTarihi, setSonKullanmaTarihi] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const storedGuestInfo = localStorage.getItem('guestInfo');
    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    } else {
      // Misafir bilgisi yoksa GuestInfoPage'ye yönlendir
      window.location.href = '/tr/guest-info';
    }
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    if (!kartNo || !sonKullanmaTarihi || !cvv) {
      setError('Lütfen kart bilgilerini eksiksiz girin.');
      return;
    }

    try {
      // Backend'e ödeme ve sipariş oluşturma isteği
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestInfo,
          paymentInfo: { kartNo, sonKullanmaTarihi, cvv }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Ödeme sırasında hata oluştu.');
        return;
      }

      // Başarılı ödeme sonrası
      setSuccessMessage(`Siparişiniz başarıyla oluşturuldu. Sipariş kodunuz: ${data.orderCode}`);
      
      // Burada modal açılabilir (önceki önerdiğim modal component)
      
    } catch (err) {
      setError('Sunucu ile bağlantı kurulamadı.');
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Ödeme Sayfası</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handlePayment}>
        <Form.Group className="mb-3" controlId="kartNo">
          <Form.Label>Kart Numarası</Form.Label>
          <Form.Control
            type="text"
            value={kartNo}
            onChange={(e) => setKartNo(e.target.value)}
            placeholder="XXXX XXXX XXXX XXXX"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="sonKullanmaTarihi">
          <Form.Label>Son Kullanma Tarihi</Form.Label>
          <Form.Control
            type="text"
            value={sonKullanmaTarihi}
            onChange={(e) => setSonKullanmaTarihi(e.target.value)}
            placeholder="AA/YY"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="cvv">
          <Form.Label>CVV</Form.Label>
          <Form.Control
            type="password"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="XXX"
          />
        </Form.Group>

        <Button type="submit" variant="primary">Ödeme Yap</Button>
      </Form>
    </Container>
  );
};

export default PaymentPage;
