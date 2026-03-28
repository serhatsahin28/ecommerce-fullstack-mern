import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, ListGroup, Alert } from 'react-bootstrap';
import axios from 'axios';
import { FaTrash, FaPlus } from 'react-icons/fa';

const ProfileTR = () => {
  // Kullanıcı bilgileri için state
  const [kullanici, setKullanici] = useState({
    ad: '',
    soyad: '',
    email: '',
    sifre: '',
    telefon: ''
  });

  // Adres yönetimi için state'ler
  const [adresler, setAdresler] = useState([]);
  const [yeniAdres, setYeniAdres] = useState({
    baslik: '',
    adres: '',
    sehir: '',
    postaKodu: ''
  });
  const [hataMesaji, setHataMesaji] = useState('');
  const [basariMesaji, setBasariMesaji] = useState('');

  // API'den verileri çekme
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const verileriGetir = async () => {
      try {
        // Kullanıcı profil verileri
        const profilYanit = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setKullanici({
          ad: profilYanit.data.ad || '',
          soyad: profilYanit.data.soyad || '',
          email: profilYanit.data.email || '',
          sifre: '',
          telefon: profilYanit.data.telefon || ''
        });

        // Kullanıcı adresleri
        const adresYanit = await axios.get('http://localhost:5000/profile/adresler', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAdresler(adresYanit.data || []);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
      }
    };

    verileriGetir();
  }, []);

  // Form değişikliklerini işle
  const handleDegisim = (e) => {
    const { name, value } = e.target;
    setKullanici(prev => ({ ...prev, [name]: value }));
  };

  // Adres formu değişiklikleri
  const handleAdresDegisim = (e) => {
    const { name, value } = e.target;
    setYeniAdres(prev => ({ ...prev, [name]: value }));
  };

  // Profil bilgilerini güncelle
  const bilgileriGuncelle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/profile/update', kullanici, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBasariMesaji('Profil bilgileri başarıyla güncellendi');
      setTimeout(() => setBasariMesaji(''), 3000);
    } catch (err) {
      setHataMesaji('Güncelleme sırasında bir hata oluştu');
      setTimeout(() => setHataMesaji(''), 3000);
      console.error('Güncelleme hatası:', err);
    }
  };

  // Yeni adres ekle
  const adresEkle = async () => {
    if (!yeniAdres.baslik || !yeniAdres.adres) {
      setHataMesaji('Lütfen zorunlu alanları doldurun');
      setTimeout(() => setHataMesaji(''), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const yanit = await axios.post(
        'http://localhost:5000/profile/adresler/ekle',
        yeniAdres,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAdresler([...adresler, yanit.data]);
      setYeniAdres({ baslik: '', adres: '', sehir: '', postaKodu: '' });
      setBasariMesaji('Adres başarıyla eklendi');
      setTimeout(() => setBasariMesaji(''), 3000);
    } catch (err) {
      setHataMesaji('Adres eklenirken hata oluştu');
      setTimeout(() => setHataMesaji(''), 3000);
      console.error('Adres ekleme hatası:', err);
    }
  };

  // Adres sil
  const adresSil = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/profile/adresler/sil/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAdresler(adresler.filter(adres => adres._id !== id));
      setBasariMesaji('Adres başarıyla silindi');
      setTimeout(() => setBasariMesaji(''), 3000);
    } catch (err) {
      setHataMesaji('Adres silinirken hata oluştu');
      setTimeout(() => setHataMesaji(''), 3000);
      console.error('Adres silme hatası:', err);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '800px' }}>
      {/* Hata ve Başarı Mesajları */}
      {hataMesaji && <Alert variant="danger">{hataMesaji}</Alert>}
      {basariMesaji && <Alert variant="success">{basariMesaji}</Alert>}

      {/* Profil Bilgileri Kartı */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h4 className="mb-4 text-center text-danger">Profil Bilgileri</h4>
          <Form onSubmit={bilgileriGuncelle}>
            {/* ... (Mevcut profil formu aynı kalacak) ... */}
          </Form>
        </Card.Body>
      </Card>

      {/* Adres Yönetimi Kartı */}
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="text-danger">Adreslerim</h4>
            <Button variant="danger" size="sm">
              <FaPlus className="me-1" /> Yeni Adres
            </Button>
          </div>

          {/* Adres Listesi */}
          {adresler.length > 0 ? (
            <ListGroup>
              {adresler.map((adres) => (
                <ListGroup.Item key={adres._id} className="mb-3 border rounded">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5>{adres.baslik}</h5>
                      <p className="mb-1">{adres.adres}</p>
                      <p className="mb-1">
                        {adres.sehir} {adres.postaKodu}
                      </p>
                    </div>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => adresSil(adres._id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted">Henüz kayıtlı adresiniz bulunmamaktadır.</p>
          )}

          {/* Yeni Adres Formu */}
          <div className="mt-5">
            <h5 className="mb-3">Yeni Adres Ekle</h5>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Adres Başlığı*</Form.Label>
                  <Form.Control
                    type="text"
                    name="baslik"
                    value={yeniAdres.baslik}
                    onChange={handleAdresDegisim}
                    placeholder="Ev, İş, vb."
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Adres*</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="adres"
                    value={yeniAdres.adres}
                    onChange={handleAdresDegisim}
                    placeholder="Tam adresinizi yazın"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Şehir</Form.Label>
                  <Form.Control
                    type="text"
                    name="sehir"
                    value={yeniAdres.sehir}
                    onChange={handleAdresDegisim}
                    placeholder="Şehir"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Posta Kodu</Form.Label>
                  <Form.Control
                    type="text"
                    name="postaKodu"
                    value={yeniAdres.postaKodu}
                    onChange={handleAdresDegisim}
                    placeholder="Posta kodu"
                  />
                </Form.Group>
              </Col>
              
              <Col className="text-end">
                <Button 
                  variant="danger" 
                  onClick={adresEkle}
                >
                  Adresi Kaydet
                </Button>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfileTR;