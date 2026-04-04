import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaImage, FaEdit } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

// Resim yolunu tamamlama yardımcı fonksiyonu
const getFullImagePath = (path) => {
  if (!path) return '/images/placeholder-slide.jpg';
  if (typeof path === 'string' && (path.startsWith('blob:') || path.startsWith('http') || path.startsWith('data:'))) {
    return path;
  }
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, "");
  const cleanPath = (typeof path === 'string' && path.startsWith('/')) ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Varsayılan veri yapıları
const initialData = {
  page_title: { tr: '', en: '' },
  page_subtitle: { tr: '', en: '' },
  heroSlides: [],
  banner: { title: { tr: '', en: '' }, desc: { tr: '', en: '' }, cta: { tr: '', en: '' } },
  advantages: [],
  stats: [],
  categories: [],
};

const newSlideTemplate = {
  slider_id: '',
  image: '/images/placeholder-slide.jpg',
  title: { tr: '', en: '' },
  subtitle: { tr: '', en: '' },
  cta: { tr: '', en: '' },
};
const newAdvantageTemplate = { icon: '✨', text: { tr: '', en: '' } };
const newStatTemplate = { value: '', desc: { tr: '', en: '' } };

const AdminHome = () => {
  const [homePageData, setHomePageData] = useState(initialData);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ show: false, message: '', type: 'success' });
  const [currentLang, setCurrentLang] = useState('tr');

  // Modallar ve UI State
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState('');
  const [imageUploadContext, setImageUploadContext] = useState({ type: '', isModal: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [currentOldImageUrl, setCurrentOldImageUrl] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/homeList`);
      const result = await response.json();
      if (result.homeData && result.homeData.length > 0) {
        setHomePageData({ ...initialData, ...result.homeData[0] });
      }
      setAllProducts(result.productData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // HAFIZA TEMİZLİĞİ
  useEffect(() => {
    return () => { if (imagePreview?.url) URL.revokeObjectURL(imagePreview.url); };
  }, [imagePreview]);

  // ÜRÜN FİLTRELEME (FIXED)
  const availableProducts = useMemo(() => {
    if (!currentCategoryKey || !homePageData.categories) return [];
    const currentCategory = homePageData.categories.find(c => c.category_key === currentCategoryKey);
    if (!currentCategory) return [];
    const currentProductIds = new Set((currentCategory.products || []).map(p => p.product_id));

    return allProducts
      .filter(p => p.category_key === currentCategoryKey && !currentProductIds.has(p._id) && Number(p.stock) > 0)
      .filter(p => (p.translations?.[currentLang]?.name || p.translations?.tr?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [currentCategoryKey, homePageData.categories, allProducts, searchTerm, currentLang]);

  // KAYDETME
  const handleSave = async () => {
    if (!homePageData._id) return;
    setIsSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');
      const updatedSlides = await Promise.all((homePageData.heroSlides || []).map(async (slide) => {
        const { rawFile, slider_id, originalImage, ...cleanSlide } = slide;
        if (rawFile) {
          const formData = new FormData();
          formData.append('image', rawFile);
          if (originalImage) formData.append('oldImageUrl', originalImage);
          const uploadRes = await fetch(`${apiUrl}/admin/home/upload-image`, { method: 'POST', body: formData });
          const uploadResult = await uploadRes.json();
          return { ...cleanSlide, image: uploadResult.imagePath };
        }
        return cleanSlide;
      }));

      const response = await fetch(`${apiUrl}/admin/home/${homePageData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...homePageData, heroSlides: updatedSlides }),
      });
      const result = await response.json();
      if (result.updatedData) setHomePageData(result.updatedData);
      setStatusMessage({ show: true, message: 'Başarıyla kaydedildi!', type: 'success' });
    } catch (err) {
      setStatusMessage({ show: true, message: 'Hata: ' + err.message, type: 'danger' });
    } finally { setIsSaving(false); }
  };

  // YARDIMCI FONKSİYONLAR (HEPSİ GERİ GELDİ)
  const handleOpenNewSlideModal = () => {
    setCurrentSlide({ ...newSlideTemplate, slider_id: uuidv4() });
    setIsEditingSlide(false);
    setShowSlideModal(true);
  };

  const handleOpenEditSlideModal = (slide, index) => {
    setCurrentSlide({ ...slide });
    setIsEditingSlide(true);
    setEditingSlideIndex(index);
    setShowSlideModal(true);
  };

  const handleSlideChange = (field, value, isMultiLang = false) => {
    setCurrentSlide(prev => ({
      ...prev,
      [field]: isMultiLang ? { ...prev[field], [currentLang]: value } : value
    }));
  };

  const handleSaveSlide = () => {
    setHomePageData(prev => {
      const slides = [...(prev.heroSlides || [])];
      if (isEditingSlide) slides[editingSlideIndex] = currentSlide;
      else slides.push(currentSlide);
      return { ...prev, heroSlides: slides };
    });
    setShowSlideModal(false);
  };

  const openImageModal = (context, existingImageUrl = '') => {
    setImageUploadContext(context);
    setCurrentOldImageUrl(existingImageUrl);
    setShowImageModal(true);
    setImagePreview(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImagePreview({ file, url: URL.createObjectURL(file) });
  };

  const saveImage = () => {
    if (imagePreview && imageUploadContext.type === 'heroSlides') {
      setCurrentSlide(prev => ({ ...prev, image: imagePreview.url, rawFile: imagePreview.file, originalImage: currentOldImageUrl || prev.image }));
    }
    setShowImageModal(false);
  };

  const handleMultiLangChange = (field, subField, value, isTopLevel = false) => {
    setHomePageData(prev => ({
      ...prev,
      [field]: isTopLevel 
        ? { ...prev[field], [currentLang]: value }
        : { ...prev[field], [subField]: { ...prev[field][subField], [currentLang]: value } }
    }));
  };

  const handleArrayChange = (arrayName, index, field, value, isMultiLang = false) => {
    setHomePageData(prev => {
      const newArr = [...prev[arrayName]];
      newArr[index] = isMultiLang 
        ? { ...newArr[index], [field]: { ...newArr[index][field], [currentLang]: value } }
        : { ...newArr[index], [field]: value };
      return { ...prev, [arrayName]: newArr };
    });
  };

  const addArrayItem = (arrayName, template) => {
    setHomePageData(prev => ({ ...prev, [arrayName]: [...(prev[arrayName] || []), template] }));
  };

  const deleteArrayItem = (arrayName, index) => {
    if (window.confirm("Silinsin mi?")) {
      setHomePageData(prev => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }));
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container fluid className="p-3">
      {/* ÜST BAR */}
      <div className="mb-4 bg-light p-3 rounded sticky-top shadow-sm d-flex justify-content-between align-items-center" style={{ top: '60px', zIndex: 1020 }}>
        <h2 className="m-0">Anasayfa Yönetimi</h2>
        <div className="d-flex gap-2">
          <ButtonGroup>
            <Button variant={currentLang === 'tr' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('tr')}>TR</Button>
            <Button variant={currentLang === 'en' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('en')}>EN</Button>
          </ButtonGroup>
          <Button variant="success" onClick={handleSave} disabled={isSaving}>
            <FaSave className="me-2" /> {isSaving ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
          </Button>
        </div>
      </div>

      {statusMessage.show && <Alert variant={statusMessage.type} dismissible onClose={() => setStatusMessage({ ...statusMessage, show: false })}>{statusMessage.message}</Alert>}

      <Row>
        <Col xl={8}>
          {/* GENEL AYARLAR */}
          <Card className="mb-4 shadow-sm">
            <Card.Header>Genel Sayfa Metinleri</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Başlık ({currentLang})</Form.Label>
                <Form.Control value={homePageData.page_title?.[currentLang] || ''} onChange={e => handleMultiLangChange('page_title', null, e.target.value, true)} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Alt Başlık ({currentLang})</Form.Label>
                <Form.Control as="textarea" rows={2} value={homePageData.page_subtitle?.[currentLang] || ''} onChange={e => handleMultiLangChange('page_subtitle', null, e.target.value, true)} />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* SLIDER */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="d-flex justify-content-between">
              <span>Hero Slider</span>
              <Button size="sm" variant="success" onClick={handleOpenNewSlideModal}><FaPlus /> Ekle</Button>
            </Card.Header>
            <ListGroup variant="flush">
              {homePageData.heroSlides?.map((slide, index) => (
                <ListGroup.Item key={slide.slider_id || index} className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img src={getFullImagePath(slide.image)} width="60" height="40" className="me-3 rounded" style={{ objectFit: 'cover' }} />
                    <div>{slide.title?.[currentLang] || 'Başlıksız'}</div>
                  </div>
                  <div>
                    <Button size="sm" variant="outline-primary" className="me-1" onClick={() => handleOpenEditSlideModal(slide, index)}><FaEdit /></Button>
                    <Button size="sm" variant="outline-danger" onClick={() => deleteArrayItem('heroSlides', index)}><FaTrash /></Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {/* KATEGORİ VE ÜRÜNLER */}
          <Card className="shadow-sm">
            <Card.Header>Kategoriler</Card.Header>
            <Card.Body>
              {homePageData.categories?.map((cat) => (
                <div key={cat.category_key} className="border rounded p-3 mb-3 bg-light">
                  <div className="d-flex justify-content-between mb-3">
                    <h6 className="m-0">{cat.title?.[currentLang] || cat.category_key} <Badge bg="info">{cat.products?.length || 0}</Badge></h6>
                    <Button size="sm" variant="primary" onClick={() => { setCurrentCategoryKey(cat.category_key); setShowProductModal(true); setSearchTerm(''); }}><FaPlus /> Ürün Ekle</Button>
                  </div>
                  <Row className="g-2">
                    {cat.products?.map(p => (
                      <Col key={p.product_id} xs={4} md={2} className="position-relative">
                        <Card className="h-100 p-1 text-center shadow-sm">
                          <Card.Img src={getFullImagePath(p.image)} style={{ height: '50px', objectFit: 'cover' }} />
                          <div className="small text-truncate mt-1" style={{ fontSize: '0.7rem' }}>{p.translations?.tr?.name}</div>
                          <Button variant="danger" size="sm" className="position-absolute top-0 end-0 p-0" style={{ width: '18px', height: '18px', borderRadius: '50%' }} onClick={() => {
                             setHomePageData(prev => ({
                               ...prev,
                               categories: prev.categories.map(c => c.category_key === cat.category_key ? { ...c, products: c.products.filter(pr => pr.product_id !== p.product_id) } : c)
                             }));
                          }}><FaTimes /></Button>
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
          {/* BANNER (GERİ GELDİ) */}
          <Card className="mb-4 shadow-sm">
            <Card.Header>Banner Ayarları</Card.Header>
            <Card.Body>
              <Form.Group className="mb-2">
                <Form.Label className="small">Başlık</Form.Label>
                <Form.Control size="sm" value={homePageData.banner?.title?.[currentLang] || ''} onChange={e => handleMultiLangChange('banner', 'title', e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="small">Açıklama</Form.Label>
                <Form.Control size="sm" as="textarea" rows={2} value={homePageData.banner?.desc?.[currentLang] || ''} onChange={e => handleMultiLangChange('banner', 'desc', e.target.value)} />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small">Buton Metni</Form.Label>
                <Form.Control size="sm" value={homePageData.banner?.cta?.[currentLang] || ''} onChange={e => handleMultiLangChange('banner', 'cta', e.target.value)} />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* AVANTAJLAR (GERİ GELDİ) */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Avantajlar</span>
              <Button size="sm" variant="success" onClick={() => addArrayItem('advantages', newAdvantageTemplate)}><FaPlus /></Button>
            </Card.Header>
            <ListGroup variant="flush">
              {homePageData.advantages?.map((item, index) => (
                <ListGroup.Item key={index} className="d-flex gap-2 p-2">
                  <Form.Control style={{ width: '45px' }} value={item.icon || ''} onChange={e => handleArrayChange('advantages', index, 'icon', e.target.value)} />
                  <Form.Control value={item.text?.[currentLang] || ''} onChange={e => handleArrayChange('advantages', index, 'text', e.target.value, true)} />
                  <Button variant="outline-danger" size="sm" onClick={() => deleteArrayItem('advantages', index)}><FaTrash /></Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {/* İSTATİSTİKLER (GERİ GELDİ) */}
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>İstatistikler</span>
              <Button size="sm" variant="success" onClick={() => addArrayItem('stats', newStatTemplate)}><FaPlus /></Button>
            </Card.Header>
            <ListGroup variant="flush">
              {homePageData.stats?.map((item, index) => (
                <ListGroup.Item key={index} className="d-flex gap-2 p-2">
                  <Form.Control placeholder="Değer" value={item.value || ''} onChange={e => handleArrayChange('stats', index, 'value', e.target.value)} />
                  <Form.Control placeholder="Metin" value={item.desc?.[currentLang] || ''} onChange={e => handleArrayChange('stats', index, 'desc', e.target.value, true)} />
                  <Button variant="outline-danger" size="sm" onClick={() => deleteArrayItem('stats', index)}><FaTrash /></Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* MODALLAR */}
      <Modal show={showSlideModal} onHide={() => setShowSlideModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>{isEditingSlide ? 'Düzenle' : 'Yeni Slayt'}</Modal.Title></Modal.Header>
        <Modal.Body>
          {currentSlide && (
            <Row>
              <Col md={4} className="text-center">
                <img src={getFullImagePath(currentSlide.image)} className="img-fluid rounded mb-2 border" />
                <Button variant="outline-secondary" size="sm" onClick={() => openImageModal({ type: 'heroSlides', isModal: true }, currentSlide.image)}>Değiştir</Button>
              </Col>
              <Col md={8}>
                <Form.Label className="small fw-bold">Başlık ({currentLang})</Form.Label>
                <Form.Control className="mb-2" value={currentSlide.title?.[currentLang] || ''} onChange={e => handleSlideChange('title', e.target.value, true)} />
                <Form.Label className="small fw-bold">Alt Başlık</Form.Label>
                <Form.Control as="textarea" rows={3} value={currentSlide.subtitle?.[currentLang] || ''} onChange={e => handleSlideChange('subtitle', e.target.value, true)} />
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer><Button onClick={handleSaveSlide}>Listeye Uygula</Button></Modal.Footer>
      </Modal>

      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Ürün Ekle</Modal.Title></Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3"><InputGroup.Text><FaSearch /></InputGroup.Text>
            <FormControl placeholder="Ürün adı ile ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </InputGroup>
          <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {availableProducts.map(p => (
              <ListGroup.Item key={p._id} action className="d-flex justify-content-between align-items-center" onClick={() => {
                const productData = { product_id: p._id.toString(), stock: p.stock, price: p.price, image: p.image, translations: p.translations };
                setHomePageData(prev => ({
                  ...prev,
                  categories: prev.categories.map(c => c.category_key === currentCategoryKey ? { ...c, products: [...(c.products || []), productData] } : c)
                }));
                setShowProductModal(false);
              }}>
                <div className="d-flex align-items-center">
                  <img src={getFullImagePath(p.image)} width="40" className="me-3 rounded" />
                  <span>{p.translations?.[currentLang]?.name || p.translations?.tr?.name}</span>
                </div>
                <Badge bg="success">{p.price} TL</Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
        <Modal.Header closeButton><Modal.Title>Resim Yükle</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
          {imagePreview && <div className="text-center mt-3"><img src={imagePreview.url} width="150" className="rounded shadow" /></div>}
        </Modal.Body>
        <Modal.Footer><Button onClick={saveImage} disabled={!imagePreview}>Kullan</Button></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminHome;