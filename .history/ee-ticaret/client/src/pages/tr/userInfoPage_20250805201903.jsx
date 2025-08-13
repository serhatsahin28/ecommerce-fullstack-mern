import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner } from 'react-bootstrap';

const UserInfoPage = () => {
  const [loading, setLoading] = useState(true);
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
        // İsteğe bağlı olarak kullanıcıyı giriş sayfasına yönlendirebilirsiniz.
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

  // ✅ İsteğinize göre düzenlenen kaydetme fonksiyonu
  const handleSave = async (e) => {
    e.preventDefault(); // Formun varsayılan gönderme davranışını engelle

    // 1. Kullanıcıya onayı sor
    const isConfirmed = window.confirm('Girdiğiniz adres bilgilerini kaydetmek ister misiniz?');

    // 2. Eğer kullanıcı "Hayır" (Cancel) derse, fonksiyondan çık
    if (!isConfirmed) {
      console.log('Kullanıcı kaydetme işlemini iptal etti.');
      // İsteğe bağlı olarak bir mesaj gösterebilirsiniz: alert('İşlem iptal edildi.');
      return; // Hiçbir şey yapmadan devam et
    }

    // 3. Eğer kullanıcı "Evet" (OK) derse, kaydetme işlemini yap
    try {
      const res = await fetch('http://localhost:5000/profile/update-address', {
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
      {/* onSubmit olayını forma ekleyerek Enter tuşuna basıldığında da çalışmasını sağlarız */}
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
                required
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
                required
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
                required
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

        {/* Button tipini 'submit' olarak değiştirmek daha doğrudur */}
        <Button variant="primary" type="submit">
          Kaydet
        </Button>
      </Form>
    </Container>
  );
};

export default UserInfoPage;