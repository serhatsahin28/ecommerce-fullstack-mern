import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaImage, FaEdit } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

// Resim yolunu tamamlama yardımcı fonksiyonu
const getFullImagePath = (path) => {
  if (!path || typeof path !== 'string') return '/images/placeholder-slide.jpg';
  if (path.startsWith('blob:') || path.startsWith('http') || path.startsWith('data:')) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, "");
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

const initialData = {
  page_title: { tr: '', en: '' },
  page_subtitle: { tr: '', en: '' },
  heroSlides: [],
  banner: { title: { tr: '', en: '' }, desc: { tr: '', en: '' }, cta: { tr: '', en: '' } },
  advantages: [],
  stats: [],
  categories: [],
};

const AdminHome = () => {
  const [homePageData, setHomePageData] = useState(initialData);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ show: false, message: '', type: 'success' });
  const [currentLang, setCurrentLang] = useState('tr');

  // Modallar
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

const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/homeList`);
    const result = await response.json();

    if (result.homeData && result.homeData.length > 0) {
      // Gelen veriyi başlangıç şablonuyla birleştir ki eksik alan kalmasın
      setHomePageData({ 
        ...initialData, 
        ...result.homeData[0],
        categories: result.homeData[0].categories || [], // Kategorileri garantiye al
        heroSlides: result.homeData[0].heroSlides || []  // Slaytları garantiye al
      });
    }
    setAllProducts(result.productData || []);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filtrelenmiş Ürünler (Memoize edilmiş Dizi)
const availableProducts = useMemo(() => {
  // 1. Güvenlik Duvarı: Veri yoksa hemen boş dizi dön
  if (!currentCategoryKey || !homePageData || !homePageData.categories) return [];

  const currentCategory = homePageData.categories.find(
    c => c.category_key === currentCategoryKey
  );
  
  if (!currentCategory) return [];

  // 2. Güvenlik: products alanı yoksa patlamasın diye || [] ekle
  const currentProductIds = new Set(
    (currentCategory.products || []).map(p => p.product_id)
  );

  return (allProducts || [])
    .filter(p =>
      p.category_key === currentCategoryKey &&
      !currentProductIds.has(p._id) &&
      Number(p.stock) > 0
    )
    .filter(p => {
      const name = p.translations?.[currentLang]?.name || p.translations?.tr?.name || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
}, [currentCategoryKey, homePageData, allProducts, searchTerm, currentLang]);

  // Güvenli Kaydetme
  const handleSave = async () => {
    if (!homePageData._id) return;
    setIsSaving(true);
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const updatedSlides = await Promise.all((homePageData.heroSlides || []).map(async (slide) => {
        if (slide.rawFile) {
          const formData = new FormData();
          formData.append('image', slide.rawFile);
          if (slide.originalImage) formData.append('oldImageUrl', slide.originalImage);
          const uploadRes = await fetch(`${apiUrl}/admin/home/upload-image`, { method: 'POST', body: formData });
          if (!uploadRes.ok) throw new Error('Resim yüklenemedi.');
          const resJson = await uploadRes.json();
          const { rawFile, originalImage, ...rest } = slide;
          return { ...rest, image: resJson.imagePath };
        }
        return slide;
      }));

      const finalData = { ...homePageData, heroSlides: updatedSlides };
      const response = await fetch(`${apiUrl}/admin/home/${homePageData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });
      if (!response.ok) throw new Error('Kaydetme başarısız.');
      setStatusMessage({ show: true, message: 'Başarıyla kaydedildi.', type: 'success' });
    } catch (err) {
      setStatusMessage({ show: true, message: err.message, type: 'danger' });
    } finally { setIsSaving(false); }
  };

  // Veri Güncelleme Yardımcıları (Defansif)
  const handleMultiLangChange = (field, subField, value, isTopLevel = false) => {
    setHomePageData(prev => {
      const newData = { ...prev };
      if (isTopLevel) {
        newData[field] = { ...(newData[field] || {}), [currentLang]: value };
      } else {
        newData[field] = { 
          ...(newData[field] || {}), 
          [subField]: { ...(newData[field]?.[subField] || {}), [currentLang]: value } 
        };
      }
      return newData;
    });
  };

  const addArrayItem = (arrayName, template) => {
    setHomePageData(prev => ({ ...prev, [arrayName]: [...(prev[arrayName] || []), template] }));
  };

  const deleteArrayItem = (arrayName, index) => {
    if (window.confirm("Silinsin mi?")) {
      setHomePageData(prev => ({ ...prev, [arrayName]: (prev[arrayName] || []).filter((_, i) => i !== index) }));
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container fluid className="p-3">
      {/* Üst Panel */}
      <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded mb-4 sticky-top" style={{ top: '70px' }}>
        <h4>Anasayfa Yönetimi</h4>
        <div className="d-flex gap-2">
          <ButtonGroup>
            <Button variant={currentLang === 'tr' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('tr')}>TR</Button>
            <Button variant={currentLang === 'en' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('en')}>EN</Button>
          </ButtonGroup>
          <Button variant="success" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Kaydediliyor...' : <><FaSave /> Kaydet</>}
          </Button>
        </div>
      </div>

      {statusMessage.show && <Alert variant={statusMessage.type} dismissible onClose={() => setStatusMessage({ ...statusMessage, show: false })}>{statusMessage.message}</Alert>}

      <Row>
        <Col lg={8}>
          {/* Slaytlar */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between">
              <span>Slaytlar</span>
              <Button size="sm" variant="primary" onClick={() => { 
                setCurrentSlide({ slider_id: uuidv4(), image: '', title: {tr:'',en:''}, subtitle: {tr:'',en:''}, cta: {tr:'',en:''} }); 
                setIsEditingSlide(false); 
                setShowSlideModal(true); 
              }}><FaPlus /></Button>
            </Card.Header>
            <ListGroup variant="flush">
              {(homePageData.heroSlides || []).map((slide, index) => (
                <ListGroup.Item key={slide.slider_id || index} className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img src={getFullImagePath(slide.image)} width="60" height="40" className="me-3 rounded" style={{ objectFit: 'cover' }} />
                    <div>{slide.title?.[currentLang] || 'Başlıksız'}</div>
                  </div>
                  <div>
                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => { setCurrentSlide(slide); setEditingSlideIndex(index); setIsEditingSlide(true); setShowSlideModal(true); }}><FaEdit /></Button>
                    <Button size="sm" variant="outline-danger" onClick={() => deleteArrayItem('heroSlides', index)}><FaTrash /></Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {/* Kategoriler */}
          {(homePageData.categories || []).map((cat) => (
            <Card key={cat.category_key} className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>{cat.title?.[currentLang] || cat.category_key}</span>
                <Button size="sm" onClick={() => { setCurrentCategoryKey(cat.category_key); setShowProductModal(true); }}><FaPlus /> Ürün Ekle</Button>
              </Card.Header>
              <Card.Body>
                <Row>
                  {(cat.products || []).map(p => (
                    <Col key={p.product_id} xs={4} md={2} className="mb-2 text-center position-relative">
                      <img src={getFullImagePath(p.image)} className="img-fluid rounded" style={{ height: '60px', width: '100%', objectFit: 'cover' }} />
                      <div className="small text-truncate">{p.translations?.[currentLang]?.name}</div>
                      <Button variant="danger" size="sm" className="position-absolute top-0 end-0 p-0" style={{ width: '20px', height: '20px' }} 
                        onClick={() => {
                          setHomePageData(prev => ({
                            ...prev,
                            categories: prev.categories.map(c => c.category_key === cat.category_key ? { ...c, products: c.products.filter(pr => pr.product_id !== p.product_id) } : c)
                          }));
                        }}><FaTimes /></Button>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>

        <Col lg={4}>
          {/* Avantajlar / İstatistikler Buraya Gelebilir */}
          <Alert variant="info">Yan paneldeki ayarları buradan düzenleyebilirsiniz.</Alert>
        </Col>
      </Row>

      {/* Ürün Ekleme Modalı */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Ürün Seçin</Modal.Title></Modal.Header>
        <Modal.Body>
          <FormControl className="mb-3" placeholder="Ara..." onChange={(e) => setSearchTerm(e.target.value)} />
          <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {availableProductsList.map(p => (
              <ListGroup.Item key={p._id} action className="d-flex justify-content-between align-items-center" onClick={() => {
                const newProd = { product_id: p._id, image: p.image, translations: p.translations, price: p.price, stock: p.stock };
                setHomePageData(prev => ({
                  ...prev,
                  categories: prev.categories.map(c => c.category_key === currentCategoryKey ? { ...c, products: [...(c.products || []), newProd] } : c)
                }));
                setShowProductModal(false);
              }}>
                <div className="d-flex align-items-center">
                  <img src={getFullImagePath(p.image)} width="40" className="me-2" />
                  {p.translations?.[currentLang]?.name}
                </div>
                <Badge bg="primary">{p.price} TL</Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      {/* Slayt Düzenleme Modalı */}
      <Modal show={showSlideModal} onHide={() => setShowSlideModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Slayt Ayarları</Modal.Title></Modal.Header>
        <Modal.Body>
          {currentSlide && (
            <Row>
              <Col md={4} className="text-center">
                <img src={getFullImagePath(currentSlide.image)} className="img-fluid mb-2 rounded" />
                <Button variant="outline-secondary" size="sm" onClick={() => setShowImageModal(true)}>Resim Seç</Button>
              </Col>
              <Col md={8}>
                <Form.Label>Başlık ({currentLang})</Form.Label>
                <Form.Control className="mb-2" value={currentSlide.title?.[currentLang] || ''} 
                  onChange={e => setCurrentSlide({ ...currentSlide, title: { ...currentSlide.title, [currentLang]: e.target.value } })} />
                <Form.Label>Alt Başlık</Form.Label>
                <Form.Control as="textarea" value={currentSlide.subtitle?.[currentLang] || ''} 
                  onChange={e => setCurrentSlide({ ...currentSlide, subtitle: { ...currentSlide.subtitle, [currentLang]: e.target.value } })} />
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => {
            setHomePageData(prev => {
              const slides = [...(prev.heroSlides || [])];
              if (isEditingSlide) slides[editingSlideIndex] = currentSlide;
              else slides.push(currentSlide);
              return { ...prev, heroSlides: slides };
            });
            setShowSlideModal(false);
          }}>Kaydet</Button>
        </Modal.Footer>
      </Modal>

      {/* Resim Seçme Modalı */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
        <Modal.Body>
          <Form.Control type="file" onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const url = URL.createObjectURL(file);
              setCurrentSlide(prev => ({ ...prev, image: url, rawFile: file, originalImage: prev.image.startsWith('http') ? prev.image : null }));
              setShowImageModal(false);
            }
          }} />
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default AdminHome;