import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaImage, FaUpload } from 'react-icons/fa';

// Sabitler
const initialData = {
  page_title: { tr: '', en: '' },
  page_subtitle: { tr: '', en: '' },
  view_all: { tr: '', en: '' },
  featured_products: { tr: '', en: '' },
  best_sellers: { tr: '', en: '' },
  loading: { tr: '', en: '' },
  heroSlides: [],
  banner: { title: { tr: '', en: '' }, desc: { tr: '', en: '' }, cta: { tr: '', en: '' }, cta_link: { tr: '', en: '' } },
  advantages: [],
  stats: [],
  categories: [],
};

const newSlideTemplate = { image: '', title: { tr: '', en: '' }, subtitle: { tr: '', en: '' }, cta: { tr: '', en: '' }, cta_link: { tr: '', en: '' } };
const newAdvantageTemplate = { icon: '✨', text: { tr: '', en: '' } };
const newStatTemplate = { value: '', desc: { tr: '', en: '' } };


const AdminHome = () => {
  // --- STATE YÖNETİMİ ---
  const [homePageData, setHomePageData] = useState(initialData);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ show: false, message: '', type: 'info' });
  const [currentLang, setCurrentLang] = useState('tr');

  // Modal Yönetimi
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentImageField, setCurrentImageField] = useState({ type: '', sliderId: null });

  // --- VERİ ÇEKME ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/admin/homeList');
      if (!response.ok) throw new Error('Sunucu verileri alınamadı.');
      const result = await response.json();

      if (result.homeData && result.homeData.length > 0) {
        setHomePageData({ ...initialData, ...result.homeData[0] });
      } else {
        setHomePageData(initialData);
        setError("Anasayfa verisi bulunamadı.");
      }
      setAllProducts(result.productData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- GENEL KAYDETME FONKSİYONU ---
  const handleSave = async () => {
    if (!homePageData._id) {
      alert("Hata: Kaydedilecek veri ID'si yok.");
      return;
    }
    setIsSaving(true);
    setStatusMessage({ show: false, message: '' });
    try {
      const response = await fetch(`http://localhost:5000/admin/home/${homePageData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homePageData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Kaydetme sırasında bir hata oluştu.');
      setStatusMessage({ show: true, message: result.message, type: 'success' });
    } catch (err) {
      setStatusMessage({ show: true, message: err.message, type: 'danger' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage({ show: false, message: '' }), 4000);
    }
  };

  // --- TEK ADIMLI, ID TABANLI RESİM YÖNETİMİ ---
  const openImageModal = (type, sliderId) => {
    if (!sliderId) {
      alert("Hata: Slayt ID'si bulunamadı! Lütfen tüm değişiklikleri kaydedip sayfayı yenileyin.");
      return;
    }
    setCurrentImageField({ type, sliderId });
    setShowImageModal(true);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const { sliderId } = currentImageField;
    if (!sliderId) {
      setStatusMessage({ show: true, message: 'Hata: Güncellenecek slayt IDsi bilinmiyor.', type: 'danger' });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('sliderId', sliderId);

    setStatusMessage({ show: true, message: 'Resim yükleniyor...', type: 'info' });
    try {
      const response = await fetch(`http://localhost:5000/admin/home/${homePageData._id}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setHomePageData(prev => {
          const updatedSlides = prev.heroSlides.map(slide => {
            const currentSlideId = typeof slide.slider_id === 'object' ? slide.slider_id.$oid : slide.slider_id;
            if (currentSlideId === result.sliderId) {
              return { ...slide, image: result.imagePath };
            }
            return slide;
          });
          return { ...prev, heroSlides: updatedSlides };
        });

        setStatusMessage({ show: true, message: 'Resim başarıyla yüklendi ve kaydedildi!', type: 'success' });
        setShowImageModal(false);
      } else {
        throw new Error(result.message || 'Sunucu hatası.');
      }
    } catch (err) {
      setStatusMessage({ show: true, message: `Resim yükleme hatası: ${err.message}`, type: 'danger' });
    } finally {
      event.target.value = null;
      setTimeout(() => setStatusMessage({ show: false, message: '' }), 4000);
    }
  };

  // --- DİĞER YARDIMCI FONKSİYONLAR ---
  const handleMultiLangChange = (field, subField, value) => {
    setHomePageData(prev => {
      const fieldData = subField ? { ...prev[field][subField], [currentLang]: value } : { ...prev[field], [currentLang]: value };
      const mainFieldData = subField ? { ...prev[field], [subField]: fieldData } : fieldData;
      return { ...prev, [field]: mainFieldData };
    });
  };

  const handleArrayChange = (arrayName, index, field, value, isMultiLang = false) => {
    setHomePageData(prev => {
      const newArray = [...prev[arrayName]];
      if (isMultiLang) {
        newArray[index][field] = { ...newArray[index][field], [currentLang]: value };
      } else {
        newArray[index] = { ...newArray[index], [field]: value };
      }
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName, newItemTemplate) => {
    setHomePageData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), newItemTemplate]
    }));
  };

  const deleteArrayItem = (arrayName, idToDelete) => {
    if (!window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;
    setHomePageData(prev => {
      const filteredArray = prev[arrayName].filter(item => {
        // Hem yeni eklenen (henüz ID'si olmayan) hem de mevcut ID'li öğeleri handle etmek için
        if (!item.slider_id) return true; // ID'si yoksa silme, belki başka bir mantık gerekebilir.
        const itemId = typeof item.slider_id === 'object' ? item.slider_id.$oid : item.slider_id;
        return itemId !== idToDelete;
      });
      return { ...prev, [arrayName]: filteredArray };
    });
  };

  const removeProductFromCategory = (categoryKey, productId) => { /* ...sizin eski kodunuz... */ };
  const openAddProductModal = (key) => { /* ...sizin eski kodunuz... */ };
  const addProductToCategory = (product) => { /* ...sizin eski kodunuz... */ };
  const getAvailableProducts = () => { /* ...sizin eski kodunuz... */ };

  // --- RENDER ---
  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /><h4>Yükleniyor...</h4></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">Hata: {error}</Alert></Container>;

  return (
    <Container fluid className="p-3 p-md-4">
      {/* ÜST BAR */}
      <Row className="mb-4 align-items-center bg-light p-3 rounded sticky-top shadow-sm" style={{ top: '60px', zIndex: 1020 }}>
        <Col><h2 className="mb-0">Anasayfa Yönetimi</h2></Col>
        <Col xs="auto">
          <ButtonGroup>
            <Button variant={currentLang === 'tr' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('tr')}>TR 🇹🇷</Button>
            <Button variant={currentLang === 'en' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('en')}>EN 🇬🇧</Button>
          </ButtonGroup>
        </Col>
        <Col xs="auto">
          <Button variant="success" onClick={handleSave} disabled={isSaving}>
            <FaSave className="me-2" />
            {isSaving ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}
          </Button> 
        </Col>
      </Row>

      {/* DURUM BİLDİRİM MESAJI */}
      {statusMessage.show && (
        <Alert variant={statusMessage.type} onClose={() => setStatusMessage({ show: false })} dismissible>
          {statusMessage.message}
        </Alert>
      )}

      <Row>
        <Col xl={8} className="mb-4">
          {/* ... Genel Sayfa Metinleri Kartı aynı kalacak ... */}

          {/* SLIDER YÖNETİMİ KARTI */}
          <Card className="mb-4">
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
              <span>Hero Slider</span>
              <Button variant="success" size="sm" onClick={() => addArrayItem('heroSlides', newSlideTemplate)}><FaPlus /> Yeni Slayt Ekle</Button>
            </Card.Header>
            <ListGroup variant="flush">
              {homePageData.heroSlides?.map((slide, index) => {
                const sliderId = slide.slider_id ? (typeof slide.slider_id === 'object' ? slide.slider_id.$oid : slide.slider_id) : null;
                
                return (
                  <ListGroup.Item key={sliderId || `slide-${index}`} className="p-3">
                    <Row>
                      <Col md={10}>
                        {/* Text inputları hala index ile çalışabilir, çünkü tüm döküman tek seferde kaydediliyor */}
                        <InputGroup className="mb-2"><InputGroup.Text style={{width: '100px'}}>Başlık ({currentLang.toUpperCase()})</InputGroup.Text><FormControl value={slide.title?.[currentLang] || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'title', e.target.value, true)} /></InputGroup>
                        <InputGroup className="mb-2"><InputGroup.Text style={{width: '100px'}}>Alt Başlık</InputGroup.Text><FormControl value={slide.subtitle?.[currentLang] || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'subtitle', e.target.value, true)} /></InputGroup>
                        <InputGroup className="mb-2">
                          <InputGroup.Text style={{ width: '100px' }}>Resim</InputGroup.Text>
                          <Form.Control size="sm" value={slide.image || ''} readOnly />
                          <Button variant="outline-secondary" onClick={() => openImageModal('heroSlides', sliderId)} disabled={!sliderId}><FaImage /> Resim Değiştir</Button>
                        </InputGroup>
                        <InputGroup className="mb-2"><InputGroup.Text style={{width: '100px'}}>Buton Yazısı</InputGroup.Text><FormControl size="sm" value={slide.cta?.[currentLang] || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'cta', e.target.value, true)} /></InputGroup>
                        <InputGroup><InputGroup.Text style={{width: '100px'}}>Buton Link</InputGroup.Text><FormControl size="sm" value={slide.cta_link?.[currentLang] || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'cta_link', e.target.value, true)} /></InputGroup>
                      </Col>
                      <Col md={2} className="d-flex align-items-center justify-content-center flex-column">
                        {slide.image && <img src={slide.image} alt="Slide" className="img-thumbnail mb-2" style={{width: '60px', height: '60px', objectFit: 'cover'}} />}
                        <Button variant="outline-danger" size="sm" onClick={() => deleteArrayItem('heroSlides', sliderId)} disabled={!sliderId}><FaTrash /></Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card>
          
          {/* ... Diğer kartlar (Kategori, Banner, Avantajlar, vs.) aynı kalacak ... */}

        </Col>

        <Col xl={4}>
          {/* ... Sağdaki sütun aynı kalacak ... */}
        </Col>
      </Row>

      {/* ... Ürün Ekleme Modalı aynı kalacak ... */}
      
      {/* SADELEŞTİRİLMİŞ RESİM YÜKLEME MODALI */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Slayt Resmini Değiştir</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <p>Lütfen yeni resmi seçin. Seçiminiz anında yüklenip kaydedilecektir.</p>
          <Form.Group>
            <Form.Label htmlFor="image-upload-input" className="btn btn-primary w-100">
              <FaUpload className="me-2" /> Resim Dosyası Seç
            </Form.Label>
            <Form.Control 
              id="image-upload-input"
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              style={{ display: 'none' }} 
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>Kapat</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminHome;