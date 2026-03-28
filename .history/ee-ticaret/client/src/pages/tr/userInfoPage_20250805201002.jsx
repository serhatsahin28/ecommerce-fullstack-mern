import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner } from 'react-bootstrap';

const UserAddressPage = () => {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentAddress, setCurrentAddress] = useState({
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Kullanıcı bilgisi alınamadı');

        const user = await res.json();
        const userAddresses = user.adresler || [];

        setAddresses(userAddresses);

        if (userAddresses.length > 0) {
          setCurrentAddress(userAddresses[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectAddress = (e) => {
    const index = parseInt(e.target.value);
    setSelectedIndex(index);
    setCurrentAddress(addresses[index]);
  };

  const handleSave = async () => {
    try {
      // adresleri güncelle
      const newAddresses = [...addresses];
      if (addresses.length === 0) {
        // ilk adres ekleme
        newAddresses.push(currentAddress);
      } else {
        newAddresses[selectedIndex] = currentAddress;
      }

      const res = await fetch('http://localhost:5000/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adresler: newAddresses })
      });

      if (!res.ok) throw new Error('Güncelleme başarısız');

      alert('Adres bilgileriniz kaydedildi!');
    } catch (err) {
      console.error(err);
      alert('Bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Adres Bilgileriniz</h1>

      {addresses.length > 1 && (
        <Form.Group className="mb-3">
          <Form.Label>Adres Seçin</Form.Label>
          <Form.Select value={selectedIndex} onChange={handleSelectAddress}>
            {addresses.map((addr, idx) => (
              <option key={idx} value={idx}>
                {addr.adres_detay || `Adres ${idx + 1}`}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      <Form>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Adres Detay</Form.Label>
              <Form.Control
                type="text"
                name="adres_detay"
                value={currentAddress.adres_detay || ''}
                onChange={handleChange}
                placeholder="Adresinizi giriniz"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Şehir</Form.Label>
              <Form.Control
                type="text"
                name="sehir"
                value={currentAddress.sehir || ''}
                onChange={handleChange}
                placeholder="Şehir"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>İlçe</Form.Label>
              <Form.Control
                type="text"
                name="ilce"
                value={currentAddress.ilce || ''}
                onChange={handleChange}
                placeholder="İlçe"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Posta Kodu</Form.Label>
              <Form.Control
                type="text"
                name="posta_kodu"
                value={currentAddress.posta_kodu || ''}
                onChange={handleChange}
                placeholder="Posta Kodu"
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" onClick={handleSave}>
          Kaydet
        </Button>
      </Form>
    </Container>
  );
};

export default UserAddressPage;
