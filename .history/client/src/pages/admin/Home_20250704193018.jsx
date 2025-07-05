import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, Modal, 
  InputGroup, Tabs, Tab, FormControl, Image, Alert, Spinner
} from 'react-bootstrap';
import { FaStar, FaTrash, FaEdit, FaPlus, FaSync, FaSearch } from 'react-icons/fa'; // FaSync ikonu eklendi

// Mevcut kodunuzdaki gibi başlangıç verisi
const initialData = {
  page_language: 'tr',
  page_title: '',
  page_subtitle: '',
  // ...diğer alanlar
  heroSlides: [],
  banner: { title: '', desc: '', cta: '', cta_link: '' },
  advantages: [],
  stats: [],
  categories: [],
};

const AdminHome = () => {
  // --- MEVCUT STATE'LER ---
  const [homePageData, setHomePageData] = useState(initialData);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal ve düzenleme state'leri (değişiklik yok)
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- YENİ EKLENEN STATE'LER (Veri Yenileme için) ---
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState({ message: '', type: '' }); // 'success' veya 'danger'

  // --- VERİ ÇEKME VE YENİLEME FONKSİYONLARI ---

  // Sayfa ilk yüklendiğinde verileri çeken fonksiyon (Mevcut)
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Not: Bu endpoint'i mevcut kodunuzdan aldım. GET isteği olduğunu varsayıyorum.
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
      console.error('İlk veri çekme hatası:', error);
      setError('Veriler yüklenirken bir hata oluştu. Sunucu bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // **İSTEĞİNİZE GÖRE EKLENEN YENİ GÜNCELLEME/YENİLEME FONKSİYONU**
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    setRefreshStatus({ message: '', type: '' }); // Önceki mesajları temizle
    try {
      // Sizin belirttiğiniz endpoint ve metoda göre PUT isteği atıyoruz.
      const response = await fetch('http://localhost:5000/admin/updateHomeList', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // PUT isteği için body gerekliyse buraya ekleyebilirsiniz, 
        // ancak sizin fonksiyonunuz body beklemiyor gibi duruyor.
        // body: JSON.stringify({ action: 'refresh' }) 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP hatası! Durum: ${response.status}`);
      }

      const result = await response.json();
      
      // Gelen yeni verilerle state'i güncelliyoruz
      if (result.homeData && result.homeData.length > 0) {
        setHomePageData(result.homeData[0]);
      }
      if (result.productData) {
        setAllProducts(result.productData);
      }

      setRefreshStatus({ message: 'Veriler başarıyla yenilendi!', type: 'success' });

    } catch (error) {
      console.error('Veri yenileme hatası:', error);
      setRefreshStatus({ message: error.message || 'Yenileme sırasında bir hata oluştu.', type: 'danger' });
    } finally {
      setIsRefreshing(false);
      // 3 saniye sonra bildirim mesajını kaldır
      setTimeout(() => setRefreshStatus({ message: '', type: '' }), 3000);
    }
  };


  // Değişiklikleri kaydetme fonksiyonu (Mevcut - Değişiklik yok)
  const saveToDatabase = async () => {
    // ... Bu fonksiyon olduğu gibi kalabilir.
  };

  // Diğer tüm yardımcı fonksiyonlarınız (handlePageTitleChange, deleteProduct vb.) burada yer alıyor
  // ve onlarda bir değişiklik yapmaya gerek yok.
  // ... (Mevcut kodunuzdaki diğer fonksiyonlar) ...
  const getAvailableProducts = () => {
    if (!currentCategoryKey) return [];
    
    const currentCategoryProducts = homePageData.categories.find(c => c.category_key === currentCategoryKey)?.products || [];
    const currentProductIds = new Set(currentCategoryProducts.map(p => p._id));

    return allProducts.filter(p => 
      p.category_key === currentCategoryKey &&
      !currentProductIds.has(p._id) && 
      (p.translations?.tr?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
   const handleAddProductToCategory = (productToAdd) => {
    const targetCategory = homePageData.categories.find(c => c.category_key === currentCategoryKey);

    if (targetCategory.products.length >= 4) {
      alert('Bu kategoriye en fazla 4 ürün ekleyebilirsiniz.');
      return;
    }

    setHomePageData(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.category_key === currentCategoryKey
          ? { ...cat, products: [...cat.products, productToAdd] }
          : cat
      )
    }));
    closeAddProductModal();
  };
    const openAddProductModal = (categoryKey) => {
    setCurrentCategoryKey(categoryKey);
    setShowAddProductModal(true);
    setSearchTerm(''); // Modalı her açtığında aramayı sıfırla
  };

  const closeAddProductModal = () => {
    setShowAddProductModal(false);
    setCurrentCategoryKey(null);
  };
  const deleteProduct = (id, categoryKey) => {
    if (!window.confirm('Ürünü anasayfadan kaldırmak istediğinizden emin misiniz?')) return;
    setHomePageData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => {
        if (cat.category_key === categoryKey) {
          return {
            ...cat,
            products: cat.products.filter((p) => p._id !== id),
          };
        }
        return cat;
      }),
    }));
  };
   const deleteCategory = (categoryKey) => {
    if (!window.confirm('Kategoriyi ve içindeki tüm ürünleri anasayfadan kaldırmak istediğinizden emin misiniz?')) return;
    
    setHomePageData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat.category_key !== categoryKey),
    }));
  };
    const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<FaStar key={i} color={i <= Math.round(rating) ? '#ffc107' : '#e4e5e9'} />);
    }
    return stars;
  };
  // --- RENDER KISMI ---

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="danger" />
        <h4 className="ms-3">Veriler Yükleniyor...</h4>
      </Container>
    );
  }

  if (error) {
    return <Container><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container fluid className="p-3 p-md-4">
      {/* ===== RESPONSIVE ÜST KISIM BAŞLANGIÇ ===== */}
      <Row className="mb-4 align-items-center">
        <Col xs={12} md="auto" className="flex-grow-1 mb-3 mb-md-0">
          <h2 className="mb-0 fw-bold text-danger">Admin Home Sayfası</h2>
        </Col>
        <Col xs={12} md="auto" className="d-flex gap-2 justify-content-start justify-content-md-end">
          <Button variant="info" onClick={handleRefreshData} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Yenileniyor...</span>
              </>
            ) : (
              <>
                <FaSync className="me-1" /> Verileri Yenile
              </>
            )}
          </Button>
          <Button variant="success" onClick={saveToDatabase}>
            Değişiklikleri Kaydet
          </Button>
        </Col>
      </Row>
      
      {/* Yenileme Durum Bildirimi */}
      {refreshStatus.message && (
        <Alert variant={refreshStatus.type} className="mt-2">
          {refreshStatus.message}
        </Alert>
      )}
      {/* ===== RESPONSIVE ÜST KISIM BİTİŞ ===== */}
      
      {/* Mevcut Diğer Form Alanlarınız (Slider, Banner vs.) buraya gelebilir */}

      {/* Kategoriler ve Ürünler */}
      <Card className="mb-4">
        <Card.Header as="h5">Anasayfa Kategorileri & Ürünleri</Card.Header>
        <Card.Body>
          {homePageData.categories.map((category) => (
            <div key={category.category_key} className="mb-5 p-3 border rounded">
              {/* ===== RESPONSIVE KATEGORİ BAŞLIĞI BAŞLANGIÇ ===== */}
              <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center mb-3">
                <h5 className="mb-2 mb-sm-0">{category.title}</h5>
                <div className="d-flex gap-2">
                  <Button variant="success" size="sm" onClick={() => openAddProductModal(category.category_key)}>
                    <FaPlus />
                    {/* Telefonda sadece ikon görünsün, büyük ekranda yazı da olsun */}
                    <span className="d-none d-md-inline ms-1">Ürün Ekle</span>
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => deleteCategory(category.category_key)}>
                    <FaTrash />
                    <span className="d-none d-md-inline ms-1">Kategoriyi Kaldır</span>
                  </Button>
                </div>
              </div>
              {/* ===== RESPONSIVE KATEGORİ BAŞLIĞI BİTİŞ ===== */}
              
              <Row>
                {category.products.map((product) => (
                  // ===== RESPONSIVE ÜRÜN KARTI SÜTUNU =====
                  // xs: Telefonda 2'li, sm: Tablette 3'lü, lg: Geniş ekranda 4'lü gösterim
                  <Col xs={6} sm={4} lg={3} key={product._id} className="mb-4">
                    <Card className="h-100">
                      <Card.Img variant="top" src={product.image || '/images/placeholder.png'} style={{ height: '150px', objectFit: 'cover' }} />
                      <Card.Body className="d-flex flex-column p-2 p-md-3">
                        <Card.Title as="h6" className="fs-6 flex-grow-1">{product.translations?.tr?.name || 'İsimsiz Ürün'}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{product.price} ₺</Card.Subtitle>
                        <div className="mb-2">{renderStars(product.rating)}</div>
                        <div className="mt-auto">
                          <Button variant="outline-danger" size="sm" className="w-100" onClick={() => deleteProduct(product._id, category.category_key)}>
                            <FaTrash /> <span className="d-none d-lg-inline">Kaldır</span>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
                 {category.products.length === 0 && (
                    <Col>
                        <p className="text-muted">Bu kategoride gösterilecek ürün bulunmuyor.</p>
                    </Col>
                 )}
              </Row>
            </div>
          ))}
        </Card.Body>
      </Card>
      
      {/* Ürün Seçme Modalı (Responsive iyileştirme eklendi) */}
      <Modal show={showAddProductModal} onHide={closeAddProductModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Kategoriye Ürün Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <FormControl placeholder="Ürün adı ile ara..." onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
          <hr />
          <Row style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {getAvailableProducts().length > 0 ? (
              getAvailableProducts().map(product => (
                // Modal içinde de responsive sütunlar kullanalım
                <Col xs={6} md={4} lg={3} key={product._id} className="mb-3">
                  <Card className="h-100 product-select-card" onClick={() => handleAddProductToCategory(product)} style={{ cursor: 'pointer' }}>
                    <Card.Img variant="top" src={product.image || '/images/placeholder.png'} style={{ height: '120px', objectFit: 'cover' }} />
                    <Card.Body className="p-2 text-center">
                      <Card.Title style={{ fontSize: '0.9rem' }}>{product.translations?.tr?.name}</Card.Title>
                      <Card.Text className="fw-bold text-danger">{product.price} ₺</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col><p className="text-muted text-center">Bu kategori için uygun ürün bulunamadı veya tümü zaten eklendi.</p></Col>
            )}
          </Row>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default AdminHome;