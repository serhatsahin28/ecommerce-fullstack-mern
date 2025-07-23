import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaImage, FaEdit } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

// Sunucu adresi - resim yollarını tamamlamak için
const SERVER_URL = 'http://localhost:5000';

// Resim yolunu tamamlama yardımcı fonksiyonu
const getFullImagePath = (path) => {
  if (!path) return '/images/placeholder-slide.jpg'; // Varsayılan resim yolu
  if (path.startsWith('http') || path.startsWith('/images/')) {
    return path;
  }
  return `${SERVER_URL}${path}`;
};


// Anasayfa verisi boş gelirse diye yeni veri yapısına uygun varsayılan yapı
const initialData = {
  page_title: { tr: '', en: '' },
  page_subtitle: { tr: '', en: '' },
  heroSlides: [],
  banner: {
    // image alanı kaldırıldı
    title: { tr: '', en: '' },
    desc: { tr: '', en: '' },
    cta: { tr: '', en: '' },
  },
  advantages: [],
  stats: [],
  categories: [],
};

// Yeni bir slayt/avantaj/istatistik eklerken kullanılacak şablonlar
const newSlideTemplate = {
  slider_id: '', // Modal açılırken uuidv4 ile atanacak
  image: '/images/placeholder-slide.jpg', // Varsayılan placeholder
  title: { tr: '', en: '' },
  subtitle: { tr: '', en: '' },
  cta: { tr: '', en: '' },
};
const newAdvantageTemplate = { icon: '✨', text: { tr: '', en: '' } };
const newStatTemplate = { value: '', desc: { tr: '', en: '' } };

