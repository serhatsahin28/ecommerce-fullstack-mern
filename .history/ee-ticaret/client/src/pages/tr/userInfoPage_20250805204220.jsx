import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Modal } from 'react-bootstrap';

const UserInfoPage = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [adres, setAdres] = useState({
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: ''
  });

  // Token'ı localStorage'dan alıyoruz.
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserAdres = async () => {
      // Eğer token yoksa, fetch işlemi yapmaya gerek yok.
      if (!token) {
        setLoading(false);
        console.log("Kullanıcı girişi yapılmamış.");
        return;
      }
      
      try {
        const res = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Adres bilgisi alınamadı');
        
        const user = await res.json();

        // Kullanıcının ilk adresi varsa onu al, yoksa boş obje kullan.
        const ilkAdres = user.adresler?.[0] || {};

        setAdres({
          adres_detay: ilkAdres.adres_detay || '',
          sehir: ilkAdres.sehir || '',
          ilce: ilkAdres.ilce || '',
          posta_kodu: ilkAdres.posta_kodu || ''
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAdres();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdres(prev => ({ ...prev, [name]: value }));
  };

  // Adres alanlarının boş olup olmadığını kontrol eden fonksiyon
  const isAddressEmpty = () => {
    return !adres.adres_detay.trim() && !adres.sehir.trim() && 
           !adres.ilce.trim() && !adres.posta_kodu.trim();
  };

  // Kaydetme işlemini başlatan fonksiyon
  const handleSave = async (e) => {
    e.preventDefault();

    // Her durumda modal aç (boş da olsa dolu da olsa)
    setShowModal(true);
  };

  // Veritabanına kaydetme fonksiyonu
  const saveAddress = async () => {
    try {
      const res = await fetch('http://localhost:5000/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adres)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Adres güncelleme başarısız');
      }

      alert('Adres bilgileriniz başarıyla kaydedildi!');

    } catch (err) {
      console.error(err);
      alert(`Bir hata oluştu: ${err.message}`);
    }
  };

  // Modal'da "Evet" butonuna tıklandığında
  const handleConfirmSave = async () => {
    setShowModal(false);
    await saveAddress();
    // Kaydettikten sonra paymentPage'e yönlendir
    navigateToPayment();
  };

  // Modal'da "Hayır" butonuna tıklandığında
  const handleCancelSave = () => {
    setShowModal(false);
    console.log('Kullanıcı kaydetme işlemini iptal etti.');
    // Kaydetmeden direkt paymentPage'e yönlendir
    navigateToPayment();
  };

  // PaymentPage'e yönlendirme fonksiyonu
  const navigateToPayment = () => {
    // Adres bilgilerini localStorage'a kaydet (paymentPage'de kullanmak için)
    localStorage.setItem('userAddress', JSON.stringify(adres));
    

   
    
    console.log('PaymentPage\'e yönlendiriliyor...', adres);
    alert('PaymentPage\'e yönlendiriliyorsunuz...');

    navigate('/pay');

  };
  
  // Eğer veriler yükleniyorsa Spinner göster
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }
  
  // Formu göster
  return (
    <Container className="py-5">
      <h1 className="mb-4">Adres Bilgileriniz</h1>
      
      <Form onSubmit={handleSave}> 
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Adres Detay</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="adres_detay"
                value={adres.adres_detay}
                onChange={handleChange}
                placeholder="Mahalle, sokak, kapı no vb."
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
                value={adres.sehir}
                onChange={handleChange}
                placeholder="Örn: İstanbul"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>İlçe</Form.Label>
              <Form.Control
                type="text"
                name="ilce"
                value={adres.ilce}
                onChange={handleChange}
                placeholder="Örn: Kadıköy"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Posta Kodu</Form.Label>
              <Form.Control
                type="text"
                name="posta_kodu"
                value={adres.posta_kodu}
                onChange={handleChange}
                placeholder="Örn: 34710"
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit">
          Devam Et
        </Button>
      </Form>

      {/* Onay Modal'ı */}
      <Modal show={showModal} onHide={handleCancelSave} centered>
        <Modal.Header closeButton>
          <Modal.Title>Adres Bilgilerini Kaydet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Girdiğiniz adres bilgilerini kaydetmek istiyor musunuz?</p>
          {isAddressEmpty() && (
            <small className="text-muted">
              <em>Not: Adres bilgileriniz boş görünüyor.</em>
            </small>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelSave}>
            Hayır, Kaydetme
          </Button>
          <Button variant="primary" onClick={handleConfirmSave}>
            Evet, Kaydet
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserInfoPage;