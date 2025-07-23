import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup, Tabs, Tab
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaPencilAlt } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

// Anasayfa verisi boş gelirse diye yeni veri yapısına uygun varsayılan yapı
const initialData = {
  page_title: { tr: '', en: '' },
  page_subtitle: { tr: '', en: '' },
  heroSlides: [],
  banner: {
    image: "",
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
  image: '',
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

  // --- MODAL STATE YÖNETİMİ ---
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [isEditingSlide, setIsEditingSlide] = useState(false);

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
    const dataToSend = JSON.parse(JSON.stringify(homePageData));

    if (dataToSend.heroSlides) {
        dataToSend.heroSlides.forEach(slide => {
            if (slide.slider_id) {
                 delete slide.slider_id;
            }
        });
    }

    setIsSaving(true);
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
        setStatusMessage({ show: true, message: `Kaydetme hatası: ${err.message}`, type: 'danger' });
    } finally {
        setIsSaving(false);
    }
  };

  // --- SLIDER MODAL YÖNETİMİ ---
  const handleOpenNewSlideModal = () => {
    setCurrentSlide({ ...newSlideTemplate, slider_id: uuidv4() });
    setIsEditingSlide(false);
    setShowSlideModal(true);
  };

  const handleOpenEditSlideModal = (slide, index) => {
    setCurrentSlide({ ...slide, index });
    setIsEditingSlide(true);
    setShowSlideModal(true);
  };

  const handleSlideChange = (field, value, isMultiLang = false, lang) => {
    const targetLang = lang || currentLang;
    setCurrentSlide(prev => {
        if (isMultiLang) {
            return { ...prev, [field]: { ...prev[field], [targetLang]: value } };
        }
        return { ...prev, [field]: value };
    });
  };

  const handleSaveSlide = () => {
    if (!currentSlide || !currentSlide.title?.tr) {
        alert("Lütfen en azından Türkçe başlık alanını doldurun.");
        return;
    }
    if (isEditingSlide) {
        const { index, ...slideData } = currentSlide;
        const updatedSlides = [...homePageData.heroSlides];
        updatedSlides[index] = slideData;
        setHomePageData(prev => ({ ...prev, heroSlides: updatedSlides }));
    } else {
        const { slider_id, ...slideData } = currentSlide;
        setHomePageData(prev => ({ ...prev, heroSlides: [...(prev.heroSlides || []), slideData] }));
    }
    setShowSlideModal(false);
    setCurrentSlide(null);
  };

  // --- DİĞER YARDIMCI FONKSİYONLAR ---
  const handleMultiLangChange = (field, subField, value) => {
    setHomePageData(prev => {
        if (subField) {
            const fieldData = { ...(prev[field]?.[subField] || {}), [currentLang]: value };
            const subFieldData = { ...(prev[field] || {}), [subField]: fieldData };
            return { ...prev, [field]: subFieldData };
        }
        const fieldData = { ...(prev[field] || {}), [currentLang]: value };
        return { ...prev, [field]: fieldData };
    });
};

  
  const addArrayItem = (arrayName, newItemTemplate) => setHomePageData(prev => ({...prev, [arrayName]: [...(prev[arrayName] || []), newItemTemplate] }));
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
  
  const deleteArrayItem = (arrayName, index) => {
    if (!window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;
    setHomePageData(prev => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }));
  };

  const removeProductFromCategory = (categoryKey, productId) => {
    if (!window.confirm("Bu ürünü kategoriden kaldırmak istediğinizden emin misiniz?")) return;
    setHomePageData(prev => ({ ...prev, categories: prev.categories.map(cat => cat.category_key === categoryKey ? { ...cat, products: (cat.products || []).filter(p => p.product_id !== productId) } : cat)}));
  };

  const openAddProductModal = (key) => { setCurrentCategoryKey(key); setShowProductModal(true); setSearchTerm(''); };
  const addProductToCategory = (product) => {
    const productForHomePage = { product_id: product._id.toString(), image: product.image, translations: product.translations, price: product.price, rating: product.rating, stock: product.stock };
    setHomePageData(prev => ({ ...prev, categories: prev.categories.map(cat => {
        if (cat.category_key === currentCategoryKey && !(cat.products || []).some(p => p.product_id === product._id)) {
            return { ...cat, products: [...(cat.products || []), productForHomePage] };
        }
        if((cat.products || []).some(p => p.product_id === product._id)) alert("Bu ürün zaten kategoride mevcut.");
        return cat;
      })
    }));
    setShowProductModal(false);
  };
  
  const getAvailableProducts = () => {
    if (!currentCategoryKey) return [];
    const currentCategory = homePageData.categories.find(c => c.category_key === currentCategoryKey);
    if (!currentCategory) return [];
    const currentProductIds = new Set((currentCategory.products || []).map(p => p.product_id));
    return allProducts.filter(p => p.category_key === currentCategoryKey && !currentProductIds.has(p._id) && (p.translations?.tr?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /><h4>Yükleniyor...</h4></Container>;
  if (error && !homePageData._id) return <Container className="mt-5"><Alert variant="danger">Hata: {error}</Alert></Container>;

  return (
    <Container fluid className="p-3 p-md-4">
      <Row className="mb-4 align-items-center bg-light p-3 rounded sticky-top shadow-sm" style={{ top: '60px', zIndex: 1020 }}>
        <Col><h2 className="mb-0">Anasayfa Yönetimi</h2></Col>
        <Col xs="auto">
          <ButtonGroup>
            <Button variant={currentLang === 'tr' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('tr')}>TR 🇹🇷</Button>
            <Button variant={currentLang === 'en' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('en')}>EN 🇬🇧</Button>
          </ButtonGroup>
        </Col>
        <Col xs="auto">
          <Button variant="success" onClick={handleSave} disabled={isSaving}><FaSave className="me-2" />{isSaving ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}</Button>
        </Col>
      </Row>

      {statusMessage.show && <Alert variant={statusMessage.type} onClose={() => setStatusMessage({ show: false })} dismissible>{statusMessage.message}</Alert>}

      <Row>
        <Col xl={8} className="mb-4">
          <Card className="mb-4">
            <Card.Header as="h5">Genel Sayfa Metinleri ({currentLang.toUpperCase()})</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Sayfa Başlığı</Form.Label>
                <Form.Control type="text" value={homePageData.page_title?.[currentLang] || ''} onChange={e => handleMultiLangChange('page_title', null, e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Sayfa Alt Başlığı</Form.Label>
                <Form.Control as="textarea" rows={3} value={homePageData.page_subtitle?.[currentLang] || ''} onChange={e => handleMultiLangChange('page_subtitle', null, e.target.value)} />
              </Form.Group>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                <span>Hero Slider</span>
                <Button variant="success" size="sm" onClick={handleOpenNewSlideModal}><FaPlus /> Yeni Slayt Ekle</Button>
            </Card.Header>
            <ListGroup variant="flush">
                {homePageData.heroSlides?.map((slide, index) => (
                    <ListGroup.Item key={slide._id || slide.slider_id} className="d-flex align-items-center p-3">
                    {slide.image && <img src={`http://localhost:5000${slide.image}`} alt="slide" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }} className="me-3"/>}
                    <div className="flex-grow-1">
                        <h6 className="mb-0">{slide.title?.[currentLang] || slide.title?.tr || 'Başlıksız'}</h6>
                        <small className="text-muted">{slide.subtitle?.[currentLang] || slide.subtitle?.tr || 'Alt başlık yok'}</small>
                    </div>
                    <div>
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEditSlideModal(slide, index)}><FaPencilAlt /></Button>
                        <Button variant="outline-danger" size="sm" onClick={() => deleteArrayItem('heroSlides', index)}><FaTrash /></Button>
                    </div>
                    </ListGroup.Item>
                ))}
                {(!homePageData.heroSlides || homePageData.heroSlides.length === 0) && <ListGroup.Item className="text-center text-muted">Henüz slayt eklenmemiş.</ListGroup.Item>}
            </ListGroup>
          </Card>

          <Card>
            <Card.Header as="h5">Anasayfa Kategorileri ve Ürünleri</Card.Header>
            <Card.Body>{homePageData.categories?.map((cat) => (<div key={cat.category_key} className="p-3 border rounded mb-3"><div className="d-flex justify-content-between align-items-center mb-2"><h6 className="mb-0">{cat.title?.[currentLang] || cat.category_key} <Badge pill bg="secondary">{cat.products?.length || 0} ürün</Badge></h6><Button variant="outline-primary" size="sm" onClick={() => openAddProductModal(cat.category_key)}><FaPlus /> Ürün Ekle</Button></div><Row>{(cat.products || []).map(product => (<Col key={`${cat.category_key}-${product.product_id}`} xs={6} md={4} lg={3} className="mb-2"><Card className="h-100"><Card.Img variant="top" src={product.image} style={{ height: '80px', objectFit: 'cover' }} /><Card.Body className="p-2 position-relative"><Card.Title style={{ fontSize: '0.8rem', marginBottom: '25px' }}>{product.translations?.tr?.name || 'İsimsiz Ürün'}</Card.Title><Button variant="danger" size="sm" className="position-absolute" style={{ bottom: '5px', right: '5px' }} onClick={() => removeProductFromCategory(cat.category_key, product.product_id)}><FaTimes /></Button></Card.Body></Card></Col>))}</Row></div>))}</Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
            <Card className="mb-4">
                <Card.Header as="h5">Özel Banner ({currentLang.toUpperCase()})</Card.Header>
                <Card.Body>
                <Form.Group className="mb-2"><Form.Label>Başlık</Form.Label><Form.Control size="sm" value={homePageData.banner?.title?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'title', e.target.value)} /></Form.Group>
                <Form.Group className="mb-2"><Form.Label>Açıklama</Form.Label><Form.Control size="sm" value={homePageData.banner?.desc?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'desc', e.target.value)} /></Form.Group>
                <Form.Group><Form.Label>Buton Metni</Form.Label><Form.Control size="sm" value={homePageData.banner?.cta?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'cta', e.target.value)} /></Form.Group>
                </Card.Body>
            </Card>
            
            <Card className="mb-4"><Card.Header as="h5" className="d-flex justify-content-between align-items-center"><span>Avantajlar</span><Button variant="success" size="sm" onClick={() => addArrayItem('advantages', newAdvantageTemplate)}><FaPlus /></Button></Card.Header><ListGroup variant="flush">{homePageData.advantages?.map((item, index) => (<ListGroup.Item key={index}><InputGroup><Form.Control style={{ flex: '0 0 50px' }} placeholder="İkon" value={item.icon || ''} onChange={e => handleArrayChange('advantages', index, 'icon', e.target.value)} /><Form.Control placeholder={`Metin (${currentLang.toUpperCase()})`} value={item.text?.[currentLang] || ''} onChange={e => handleArrayChange('advantages', index, 'text', e.target.value, true)} /><Button variant="outline-danger" onClick={() => deleteArrayItem('advantages', index)}><FaTrash /></Button></InputGroup></ListGroup.Item>))}</ListGroup></Card>
            <Card className="mb-4"><Card.Header as="h5" className="d-flex justify-content-between align-items-center"><span>İstatistikler</span><Button variant="success" size="sm" onClick={() => addArrayItem('stats', newStatTemplate)}><FaPlus /></Button></Card.Header><ListGroup variant="flush">{homePageData.stats?.map((item, index) => (<ListGroup.Item key={index}><InputGroup><Form.Control placeholder="Değer (örn: 10.000+)" value={item.value || ''} onChange={e => handleArrayChange('stats', index, 'value', e.target.value)} /><Form.Control placeholder={`Açıklama (${currentLang.toUpperCase()})`} value={item.desc?.[currentLang] || ''} onChange={e => handleArrayChange('stats', index, 'desc', e.target.value, true)} /><Button variant="outline-danger" onClick={() => deleteArrayItem('stats', index)}><FaTrash /></Button></InputGroup></ListGroup.Item>))}</ListGroup></Card>
        </Col>
      </Row>

      {/* --- MODALS --- */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg"><Modal.Header closeButton><Modal.Title>Kategoriye Ürün Ekle</Modal.Title></Modal.Header><Modal.Body><InputGroup className="mb-3"><InputGroup.Text><FaSearch /></InputGroup.Text><FormControl placeholder="Eklemek için ürün ara (Türkçe isme göre)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></InputGroup><ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>{getAvailableProducts().map(p => (<ListGroup.Item key={p._id} action onClick={() => addProductToCategory(p)} className="d-flex justify-content-between align-items-center"><span><img src={p.image} alt={p.translations?.tr?.name} width="40" height="40" style={{ objectFit: 'cover', marginRight: '10px' }} />{p.translations?.tr?.name || 'İsimsiz Ürün'}</span><Badge bg="primary" pill>{p.price} TL</Badge></ListGroup.Item>))}{getAvailableProducts().length === 0 && <ListGroup.Item disabled>Bu kategoriye eklenebilecek uygun ürün bulunamadı veya arama sonucu boş.</ListGroup.Item>}</ListGroup></Modal.Body></Modal>

      <Modal show={showSlideModal} onHide={() => setShowSlideModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton><Modal.Title>{isEditingSlide ? 'Slaytı Düzenle' : 'Yeni Slayt Ekle'}</Modal.Title></Modal.Header>
        <Modal.Body>
          {currentSlide && (
            <Form>
              <Row>
                <Col md={4}>
                  <Form.Label>Slayt Resmi</Form.Label>
                  {currentSlide.image && <img src={`http://localhost:5000${currentSlide.image}`} alt="Slayt Önizleme" className="img-fluid rounded mb-2"/>}
                  <Form.Control type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0];
                      if(!file) return;
                      const formData = new FormData();
                      formData.append('image', file);
                      try {
                          const response = await fetch(`http://localhost:5000/admin/home/upload-image`, { method: 'POST', body: formData });
                          const result = await response.json();
                          if(response.ok) handleSlideChange('image', result.imagePath);
                          else throw new Error(result.message);
                      } catch(uploadError) {
                          setStatusMessage({ show: true, message: `Resim yüklenemedi: ${uploadError.message}`, type: 'danger' });
                      }
                  }}/>
                </Col>
                <Col md={8}>
                  <Tabs defaultActiveKey="tr" className="mb-3">
                    <Tab eventKey="tr" title="Türkçe 🇹🇷">
                      <Form.Group className="mb-3"><Form.Label>Başlık</Form.Label><Form.Control value={currentSlide.title?.tr || ''} onChange={e => handleSlideChange('title', e.target.value, true, 'tr')} /></Form.Group>
                      <Form.Group className="mb-3"><Form.Label>Alt Başlık</Form.Label><Form.Control value={currentSlide.subtitle?.tr || ''} onChange={e => handleSlideChange('subtitle', e.target.value, true, 'tr')}/></Form.Group>
                      <Form.Group><Form.Label>Buton Yazısı (Opsiyonel)</Form.Label><Form.Control value={currentSlide.cta?.tr || ''} onChange={e => handleSlideChange('cta', e.target.value, true, 'tr')} /></Form.Group>
                    </Tab>
                    <Tab eventKey="en" title="İngilizce 🇬🇧">
                      <Form.Group className="mb-3"><Form.Label>Title</Form.Label><Form.Control value={currentSlide.title?.en || ''} onChange={e => handleSlideChange('title', e.target.value, true, 'en')} /></Form.Group>
                      <Form.Group className="mb-3"><Form.Label>Subtitle</Form.Label><Form.Control value={currentSlide.subtitle?.en || ''} onChange={e => handleSlideChange('subtitle', e.target.value, true, 'en')}/></Form.Group>
                      <Form.Group><Form.Label>Button Text (Optional)</Form.Label><Form.Control value={currentSlide.cta?.en || ''} onChange={e => handleSlideChange('cta', e.target.value, true, 'en')} /></Form.Group>
                    </Tab>
                  </Tabs>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSlideModal(false)}>İptal</Button>
          <Button variant="primary" onClick={handleSaveSlide}><FaSave className="me-2"/>{isEditingSlide ? 'Değişiklikleri Kaydet' : 'Slaytı Ekle'}</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default AdminHome;