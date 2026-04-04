import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaImage, FaEdit } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

// Sunucu adresi - resim yollarını tamamlamak için
const SERVER_URL = `${import.meta.env.VITE_API_URL}`;

// Resim yolunu tamamlama yardımcı fonksiyonu
const getFullImagePath = (path) => {
  if (!path) return '/images/placeholder-slide.jpg';

  // EĞER BLOB VEYA HTTP İLE BAŞLIYORSA (Önizleme veya Firebase) DİREKT DÖN
  if (typeof path === 'string' && (path.startsWith('blob:') || path.startsWith('http'))) {
    return path;
  }

  // Geri kalan server path işlemleri...
  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, ""); 
  const cleanPath = (typeof path === 'string' && path.startsWith('/')) ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Anasayfa verisi boş gelirse diye yeni veri yapısına uygun varsayılan yapı
const initialData = {
  page_title: { tr: '', en: '' },
  page_subtitle: { tr: '', en: '' },
  heroSlides: [],
  banner: {
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
  const [currentSlide, setCurrentSlide] = useState(null);
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState(null);

  // Diğer Modal Yönetimi
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState('');
  const [imageUploadContext, setImageUploadContext] = useState({ type: '', isModal: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [currentOldImageUrl, setCurrentOldImageUrl] = useState('');
  // --- VERİ ÇEKME ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/homeList`);
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

  // --- TÜM FONKSİYONLAR ---
  const handleSave = async () => {
    if (!homePageData._id) {
      alert("Hata: Kaydedilecek veri ID'si yok.");
      return;
    }
    setIsSaving(true);
    const dataToSend = JSON.parse(JSON.stringify(homePageData));

    if (dataToSend.heroSlides) {
      dataToSend.heroSlides.forEach(slide => {
        if (slide.slider_id) {
          delete slide.slider_id;
        }
      });
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL.replace(/\/$/, ""); // Sondaki slash'ı temizle
      const response = await fetch(`${apiUrl}/admin/home/${homePageData._id}`, {
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

  const handleOpenNewSlideModal = () => {
    setCurrentSlide({ ...newSlideTemplate, slider_id: uuidv4() });
    setIsEditingSlide(false);
    setEditingSlideIndex(null);
    setShowSlideModal(true);
  };

  const handleOpenEditSlideModal = (slide, index) => {
    setCurrentSlide({ ...slide });
    setIsEditingSlide(true);
    setEditingSlideIndex(index);
    setShowSlideModal(true);
  };

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

  const handleSaveSlide = () => {
    setHomePageData(prev => {
      const updatedSlides = [...(prev.heroSlides || [])];
      if (isEditingSlide && editingSlideIndex !== null) {
        updatedSlides[editingSlideIndex] = currentSlide;
      } else {
        updatedSlides.push(currentSlide);
      }
      return { ...prev, heroSlides: updatedSlides };
    });
    setShowSlideModal(false);
    setCurrentSlide(null);
    setEditingSlideIndex(null);
    // setTimeout(() => handleSave(), 200);

  };

  // Düzenle butonuna tıklandığında mevcut resmi sakla
  const openImageModal = (context, existingImageUrl = '') => {
    setImageUploadContext(context);
    setCurrentOldImageUrl(existingImageUrl); // Mevcut resmin URL'ini state'e at
    setShowImageModal(true);
    setImagePreview('');
  };
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Dosyayı sunucuya GÖNDERMİYORUZ. Sadece önizleme için yerel URL oluşturuyoruz.
  const previewUrl = URL.createObjectURL(file);
  
  // imagePreview state'ini bir OBJE yapıyoruz ki hem dosyayı hem linki tutalım
  setImagePreview({
    file: file,     // Asıl dosya (Upload ederken lazım)
    url: previewUrl // Önizleme linki (img src için)
  });
};

 const saveImage = () => {
  if (!imagePreview) return;
  const { type, isModal } = imageUploadContext;

  if (isModal && type === 'heroSlides') {
    setCurrentSlide(prev => ({
      ...prev,
      image: imagePreview.url, // Önizleme için blob linki
      rawFile: imagePreview.file // Arka planda bekleyen gerçek dosya
    }));
  }
  setShowImageModal(false);
  // Modal kapandıktan sonra temizle (Ama render'da sorun olmasın diye dikkat)
};

  const handleMultiLangChange = (field, subField, value, isTopLevel = false) => {
    if (isTopLevel) {
      setHomePageData(prev => ({
        ...prev,
        [field]: { ...prev[field], [currentLang]: value }
      }));
    } else {
      setHomePageData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subField]: { ...prev[field][subField], [currentLang]: value }
        }
      }));
    }
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

    const currentCategory = homePageData.categories.find(
      c => c.category_key === currentCategoryKey
    );
    if (!currentCategory) return [];

    const currentProductIds = new Set(
      (currentCategory.products || []).map(p => p.product_id)
    );

    return allProducts
      .filter(p =>
        p.category_key === currentCategoryKey &&
        !currentProductIds.has(p._id) &&
        Number(p.stock) > 0
      )
      .filter(p =>
        (p.translations?.tr?.name || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
  };


  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /><h4>Yükleniyor...</h4></Container>;
  if (error && !homePageData._id) return <Container className="mt-5"><Alert variant="danger">Hata: {error}</Alert></Container>;

  return (
    <Container fluid className="p-2 p-md-3 p-lg-4">
      {/* ÜST BAR - RESPONSIVE İYİLEŞTİRME */}
      <div className="mb-4 align-items-center bg-light p-3 rounded sticky-top shadow-sm d-flex flex-column flex-sm-row justify-content-between gap-2" style={{ top: '60px', zIndex: 1020 }}>
        <h2 className="mb-2 mb-sm-0 me-sm-auto text-center text-sm-start">Anasayfa Yönetimi</h2>
        <div className="d-flex flex-column flex-sm-row align-items-center gap-2 w-100 w-sm-auto">
          <ButtonGroup className="mb-2 mb-sm-0 w-100 w-sm-auto">
            <Button variant={currentLang === 'tr' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('tr')} className="flex-fill">TR 🇹🇷</Button>
            <Button variant={currentLang === 'en' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('en')} className="flex-fill">EN 🇬🇧</Button>
          </ButtonGroup>
          <Button variant="success" onClick={handleSave} disabled={isSaving} className="flex-fill flex-sm-grow-0">
            <FaSave className="me-1 me-md-2" />
            {isSaving ? <span className="d-none d-md-inline">Kaydediliyor...</span> : <span className="d-none d-md-inline">Tüm Değişiklikleri Kaydet</span>}
            <span className="d-md-none">{isSaving ? '...' : 'Kaydet'}</span>
          </Button>
        </div>
      </div>

      {/* DURUM BİLDİRİM MESAJI */}
      {statusMessage.show && <Alert variant={statusMessage.type} onClose={() => setStatusMessage({ show: false })} dismissible>{statusMessage.message}</Alert>}

      <Row>
        {/* ANA İÇERİK KOLONU - RESPONSIVE İYİLEŞTİRME */}
        <Col xl={8} lg={7} className="mb-4 mb-lg-0">
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
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center flex-column flex-sm-row gap-2">
              <span>Hero Slider</span>
              <Button variant="success" size="sm" onClick={handleOpenNewSlideModal}>
                <FaPlus /> <span className="d-none d-sm-inline ms-1">Yeni Slayt Ekle</span>
                <span className="d-sm-none ms-1">Ekle</span>
              </Button>
            </Card.Header>
            <ListGroup variant="flush">
              {homePageData.heroSlides?.length === 0 && <ListGroup.Item>Henüz slayt eklenmemiş.</ListGroup.Item>}
              {homePageData.heroSlides?.map((slide, index) => (
                <ListGroup.Item key={slide.slider_id || slide._id || index} className="p-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                    <div className="d-flex align-items-center flex-grow-1 w-100">
                      <img src={getFullImagePath(slide.image)} alt="Slide" className="img-thumbnail me-3 flex-shrink-0" style={{ width: '80px', height: '50px', objectFit: 'cover' }} />
                      <div className="flex-grow-1 text-truncate">
                        <h6 className="mb-0 text-truncate">{slide.title?.[currentLang] || 'Başlıksız Slayt'}</h6>
                        <small className="text-muted text-truncate d-block">{slide.subtitle?.[currentLang] || 'Alt başlık yok'}</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-1 ms-md-auto">
                      <Button variant="outline-primary" size="sm" onClick={() => handleOpenEditSlideModal(slide, index)}>
                        <FaEdit /> <span className="d-none d-md-inline ms-1">Düzenle</span>
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => deleteArrayItem('heroSlides', index)}>
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {/* KATEGORİ VE ÜRÜN YÖNETİMİ */}
          <Card>
            <Card.Header as="h5">Anasayfa Kategorileri ve Ürünleri</Card.Header>
            <Card.Body className="p-2 p-md-3">
              {homePageData.categories?.map((cat) => (
                <div key={cat.category_key} className="p-2 p-md-3 border rounded mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <h6 className="mb-0">{cat.title?.[currentLang] || cat.category_key} <Badge pill bg="secondary">{cat.products?.length || 0} ürün</Badge></h6>
                    <Button variant="outline-primary" size="sm" onClick={() => openAddProductModal(cat.category_key)}><FaPlus /> Ürün Ekle</Button>
                  </div>
                  <Row className="g-2">
                    {(cat.products || [])
                      .filter(product => Number(product.stock) > 0)
                      .map(product => (
                        <Col key={`${cat.category_key}-${product.product_id}`} xs={6} sm={4} md={3} className="mb-2">
                          <Card className="h-100">

                            <Card.Img variant="top" src={getFullImagePath(product.image)} style={{ height: '80px', objectFit: 'cover' }} />
                            <Card.Body className="p-2 position-relative d-flex flex-column">
                              <Card.Title style={{ fontSize: '0.8rem', marginBottom: '25px', minHeight: '40px', lineHeight: '1.2' }}>
                                {product.translations?.tr?.name || 'İsimsiz Ürün'}
                              </Card.Title>
                              <Button
                                variant="danger"
                                size="sm"
                                className="mt-auto align-self-end"
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

        {/* YAN BAR KOLONU - RESPONSIVE İYİLEŞTİRME */}
        <Col xl={4} lg={5}>
          {/* BANNER KARTI */}
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
                <ListGroup.Item key={index}>
                  <div className="d-flex flex-column flex-md-row gap-2">
                    <Form.Control style={{ flex: '0 0 50px' }} placeholder="✨" value={item.icon || ''} onChange={e => handleArrayChange('advantages', index, 'icon', e.target.value)} />
                    <Form.Control placeholder={`Metin (${currentLang.toUpperCase()})`} value={item.text?.[currentLang] || ''} onChange={e => handleArrayChange('advantages', index, 'text', e.target.value, true)} />
                    <Button variant="outline-danger" onClick={() => deleteArrayItem('advantages', index)} className="flex-shrink-0"><FaTrash /></Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          <Card>
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center"><span>İstatistikler</span><Button variant="success" size="sm" onClick={() => addArrayItem('stats', newStatTemplate)}><FaPlus /></Button></Card.Header>
            <ListGroup variant="flush">
              {homePageData.stats?.map((item, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex flex-column flex-md-row gap-2">
                    <Form.Control placeholder="Değer" value={item.value || ''} onChange={e => handleArrayChange('stats', index, 'value', e.target.value)} />
                    <Form.Control placeholder={`Açıklama (${currentLang.toUpperCase()})`} value={item.desc?.[currentLang] || ''} onChange={e => handleArrayChange('stats', index, 'desc', e.target.value, true)} />
                    <Button variant="outline-danger" onClick={() => deleteArrayItem('stats', index)} className="flex-shrink-0"><FaTrash /></Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* === MODALLAR === */}

      {/* Slayt Ekleme/Düzenleme Modalı */}
      <Modal show={showSlideModal} onHide={() => setShowSlideModal(false)} size="lg" backdrop="static" className="responsive-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditingSlide ? 'Slaytı Düzenle' : 'Yeni Slayt Ekle'} ({currentLang.toUpperCase()})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSlide && (
            <Form>
              <Row>
                <Col md={4} className="mb-3 mb-md-0">
                  <Form.Label>Slayt Resmi</Form.Label>
                  <div className="text-center border p-2 rounded">
                    <img src={getFullImagePath(currentSlide.image)} alt="Slide Preview" className="img-fluid mb-2" style={{ maxHeight: '150px' }} />
                    <Button variant="outline-secondary" size="sm" className="w-100" // Modal içindeki butonun eski hali:
                      // onClick={() => openImageModal({ type: 'heroSlides', isModal: true })}
                      // Yeni hali:
                      onClick={() => openImageModal({ type: 'heroSlides', isModal: true }, currentSlide.image)}>
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
        <Modal.Footer className="flex-column flex-sm-row gap-2">
          <Button variant="secondary" onClick={() => setShowSlideModal(false)} className="flex-fill">İptal</Button>
          <Button variant="primary" onClick={handleSaveSlide} className="flex-fill">
            <FaSave /> {isEditingSlide ? 'Değişiklikleri Kaydet' : 'Slaytı Ekle'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Ürün Ekleme Modalı */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg" className="responsive-modal">
        <Modal.Header closeButton><Modal.Title>Kategoriye Ürün Ekle</Modal.Title></Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3"><InputGroup.Text><FaSearch /></InputGroup.Text><FormControl placeholder="Aramak için ürün adı yazın..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></InputGroup>
          <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {getAvailableProducts().length === 0 && <ListGroup.Item disabled>Eklenecek uygun ürün bulunamadı.</ListGroup.Item>}
            {getAvailableProducts().map(p => (<ListGroup.Item key={p._id} action onClick={() => addProductToCategory(p)} className="d-flex justify-content-between align-items-center p-2"><div className="d-flex align-items-center"><img src={getFullImagePath(p.image)} alt={p.translations?.tr?.name} width="40" height="40" style={{ objectFit: 'cover', marginRight: '10px' }} /><span className="text-truncate">{p.translations?.tr?.name || 'İsimsiz'}</span></div><Badge bg="primary" pill>{p.price} TL</Badge></ListGroup.Item>))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      {/* Resim Yükleme Modalı */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="md" className="responsive-modal">
        <Modal.Header closeButton><Modal.Title>Resim Yükle</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Bilgisayarınızdan bir resim dosyası seçin</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
          </Form.Group>
          {imagePreview && <div className="text-center mb-3"><img src={getFullImagePath(imagePreview)} alt="Önizleme" className="img-fluid" style={{ maxHeight: '200px' }} /></div>}
        </Modal.Body>
        <Modal.Footer className="flex-column flex-sm-row gap-2">
          <Button variant="secondary" onClick={() => setShowImageModal(false)} className="flex-fill">İptal</Button>
          <Button variant="primary" onClick={saveImage} disabled={!imagePreview} className="flex-fill"><FaSave /> Seçili Resmi Kullan</Button>
        </Modal.Footer>
      </Modal>

      {/* Responsive için ek CSS */}
      <style>{`
        @media (max-width: 768px) {
          .responsive-modal .modal-dialog {
            margin: 0.5rem;
            width: auto;
          }
          .responsive-modal .modal-content {
            border-radius: 0.5rem;
          }
        }
        @media (max-width: 576px) {
          .container-fluid {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .card-body {
            padding: 0.75rem;
          }
          .btn-group .btn {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default AdminHome;