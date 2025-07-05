import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, Modal, 
  InputGroup, FormControl, Alert, Spinner
} from 'react-bootstrap';
import { FaStar, FaTrash, FaPlus, FaSearch, FaSync } from 'react-icons/fa';

// Başlangıç verisi (değişiklik yok)
const initialData = { /* ... */ };

const AdminHome = () => {
  // --- STATE'LER ---
  const [homePageData, setHomePageData] = useState(initialData);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Yeni eklenen state'ler (kullanıcı deneyimi için)
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' });

  // Mevcut modal state'leri (değişiklik yok)
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- VERİ ÇEKME ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Backend'den GET isteği ile verileri alıyoruz
      const response = await fetch('http://localhost:5000/admin/homeList'); 
      if (!response.ok) throw new Error(`HTTP hatası! Durum: ${response.status}`);
      
      const result = await response.json();
      
      if (result.homeData && result.homeData.length > 0) {
        setHomePageData(result.homeData[0]);
      } else {
        setHomePageData(initialData);
      }
      setAllProducts(result.productData || []);
      
    } catch (error) {
      setError('Veriler yüklenemedi. Sunucu çalışmıyor olabilir.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- ‼️ GÜNCELLENEN KAYDETME FONKSİYONU ‼️ ---
  const saveToDatabase = async () => {
    // Eğer kaydedilecek bir ID yoksa işlemi durdur
    if (!homePageData._id) {
      setSaveStatus({ message: 'Kaydedilecek veri ID\'si bulunamadı!', type: 'danger' });
      return;
    }

    setIsSaving(true);
    setSaveStatus({ message: '', type: '' }); // Önceki mesajı temizle

    try {
      // Backend'de oluşturduğumuz yeni endpoint'e PUT isteği atıyoruz
      const response = await fetch(`http://localhost:5000/admin/home/${homePageData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // State'deki tüm güncel anasayfa verisini body'de gönderiyoruz
        body: JSON.stringify(homePageData), 
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Güncelleme sırasında bir hata oluştu.');
      }
      
      // Başarılı
      setSaveStatus({ message: result.message, type: 'success' });

    } catch (error) {
      console.error('Kaydetme hatası:', error);
      setSaveStatus({ message: error.message, type: 'danger' });
    } finally {
      setIsSaving(false);
      // 3 saniye sonra bildirim mesajını kaldır
      setTimeout(() => setSaveStatus({ message: '', type: '' }), 3000);
    }
  };
  
  // --- YENİLEME FONKSİYONU (KAYDEDİLMEMİŞ DEĞİŞİKLİKLERİ İPTAL ET) ---
  const handleRefresh = () => {
    if (window.confirm('Kaydedilmemiş tüm değişiklikler kaybolacak. Sunucudan verileri yeniden yüklemek istediğinize emin misiniz?')) {
      fetchData(); // Sadece verileri yeniden çeker
    }
  };

  // --- MEVCUT DÜZENLEME FONKSİYONLARI (DEĞİŞİKLİK YOK) ---
  // Bu fonksiyonlar sadece state'i günceller, hepsi doğru çalışıyor.
  const handleAddProductToCategory = (productToAdd) => { /* ... sizin kodunuz ... */ };
  const deleteProduct = (id, categoryKey) => { /* ... sizin kodunuz ... */ };
  const deleteCategory = (categoryKey) => { /* ... sizin kodunuz ... */ };
  // ... diğer tüm `setHomePageData` kullanan fonksiyonlarınız.

  // --- RENDER ---
  if (loading) return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="danger" /><h4 className="ms-3">Yükleniyor...</h4></Container>;
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container fluid className="p-3 p-md-4">
      {/* --- RESPONSIVE ÜST ALAN --- */}
      <Row className="mb-4 align-items-center">
        <Col xs={12} md="auto" className="flex-grow-1 mb-3 mb-md-0">
          <h2 className="mb-0 fw-bold text-danger">Admin Home Sayfası</h2>
        </Col>
        <Col xs={12} md="auto" className="d-flex gap-2 justify-content-start justify-content-md-end">
          <Button variant="secondary" onClick={handleRefresh}>
            <FaSync /> <span className="d-none d-md-inline">Yenile</span>
          </Button>
          <Button variant="success" onClick={saveToDatabase} disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner as="span" size="sm" /> Kaydediliyor...
              </>
            ) : (
              'Tüm Değişiklikleri Kaydet'
            )}
          </Button>
        </Col>
      </Row>

      {/* Kaydetme Durum Bildirimi */}
      {saveStatus.message && (
        <Alert variant={saveStatus.type} className="mt-2">
          {saveStatus.message}
        </Alert>
      )}

      {/* --- KATEGORİLER & ÜRÜNLER (Responsive İyileştirmelerle) --- */}
      <Card className="mb-4">
        {/* ... Card.Header ve diğer statik formlarınız buradaydı ... */}
        <Card.Body>
          {homePageData.categories && homePageData.categories.map((category) => (
            <div key={category.category_key} className="mb-5 p-3 border rounded">
              {/* Kategori başlığı ve butonları */}
              <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center mb-3">
                 <h5 className="mb-2 mb-sm-0">{category.title}</h5>
                 {/* ... responsive butonlar ... */}
              </div>
              <Row>
                {/* Ürün kartları (Mobil için daha iyi görünüm) */}
                {category.products.map((product) => (
                  <Col xs={6} sm={4} lg={3} key={product._id} className="mb-4">
                    {/* ... Sizin ürün kartı kodunuz ... */}
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Card.Body>
      </Card>
      
      {/* ... MODALLAR (Değişiklik yok) ... */}
    </Container>
  );
};

export default AdminHome;