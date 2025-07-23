import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, Modal, 
  InputGroup, Tabs, Tab, FormControl, Image, Alert, Spinner
} from 'react-bootstrap';
import { FaStar, FaTrash, FaEdit, FaPlus, FaMinus, FaSearch } from 'react-icons/fa';

// MongoDB'den gelen veri yapısına uygun fallback initial data
const initialData = {
  page_language: 'tr',
  page_title: '',
  page_subtitle: '',
  view_all: 'Tümünü Gör',
  featured_products: 'Öne Çıkan Ürünler',
  best_sellers: 'Çok Satanlar',
  loading: 'Yükleniyor...',
  heroSlides: [],
  banner: { title: '', desc: '', cta: '', cta_link: '' },
  advantages: [],
  stats: [],
  categories: [],
};

const AdminHome = () => {
  const [homePageData, setHomePageData] = useState(initialData);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editSlideIndex, setEditSlideIndex] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editAdvantage, setEditAdvantage] = useState(null);
  const [showAdvantageModal, setShowAdvantageModal] = useState(false);
  const [editStat, setEditStat] = useState(null);
  const [showStatModal, setShowStatModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // YENİ EKLENEN STATE'LER
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // MongoDB'den veri çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Backend'den hem anasayfa hem de tüm ürün verilerini çekiyoruz
        const response = await fetch('http://localhost:5000/admin/homeList');
        if (!response.ok) {
          throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }
        const result = await response.json();

        // homeData'nın bir dizi olduğunu varsayarak ilk elemanı alıyoruz
        if (result.homeData && result.homeData.length > 0) {
          setHomePageData(result.homeData[0]);
        } else {
          console.warn("Backend'den anasayfa verisi gelmedi, başlangıç verisi kullanılıyor.");
          setHomePageData(initialData);
        }

        if (result.productData) {
          setAllProducts(result.productData);
        }
        
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen backend sunucusunun çalıştığından emin olun.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // MongoDB'ye veri güncelleme
  const saveToDatabase = async () => {
    try {
      // Normalde homePageData._id ile PUT isteği atılır
      const response = await fetch(`/api/admin/home/${homePageData._id}`, { // Örnek endpoint
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homePageData),
      });
      
      if (response.ok) {
        alert('Başarıyla güncellendi!');
      } else {
        alert('Güncelleme hatası!');
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Kaydetme sırasında bir sunucu hatası oluştu.');
    }
  };

  // --- YENİ FONKSİYONLAR ---

  const openAddProductModal = (categoryKey) => {
    setCurrentCategoryKey(categoryKey);
    setShowAddProductModal(true);
    setSearchTerm(''); // Modalı her açtığında aramayı sıfırla
  };

  const closeAddProductModal = () => {
    setShowAddProductModal(false);
    setCurrentCategoryKey(null);
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

  // Modal içinde gösterilecek filtrelenmiş ürünler
  const getAvailableProducts = () => {
    if (!currentCategoryKey) return [];
    
    const currentCategoryProducts = homePageData.categories.find(c => c.category_key === currentCategoryKey)?.products || [];
    const currentProductIds = new Set(currentCategoryProducts.map(p => p._id));

    return allProducts.filter(p => 
      p.category_key === currentCategoryKey && // Doğru kategori
      !currentProductIds.has(p._id) && // Henüz eklenmemiş
      (p.translations?.tr?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) // Arama terimiyle eşleşen
    );
  };

  // --- MEVCUT FONKSİYONLARIN GÜNCELLENMESİ ---

  // Sayfa başlığı değişikliği
  const handlePageTitleChange = (e) => {
    setHomePageData((prev) => ({ ...prev, page_title: e.target.value }));
  };

  // Sayfa alt başlık değişikliği
  const handlePageSubtitleChange = (e) => {
    setHomePageData((prev) => ({ ...prev, page_subtitle: e.target.value }));
  };

  // Banner güncelleme
  const handleBannerChange = (field, value) => {
    setHomePageData((prev) => ({
      ...prev,
      banner: { ...prev.banner, [field]: value },
    }));
  };

  // Slider aç-kapat
  const openEditSlide = (index) => setEditSlideIndex(index);
  const closeEditSlide = () => setEditSlideIndex(null);

  // Slider güncelleme
  const handleSlideChange = (field, value) => {
    setHomePageData((prev) => {
      const slides = [...prev.heroSlides];
      slides[editSlideIndex] = { ...slides[editSlideIndex], [field]: value };
      return { ...prev, heroSlides: slides };
    });
  };

  // Yeni slider ekle
  const addNewSlide = () => {
    setHomePageData((prev) => ({
      ...prev,
      heroSlides: [
        ...prev.heroSlides,
        { image: '', title: '', subtitle: '', cta: '', cta_link: '' },
      ],
    }));
    setEditSlideIndex(homePageData.heroSlides.length);
  };

  // Slider sil
  const deleteSlide = (index) => {
    if (!window.confirm('Bu slaydı silmek istediğinizden emin misiniz?')) return;
    
    setHomePageData((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== index)
    }));
    
    if (editSlideIndex === index) closeEditSlide();
  };
  
  // Ürün sil
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
  
  // Kategori sil
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
  
  // Diğer tüm fonksiyonlar (openEditProduct, saveProduct, vs.) `homePageData` ve `setHomePageData` kullanacak şekilde güncellenmelidir.
  // Bu örnekte, bu fonksiyonların doğru çalıştığı varsayılmıştır. Odak noktası ürün ekleme özelliğidir.

  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-bold text-danger">Admin Home Sayfası</h2>
      
      <div className="d-flex justify-content-end mb-4">
        <Button variant="success" onClick={saveToDatabase}>
          Tüm Değişiklikleri Kaydet
        </Button>
      </div>

      {/* Sayfa Başlığı ve diğer formlar burada... (kodun geri kalanı aynı) */}
      
      {/* Kategoriler ve Ürünler */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Anasayfa Kategorileri & Ürünleri</span>
          {/* Yeni kategori ekleme butonu burada olabilir */}
        </Card.Header>
        <Card.Body>
          {homePageData.categories.map((category) => (
            <div key={category.category_key} className="mb-5 p-3 border rounded">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">{category.title}</h5>
                <div>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => openAddProductModal(category.category_key)}
                    className="me-2"
                  >
                    <FaPlus /> Ürün Ekle
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => deleteCategory(category.category_key)}
                  >
                    <FaTrash /> Kategoriyi Kaldır
                  </Button>
                </div>
              </div>
              <Row>
                {category.products.map((product) => (
                  <Col md={3} key={product._id} className="mb-3">
                    <Card className="h-100">
                      <Card.Img
                        variant="top"
                        src={product.image || '/images/placeholder.png'}
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="fs-6">{product.translations.tr.name}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                          {product.price} ₺
                        </Card.Subtitle>
                        <div className="mb-2">{renderStars(product.rating)}</div>
                        <div className="mt-auto">
                          {/* Ürün düzenleme butonu gelecekte eklenebilir */}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteProduct(product._id, category.category_key)}
                          >
                            <FaTrash /> Kaldır
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
      
      {/* --- YENİ EKLENEN ÜRÜN SEÇME MODALI --- */}
      <Modal show={showAddProductModal} onHide={closeAddProductModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Kategoriye Ürün Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <FormControl
              placeholder="Ürün adı ile ara..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <hr />
          <Row style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {getAvailableProducts().length > 0 ? (
              getAvailableProducts().map(product => (
                <Col md={4} lg={3} key={product._id} className="mb-3">
                  <Card 
                    className="h-100 product-select-card" 
                    onClick={() => handleAddProductToCategory(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Img
                      variant="top"
                      src={product.image || '/images/placeholder.png'}
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                    <Card.Body className="p-2 text-center">
                      <Card.Title style={{ fontSize: '0.9rem' }}>
                        {product.translations.tr.name}
                      </Card.Title>
                      <Card.Text className="fw-bold text-danger">
                        {product.price} ₺
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-muted text-center">Bu kategori için uygun ürün bulunamadı veya tümü zaten eklendi.</p>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAddProductModal}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Diğer modallar (Slider, Avantaj vs.) burada... Kodun geri kalanını ekleyebilirsiniz. */}

    </Container>
  );
};

export default AdminHome;