import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const MailQueryPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/check-order', { email });

      if (response.data.success) {
        setVariant('success');
        setMessage('Tek seferlik bağlantınız hazır! E-postanızı kontrol edin, sipariş detaylarınıza ulaşabilirsiniz.');
      } else {
        setVariant('warning');
        setMessage('Bu e-posta adresine ait herhangi bir sipariş bulunamadı.');
      }
    } catch (err) {
      setVariant('danger');
      setMessage('Sunucu hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">Sipariş Sorgulama</h3>

          {message && <Alert variant={variant}>{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>E-posta Adresi</Form.Label>
              <Form.Control
                type="email"
                placeholder="ornek@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Button
              variant="danger"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Sorgulanıyor...' : 'Sorgula'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MailQueryPage;