const AdminHome = () => {
  // --- STATE YÖNETİMİ ---
  const [homePageData, setHomePageData] = useState(initialData);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ show: false, message: '', type: 'success' });
  const [currentLang, setCurrentLang] = useState('tr');

  // --- YENİ EKLENEN STATE'LER (MODAL İÇİN) ---
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null); // Düzenlenen veya yeni eklenen slaytı tutar
  const [isEditingSlide, setIsEditingSlide] = useState(false); // Modal'ın modunu belirler (ekleme/düzenleme)
  const [editingSlideIndex, setEditingSlideIndex] = useState(null); // Düzenlenen slaydın ana dizideki index'i

  // Diğer Modal Yönetimi
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState('');
  const [imageUploadContext, setImageUploadContext] = useState({ type: '', isModal: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState('');

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
        setError("Anasayfa verisi bulunamadı. Yeni bir veri yapısı oluşturuluyor.");
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
    // Göndermeden önce veriyi temizleyelim
    const dataToSend = JSON.parse(JSON.stringify(homePageData));

    // Backend'de CastError'a sebep olabilecek geçici frontend ID'lerini kaldıralım.
    if (dataToSend.heroSlides) {
      dataToSend.heroSlides.forEach(slide => {
        if (slide.slider_id) {
          delete slide.slider_id;
        }
      });
    }

    try {
      const response = await fetch(`http://localhost:5000/admin/home/${homePageData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Bir hata oluştu.');

      if (result.updatedData) {
        setHomePageData(result.updatedData);
      }

      setStatusMessage({ show: true, message: 'Veriler başarıyla kaydedildi!', type: 'success' });
    } catch (err) {
      console.error("Save error:", err);
      setStatusMessage({ show: true, message: 'Kaydetme hatası: ' + err.message, type: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  // --- SLAYT MODAL YÖNETİMİ ---

  // Yeni Slayt Ekleme Modalı'nı açar
  const handleOpenNewSlideModal = () => {
    setCurrentSlide({ ...newSlideTemplate, slider_id: uuidv4() }); // Boş şablon ve geçici ID
    setIsEditingSlide(false);
    setEditingSlideIndex(null);
    setShowSlideModal(true);
  };

  // Mevcut Slaytı Düzenleme Modalı'nı açar
  const handleOpenEditSlideModal = (slide, index) => {
    setCurrentSlide({ ...slide });
    setIsEditingSlide(true);
    setEditingSlideIndex(index); // Ana dizideki index'i sakla
    setShowSlideModal(true);
  };

  // Modal içindeki slayt bilgilerini günceller
  const handleSlideChange = (field, value, isMultiLang = false) => {
    setCurrentSlide(prev => {
      if (isMultiLang) {
        return {
          ...prev,
          [field]: { ...prev[field], [currentLang]: value }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Modal'daki "Değişiklikleri Kaydet" butonu
  const handleSaveSlide = () => {
    setHomePageData(prev => {
      const updatedSlides = [...(prev.heroSlides || [])];
      if (isEditingSlide && editingSlideIndex !== null) {
        // Düzenleme modunda: slaytı dizide güncelle
        updatedSlides[editingSlideIndex] = currentSlide;
      } else {
        // Ekleme modunda: yeni slaytı dizinin sonuna ekle
        updatedSlides.push(currentSlide);
      }
      return { ...prev, heroSlides: updatedSlides };
    });

    setShowSlideModal(false); // Modalı kapat
    setCurrentSlide(null);      // Geçici slayt verisini temizle
    setEditingSlideIndex(null); // Index'i temizle
  };


  // --- RESIM YÖNETİMİ ---
  const openImageModal = (context) => {
    setImageUploadContext(context);
    setShowImageModal(true);
    setImagePreview('');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${SERVER_URL}/admin/home/upload-image`, { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Resim yüklenemedi.');

      setImagePreview(result.imagePath); // Backend'den gelen yolu önizlemeye ata

    } catch (err) {
      setStatusMessage({ show: true, message: 'Resim yükleme hatası: ' + err.message, type: 'danger' });
    }
  };

  const saveImage = () => {
    if (!imagePreview) return;
    const { type, isModal } = imageUploadContext;

    // Sadece slaytlar için çalışacak şekilde basitleştirildi
    if (type === 'heroSlides' && isModal) {
      handleSlideChange('image', imagePreview);
    }

    setShowImageModal(false);
    setImagePreview('');
  };


  // --- DİZİ İŞLEMLERİ (Avantaj, İstatistik vb.) ---
  const handleMultiLangChange = (field, subField, value) => {
      setHomePageData(prev => ({
        ...prev,
        banner: {
          ...prev.banner,
          [subField]: { ...prev.banner[subField], [currentLang]: value }
        }
    }));
  };

  const handleArrayChange = (arrayName, index, field, value, isMultiLang = false) => {
    setHomePageData(prev => {
        const newArray = [...prev[arrayName]];
        if (isMultiLang) {
            newArray[index] = { ...newArray[index], [field]: { ...newArray[index][field], [currentLang]: value } };
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

  const deleteArrayItem = (arrayName, index) => {
    if (!window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;
    setHomePageData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };
  
  // --- KATEGORİ ÜRÜN İŞLEMLERİ ---
  const removeProductFromCategory = (categoryKey, productId) => {
    setHomePageData(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.category_key === categoryKey
          ? { ...cat, products: (cat.products || []).filter(p => p.product_id !== productId) }
          : cat
      ),
    }));
  };

  const openAddProductModal = (key) => {
    setCurrentCategoryKey(key);
    setShowProductModal(true);
    setSearchTerm('');
  };

  const addProductToCategory = (product) => {
    const productForHomePage = {
        product_id: product._id.toString(),
        stock: product.stock,
        price: product.price,
        rating: product.rating,
        image: product.image,
        images: product.images,
        translations: product.translations
    };
    setHomePageData(prev => {
        const newCategories = prev.categories.map(cat => {
            if (cat.category_key === currentCategoryKey) {
                if ((cat.products || []).some(p => p.product_id === product._id)) {
                    alert("Bu ürün zaten kategoride mevcut.");
                    return cat;
                }
                return { ...cat, products: [...(cat.products || []), productForHomePage] };
            }
            return cat;
        });
        return { ...prev, categories: newCategories };
    });
    setShowProductModal(false);
  };
  
  const getAvailableProducts = () => {
    if (!currentCategoryKey) return [];
    const currentCategory = homePageData.categories.find(c => c.category_key === currentCategoryKey);
    if (!currentCategory) return [];
    const currentProductIds = new Set((currentCategory.products || []).map(p => p.product_id));
    return allProducts
      .filter(p => p.category_key === currentCategoryKey && !currentProductIds.has(p._id))
      .filter(p => (p.translations?.tr?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  };
  

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /><h4>Yükleniyor...</h4></Container>;
  if (error && !homePageData._id) return <Container className="mt-5"><Alert variant="danger">Hata: {error}</Alert></Container>;

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
      {statusMessage.show && <Alert variant={statusMessage.type} onClose={() => setStatusMessage({ show: false })} dismissible>{statusMessage.message}</Alert>}

      <Row>
        <Col xl={8} className="mb-4">
          {/* GENEL AYARLAR KARTI */}
          <Card className="mb-4">
            <Card.Header as="h5">Genel Sayfa Metinleri ({currentLang.toUpperCase()})</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Sayfa Başlığı</Form.Label>
                <Form.Control type="text" value={homePageData.page_title?.[currentLang] || ''} onChange={e => handleMultiLangChange('page_title', null, e.target.value, true)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Sayfa Alt Başlığı</Form.Label>
                <Form.Control as="textarea" rows={2} value={homePageData.page_subtitle?.[currentLang] || ''} onChange={e => handleMultiLangChange('page_subtitle', null, e.target.value, true)} />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* SLIDER YÖNETİMİ KARTI */}
          <Card className="mb-4">
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
              <span>Hero Slider</span>
              <Button variant="success" size="sm" onClick={handleOpenNewSlideModal}>
                <FaPlus /> Yeni Slayt Ekle
              </Button>
            </Card.Header>
            <ListGroup variant="flush">
              {homePageData.heroSlides?.length === 0 && <ListGroup.Item>Henüz slayt eklenmemiş.</ListGroup.Item>}
              {homePageData.heroSlides?.map((slide, index) => (
                <ListGroup.Item key={slide.slider_id || slide._id || index} className="d-flex justify-content-between align-items-center p-3">
                  <div className="d-flex align-items-center">
                    <img src={getFullImagePath(slide.image)} alt="Slide" className="img-thumbnail me-3" style={{ width: '80px', height: '50px', objectFit: 'cover' }} />
                    <div>
                      <h6 className="mb-0">{slide.title?.[currentLang] || 'Başlıksız Slayt'}</h6>
                      <small className="text-muted">{slide.subtitle?.[currentLang] || 'Alt başlık yok'}</small>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEditSlideModal(slide, index)}>
                      <FaEdit /> Düzenle
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => deleteArrayItem('heroSlides', index)}>
                      <FaTrash />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
          
           {/* KATEGORİ VE ÜRÜN YÖNETİMİ */}
          <Card>
            <Card.Header as="h5">Anasayfa Kategorileri ve Ürünleri</Card.Header>
            <Card.Body>
              {homePageData.categories?.map((cat) => (
                <div key={cat.category_key} className="p-3 border rounded mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{cat.title?.[currentLang] || cat.category_key} <Badge pill bg="secondary">{cat.products?.length || 0} ürün</Badge></h6>
                    <Button variant="outline-primary" size="sm" onClick={() => openAddProductModal(cat.category_key)}><FaPlus /> Ürün Ekle</Button>
                  </div>
                  <Row>
                    {(cat.products || []).map(product => (
                      <Col key={`${cat.category_key}-${product.product_id}`} xs={6} md={4} lg={3} className="mb-2">
                        <Card className="h-100">
                          <Card.Img variant="top" src={getFullImagePath(product.image)} style={{ height: '80px', objectFit: 'cover' }} />
                          <Card.Body className="p-2 position-relative">
                            <Card.Title style={{ fontSize: '0.8rem', marginBottom: '25px' }}>
                              {product.translations?.tr?.name || 'İsimsiz Ürün'}
                            </Card.Title>
                            <Button
                              variant="danger"
                              size="sm"
                              className="position-absolute"
                              style={{ bottom: '5px', right: '5px' }}
                              onClick={() => removeProductFromCategory(cat.category_key, product.product_id)}
                            >
                              <FaTimes />
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          {/* BANNER KARTI (Resim alanı kaldırıldı) */}
          <Card className="mb-4">
            <Card.Header as="h5">Özel Banner ({currentLang.toUpperCase()})</Card.Header>
            <Card.Body>
              <Form.Group className="mb-2">
                <Form.Label>Başlık</Form.Label>
                <Form.Control size="sm" value={homePageData.banner?.title?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'title', e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Açıklama</Form.Label>
                <Form.Control size="sm" as="textarea" rows={2} value={homePageData.banner?.desc?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'desc', e.target.value)} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Buton Metni</Form.Label>
                <Form.Control size="sm" value={homePageData.banner?.cta?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'cta', e.target.value)} />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* AVANTAJLAR VE ISTATISTIKLER */}
          <Card className="mb-4">
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center"><span>Avantajlar</span><Button variant="success" size="sm" onClick={() => addArrayItem('advantages', newAdvantageTemplate)}><FaPlus /></Button></Card.Header>
            <ListGroup variant="flush">
              {homePageData.advantages?.map((item, index) => (
                <ListGroup.Item key={index}><InputGroup><Form.Control style={{ flex: '0 0 50px' }} placeholder="✨" value={item.icon || ''} onChange={e => handleArrayChange('advantages', index, 'icon', e.target.value)} /><Form.Control placeholder={`Metin (${currentLang.toUpperCase()})`} value={item.text?.[currentLang] || ''} onChange={e => handleArrayChange('advantages', index, 'text', e.target.value, true)} /><Button variant="outline-danger" onClick={() => deleteArrayItem('advantages', index)}><FaTrash /></Button></InputGroup></ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          <Card>
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center"><span>İstatistikler</span><Button variant="success" size="sm" onClick={() => addArrayItem('stats', newStatTemplate)}><FaPlus /></Button></Card.Header>
            <ListGroup variant="flush">
              {homePageData.stats?.map((item, index) => (
                <ListGroup.Item key={index}><InputGroup><Form.Control placeholder="Değer" value={item.value || ''} onChange={e => handleArrayChange('stats', index, 'value', e.target.value)} /><Form.Control placeholder={`Açıklama (${currentLang.toUpperCase()})`} value={item.desc?.[currentLang] || ''} onChange={e => handleArrayChange('stats', index, 'desc', e.target.value, true)} /><Button variant="outline-danger" onClick={() => deleteArrayItem('stats', index)}><FaTrash /></Button></InputGroup></ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* === MODALLAR === */}
      
      {/* Slayt Ekleme/Düzenleme Modalı */}
      <Modal show={showSlideModal} onHide={() => setShowSlideModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditingSlide ? 'Slaytı Düzenle' : 'Yeni Slayt Ekle'} ({currentLang.toUpperCase()})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSlide && (
            <Form>
                <Row>
                    <Col md={4}>
                        <Form.Label>Slayt Resmi</Form.Label>
                        <div className="text-center border p-2 rounded">
                            <img src={getFullImagePath(currentSlide.image)} alt="Slide Preview" className="img-fluid mb-2" />
                            <Button variant="outline-secondary" size="sm" className="w-100" onClick={() => openImageModal({type: 'heroSlides', isModal: true})}>
                               <FaImage /> Resmi Değiştir
                            </Button>
                        </div>
                    </Col>
                    <Col md={8}>
                        <Form.Group className="mb-3">
                            <Form.Label>Başlık</Form.Label>
                            <Form.Control type="text" placeholder="Slayt başlığı..." value={currentSlide.title[currentLang] || ''} onChange={(e) => handleSlideChange('title', e.target.value, true)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Alt Başlık</Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="Slayt için kısa açıklama..." value={currentSlide.subtitle[currentLang] || ''} onChange={(e) => handleSlideChange('subtitle', e.target.value, true)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Buton Metni</Form.Label>
                            <Form.Control type="text" placeholder="Örn: Şimdi İncele" value={currentSlide.cta[currentLang] || ''} onChange={(e) => handleSlideChange('cta', e.target.value, true)} />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSlideModal(false)}>İptal</Button>
          <Button variant="primary" onClick={handleSaveSlide}>
            <FaSave /> {isEditingSlide ? 'Değişiklikleri Kaydet' : 'Slaytı Ekle'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Ürün Ekleme Modalı */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Kategoriye Ürün Ekle</Modal.Title></Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3"><InputGroup.Text><FaSearch /></InputGroup.Text><FormControl placeholder="Aramak için ürün adı yazın..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></InputGroup>
          <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {getAvailableProducts().length === 0 && <ListGroup.Item disabled>Eklenecek uygun ürün bulunamadı.</ListGroup.Item>}
            {getAvailableProducts().map(p => (<ListGroup.Item key={p._id} action onClick={() => addProductToCategory(p)} className="d-flex justify-content-between align-items-center"><span><img src={getFullImagePath(p.image)} alt={p.translations?.tr?.name} width="40" height="40" style={{ objectFit: 'cover', marginRight: '10px' }} />{p.translations?.tr?.name || 'İsimsiz'}</span><Badge bg="primary" pill>{p.price} TL</Badge></ListGroup.Item>))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      {/* Resim Yükleme Modalı */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="md">
        <Modal.Header closeButton><Modal.Title>Resim Yükle</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Bilgisayarınızdan bir resim dosyası seçin</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
          </Form.Group>
          {imagePreview && <div className="text-center mb-3"><img src={getFullImagePath(imagePreview)} alt="Önizleme" className="img-fluid" style={{ maxHeight: '200px' }} /></div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>İptal</Button>
          <Button variant="primary" onClick={saveImage} disabled={!imagePreview}><FaSave /> Seçili Resmi Kullan</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default AdminHome;