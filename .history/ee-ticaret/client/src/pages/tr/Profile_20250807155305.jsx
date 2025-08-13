Harika bir istek! İsteklerinizi tek tek ele alarak hem backend (Node.js/Express) hem de frontend (React) tarafında gerekli güncellemeleri yapalım. Ortaya profesyonel, fonksiyonel ve ölçeklenebilir bir yapı çıkaracağız.

1. Backend Güncellemeleri (updateProfileController.js)

Mevcut updateProfileController yapınız, bir kullanıcının tüm adreslerini tek bir adresle değiştiriyor. Bu, birden fazla adresi yönetmek için uygun değil. Yapıyı şu şekilde düzenlemeliyiz:

Ayrı Controller'lar: Her işlem (kişisel bilgi güncelleme, adres ekleme, adres güncelleme, adres silme) için ayrı controller ve route oluşturmak en temiz yöntemdir. Bu, kodun okunabilirliğini ve bakımını kolaylaştırır.

Adres Yönetimi: Adresleri _id'leri üzerinden hedefleyerek güncelleyeceğiz ve sileceğiz. Mongoose, bir dizi içindeki her alt belgeye otomatik olarak bir _id atar.

Aşağıda, isteklerinizi karşılayan, yeniden düzenlenmiş backend kodunu bulabilirsiniz.

controllers/profileController.js (Örnek Dosya Adı)

code
JavaScript
download
content_copy
expand_less

const User = require('../models/users'); // Model ismini User olarak varsayıyoruz
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); // _id kontrolü için

// 1. Sadece Temel Profil Bilgilerini Güncelleme
const updateUserInfoController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ad, soyad, email, telefon, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    // Alanları güncelle
    if (ad) user.ad = ad;
    if (soyad) user.soyad = soyad;
    if (email) user.email = email;
    if (telefon) user.telefon = telefon;

    // Şifre güncelleniyorsa
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const { password: _, ...userData } = user.toObject(); // şifreyi yanıttan çıkar
    res.status(200).json({ message: 'Profil bilgileri başarıyla güncellendi.', user: userData });

  } catch (err) {
    console.error('Profil bilgileri güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// 2. Yeni Adres Ekleme
const addAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    // Frontend'den gelen veriyi "adres_basligi" olarak alıyoruz ("Ev Adresim", "Ofis" gibi)
    const { adres_basligi, ulke, sehir, ilce, posta_kodu, adres_detay, varsayilan } = req.body;
    
    // Gerekli alanların kontrolü
    if (!adres_basligi || !sehir || !ilce || !adres_detay) {
      return res.status(400).json({ message: 'Lütfen adres başlığı, şehir, ilçe ve adres detayı alanlarını doldurun.' });
    }
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    
    const newAddress = { adres_basligi, ulke, sehir, ilce, posta_kodu, adres_detay, varsayilan };
    
    // Eğer yeni adres varsayılan olarak işaretlenmişse, diğerlerini false yap
    if (varsayilan && user.adresler && user.adresler.length > 0) {
      user.adresler.forEach(addr => addr.varsayilan = false);
    }
    
    user.adresler.push(newAddress);
    await user.save();

    const addedAddress = user.adresler[user.adresler.length - 1]; // Eklenen son adresi al (içinde _id var)

    res.status(201).json({ message: 'Adres başarıyla eklendi.', adresler: user.adresler });
  } catch (err) {
    console.error('Adres ekleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};


// 3. Mevcut Adresi Güncelleme
const updateAddressController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params; // Route'dan adresin ID'sini alıyoruz: /profile/address/:addressId
        const { adres_basligi, ulke, sehir, ilce, posta_kodu, adres_detay, varsayilan } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

        const addressToUpdate = user.adresler.id(addressId);
        if (!addressToUpdate) return res.status(404).json({ message: 'Adres bulunamadı.' });
        
        // Eğer güncellenen adres varsayılan yapılacaksa, diğerlerini false yap
        if (varsayilan && !addressToUpdate.varsayilan) {
           user.adresler.forEach(addr => addr.varsayilan = false);
        }

        // Alanları güncelle
        Object.assign(addressToUpdate, req.body);
        
        await user.save();
        res.status(200).json({ message: 'Adres başarıyla güncellendi.', adresler: user.adresler });

    } catch (err) {
        console.error('Adres güncelleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// ... Diğer controller'lar (adres silme, kart ekleme vs.) eklenebilir.

module.exports = {
  updateUserInfoController, // Kişisel bilgiler için
  addAddressController,
  updateAddressController,
  // deleteAddressController vb...
};

routes/profileRoutes.js (Örnek Dosya Adı)

code
JavaScript
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware'); // Middleware'iniz
const {
    updateUserInfoController,
    addAddressController,
    updateAddressController
} = require('../controllers/profileController');

// Kişisel bilgileri güncelle
router.put('/profile/user-info', authMiddleware, updateUserInfoController);

// Yeni adres ekle
router.post('/profile/address', authMiddleware, addAddressController);

// Mevcut bir adresi güncelle
router.put('/profile/address/:addressId', authMiddleware, updateAddressController);

// Bir adresi sil (örnek)
// router.delete('/profile/address/:addressId', authMiddleware, deleteAddressController);

module.exports = router;
2. Frontend Güncellemeleri (ProfileTR.js)

Frontend'de istediğiniz tüm değişiklikleri içeren, hem fonksiyonel hem de estetik olarak geliştirilmiş versiyon aşağıdadır.

İstekleriniz Tek Tek Ele Alındı:

"kart bilgileri siyah yazsın beyaz yazılar görünmüyor": Kart bileşenindeki tüm metinlere text-white class'ı eklenerek okunurluk artırıldı.

"adres düzenleme kısmı çalışmıyor çalışsın": Artık "Düzenle" butonu, adres ekleme modalını düzenleme modunda açıyor ve mevcut bilgileri forma dolduruyor.

"adres ekleyince adres tipi yerine adres adı yazsın": adres_tipi yerine daha esnek olan adres_basligi kullanıldı. Formda "Adres Başlığı" olarak bir metin alanı var.

"şehir kısmı istanbul yazıyor boş olsun": newAddress state'indeki sehir başlangıç değeri '' (boş string) olarak değiştirildi.

"adresi kaydet diyince profili güncellesin eklesin yani": Adres Ekle/Güncelle butonları artık backend API'lerini çağırıyor ve başarılı olursa kullanici state'ini güncelleyerek anında yansıtıyor.

ProfileTR.js (Geliştirilmiş Kod)

code
JavaScript
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
import React, { useState, useEffect } from 'react';
import { 
  Container, Card, Form, Button, Row, Col, 
  Modal, Badge, ListGroup, Tab, Tabs, Alert
} from 'react-bootstrap';
import axios from 'axios';

// Örnek API URL. .env dosyasından çekmek en iyisidir.
const API_URL = 'http://localhost:5000/api'; // Kendi API url'niz ile değiştirin

const ProfileTR = () => {
  const [kullanici, setKullanici] = useState({
    ad: '', soyad: '', email: '', telefon: '',
    adresler: [], odeme_yontemleri: []
  });

  // Şifre için ayrı state kullanmak daha temiz bir yöntemdir.
  const [yeniSifre, setYeniSifre] = useState('');
  
  // Modal state'leri
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false); // Düzenleme modunu kontrol eder
  const [currentAddress, setCurrentAddress] = useState(null); // Düzenlenen adres verisini tutar
  
  // Bildirimler için
  const [bildirim, setBildirim] = useState({ show: false, message: '', variant: 'light' });

  // Token'ı localStorage'dan alıyoruz
  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  
  // -- API İŞLEMLERİ --

  useEffect(() => {
    const kullaniciBilgileriniGetir = async () => {
      try {
        // GERÇEK API ÇAĞRISI
        const res = await axios.get(`${API_URL}/profile`, authHeaders); // profil getiren endpoint
        setKullanici(res.data.user || res.data); 
      } catch (err) {
        console.error('Profil verisi alınamadı:', err);
        setBildirim({ show: true, message: 'Profil verisi yüklenemedi.', variant: 'danger' });
      }
    };
    if (token) {
        kullaniciBilgileriniGetir();
    }
  }, [token]);

  // -- HANDLER'LAR --
  
  const handleInputChange = (e) => {
    setKullanici(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentAddress(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  // Kişisel bilgileri güncelle
  const handleUserInfoUpdate = async (e) => {
    e.preventDefault();
    const dataToUpdate = {
        ad: kullanici.ad,
        soyad: kullanici.soyad,
        email: kullanici.email,
        telefon: kullanici.telefon,
        ...(yeniSifre && { password: yeniSifre }) // Sadece şifre girilmişse ekle
    };

    try {
        const res = await axios.put(`${API_URL}/profile/user-info`, dataToUpdate, authHeaders);
        setKullanici(res.data.user);
        setYeniSifre('');
        setBildirim({ show: true, message: 'Bilgiler başarıyla güncellendi!', variant: 'success' });
    } catch (err) {
        console.error('Güncelleme hatası:', err);
        setBildirim({ show: true, message: 'Güncelleme başarısız oldu.', variant: 'danger' });
    }
  };

  // Yeni adres ekleme modalını açar
  const openNewAddressModal = () => {
    setIsEditingAddress(false);
    setCurrentAddress({ 
        adres_basligi: '', ulke: 'Türkiye', sehir: '', ilce: '',
        posta_kodu: '', adres_detay: '', varsayilan: false
    });
    setShowAddressModal(true);
  };
  
  // Düzenleme modalını açar
  const openEditAddressModal = (adres) => {
    setIsEditingAddress(true);
    setCurrentAddress(adres);
    setShowAddressModal(true);
  };
  
  // Adres kaydetme (Ekleme veya Güncelleme)
  const handleSaveAddress = async () => {
    if (isEditingAddress) {
      // Güncelleme
      try {
        const res = await axios.put(`${API_URL}/profile/address/${currentAddress._id}`, currentAddress, authHeaders);
        setKullanici(prev => ({...prev, adresler: res.data.adresler}));
        setBildirim({ show: true, message: 'Adres güncellendi.', variant: 'success' });
      } catch(err) {
        console.error("Adres güncelleme hatası:", err);
        setBildirim({ show: true, message: 'Adres güncellenemedi.', variant: 'danger' });
      }
    } else {
      // Ekleme
      try {
        const res = await axios.post(`${API_URL}/profile/address`, currentAddress, authHeaders);
        setKullanici(prev => ({...prev, adresler: res.data.adresler}));
        setBildirim({ show: true, message: 'Yeni adres eklendi.', variant: 'success' });
      } catch(err) {
         console.error("Adres ekleme hatası:", err);
         setBildirim({ show: true, message: 'Adres eklenemedi.', variant: 'danger' });
      }
    }
    setShowAddressModal(false);
  };

  return (
    <Container className="py-5">
      {bildirim.show && 
        <Alert variant={bildirim.variant} onClose={() => setBildirim({show: false})} dismissible>
            {bildirim.message}
        </Alert>
      }
      {/* ... Diğer JSX kodları ... */}
       <Tab eventKey="address" title="Adreslerim">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-danger mb-0">Adreslerim</h4>
                <Button variant="danger" onClick={openNewAddressModal}>Yeni Adres Ekle</Button>
              </div>
              
              <Row>
                {kullanici.adresler.map((adres, index) => (
                  <Col md={6} className="mb-4" key={adres._id || index}> {/* Mutlaka key olarak _id kullanın */}
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
                        {/* ADRES ADI/BAŞLIĞI GÖSTERİLİYOR */}
                        <span>{adres.adres_basligi}</span>
                        {adres.varsayilan && <Badge bg="light" text="dark">Varsayılan</Badge>}
                      </Card.Header>
                      <Card.Body>
                        <p>{adres.adres_detay}</p>
                        <p className="text-muted">{adres.ilce} / {adres.sehir} - {adres.posta_kodu}</p>
                      </Card.Body>
                      <Card.Footer className="d-flex justify-content-end bg-light">
                        {/* DÜZENLEME BUTONU AKTİF */}
                        <Button variant="outline-danger" size="sm" className="me-2" onClick={() => openEditAddressModal(adres)}>
                          Düzenle
                        </Button>
                        <Button variant="outline-secondary" size="sm">Sil</Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      <Tab eventKey="payment" title="Ödeme Yöntemleri">
        {/* ... */}
            <Card.Body className="p-4 text-white rounded" style={{background: 'linear-gradient(135deg, #2c3e50, #4a6491)'}}>
              <div className="d-flex justify-content-between mb-4">
                {/* OKUNURLUK İÇİN TEXT-WHITE EKLENDİ */}
                <div className="fw-bold text-white">{kart.kart_tipi}</div> 
                {kart.varsayilan && <Badge bg="light" text="dark">Varsayılan</Badge>}
              </div>
              <div className="d-flex align-items-center mb-4">
                <div className="bg-warning rounded me-3" style={{width: '50px', height: '35px'}}></div>
                {/* OKUNURLUK İÇİN TEXT-WHITE EKLENDİ */}
                <h4 className="mb-0 text-white font-monospace">{kart.kart_numarasi}</h4>
              </div>
              <div className="d-flex justify-content-between text-white"> {/* OKUNURLUK İÇİN TEXT-WHITE EKLENDİ */}
                <div>
                  <div className="small">KART SAHİBİ</div>
                  <div>{kullanici.ad} {kullanici.soyad}</div>
                </div>
                <div>
                  <div className="small">SON KULLANMA</div>
                  <div>{kart.son_kullanma || "12/28"}</div>
                </div>
              </div>
            </Card.Body>
        {/* ... */}
      </Tab>
       {/* ADRES EKLEME/DÜZENLEME MODALI */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} size="lg">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>{isEditingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentAddress && <Form>
            <Form.Group className="mb-3">
              {/* ADRES TİPİ YERİNE ADRES BAŞLIĞI */}
              <Form.Label>Adres Başlığı</Form.Label>
              <Form.Control 
                type="text" 
                name="adres_basligi"
                placeholder='Örn: Ev Adresim, Ofis'
                value={currentAddress.adres_basligi}
                onChange={handleAddressChange}
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Şehir</Form.Label>
                  <Form.Control type="text" name="sehir" value={currentAddress.sehir} onChange={handleAddressChange}/>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>İlçe</Form.Label>
                  <Form.Control type="text" name="ilce" value={currentAddress.ilce} onChange={handleAddressChange}/>
                </Form.Group>
              </Col>
            </Row>
            {/* ...diğer form alanları... */}
             <Form.Check 
                type="checkbox"
                name="varsayilan"
                checked={currentAddress.varsayilan}
                onChange={handleAddressChange}
                label="Bu adresi varsayılan olarak kullan"
              />
          </Form>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>İptal</Button>
          <Button variant="danger" onClick={handleSaveAddress}>Adresi Kaydet</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default ProfileTR;