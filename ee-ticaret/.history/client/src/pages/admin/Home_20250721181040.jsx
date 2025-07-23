import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup, Tabs, Tab
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaImage, FaPencilAlt } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

// === BACKEND SUNUCU ADRESİ (Bu, resim yollarını düzeltir) ===
const SERVER_URL = 'http://localhost:5000';

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

const newSlideTemplate = { image: '', title: { tr: '', en: '' }, subtitle: { tr: '', en: '' }, cta: { tr: '', en: '' } };
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

  // --- MODAL STATE'LERİ ---
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Slider Ekle/Düzenle Modal'ı state'leri
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  
  // Resim Seçme Modal'ı için state'ler (Eski çalışan mantık geri getirildi)
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // --- VERİ İŞLEMLERİ ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${SERVER_URL}/admin/homeList`);
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

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!homePageData._id) { return alert("Hata: Kaydedilecek veri ID'si yok."); }
    const dataToSend = JSON.parse(JSON.stringify(homePageData));
    if (dataToSend.heroSlides) {
      dataToSend.heroSlides.forEach(slide => { if (slide.slider_id) { delete slide.slider_id; } });
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${SERVER_URL}/admin/home/${homePageData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Bir hata oluştu.');
      if (result.updatedData) { setHomePageData(result.updatedData); }
      setStatusMessage({ show: true, message: 'Veriler başarıyla kaydedildi!', type: 'success' });
    } catch (err) {
      setStatusMessage({ show: true, message: `Kaydetme hatası: ${err.message}`, type: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  // --- SLIDER MODAL YÖNETİMİ ---
  const handleOpenNewSlideModal = () => { setCurrentSlide({ ...newSlideTemplate, slider_id: uuidv4() }); setIsEditingSlide(false); setShowSlideModal(true); };
  const handleOpenEditSlideModal = (slide, index) => { setCurrentSlide({ ...slide, index }); setIsEditingSlide(true); setShowSlideModal(true); };

  const handleSlideChange = (field, value, isMultiLang = false, lang) => {
    const targetLang = lang || currentLang;
    setCurrentSlide(prev => {
      if (isMultiLang) { return { ...prev, [field]: { ...prev[field], [targetLang]: value } }; }
      return { ...prev, [field]: value };
    });
  };

  const handleSaveSlide = () => {
    if (!currentSlide || !currentSlide.title?.tr) { return alert("Lütfen en azından Türkçe başlık alanını doldurun."); }
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

  // --- RESİM MODAL YÖNETİMİ (Eski çalışan mantık) ---
  const openImageSelectionModal = () => { setImagePreview(''); setShowImageModal(true); };
  
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`${SERVER_URL}/admin/home/upload-image`, { method: 'POST', body: formData });
      const result = await response.json();
      if (response.ok) { setImagePreview(result.imagePath); } 
      else { throw new Error(result.message); }
    } catch (err) {
      setStatusMessage({ show: true, message: `Resim yüklenemedi: ${err.message}`, type: 'danger' });
    }
  };
  
  const saveImageToSlide = () => {
    if (!imagePreview) return;
    handleSlideChange('image', imagePreview); // DİKKAT: Ana state'i değil, modal'ın geçici state'ini günceller
    setShowImageModal(false);
  };


  // --- DİĞER YARDIMCI FONKSİYONLAR ---
  const handleMultiLangChange = (field, subField, value) => setHomePageData(prev => ({...prev,[field]: subField ? {...(prev[field] || {}),[subField]: { ...(prev[field]?.[subField] || {}),[currentLang]: value }} : { ...(prev[field] || {}),[currentLang]: value }}));
  const addArrayItem = (arrayName, newItemTemplate) => setHomePageData(prev => ({...prev, [arrayName]: [...(prev[arrayName] || []), newItemTemplate]}));
  const handleArrayChange = (arrayName, index, field, value, isMultiLang = false) => setHomePageData(prev => { const arr = [...prev[arrayName]]; arr[index] = isMultiLang ? {...arr[index],[field]:{...arr[index][field],[currentLang]:value}} : {...arr[index],[field]:value}; return {...prev,[arrayName]:arr}; });
  const deleteArrayItem = (arrayName, index) => { if (!window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return; setHomePageData(prev => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) })); };
  const removeProductFromCategory = (key, id) => { if (!window.confirm("Bu ürünü kaldırmak istediğinizden emin misiniz?")) return; setHomePageData(prev => ({...prev, categories: prev.categories.map(cat => cat.category_key === key ? {...cat,products:(cat.products || []).filter(p=>p.product_id !== id)}:cat)}));};
  const openAddProductModal = (key) => { setCurrentCategoryKey(key); setShowProductModal(true); setSearchTerm(''); };
  const addProductToCategory = (p) => { const newP = { product_id: p._id, ...p }; setHomePageData(prev => ({...prev, categories: prev.categories.map(c => c.category_key === currentCategoryKey && !c.products.some(i => i.product_id === p._id) ? {...c,products:[...c.products,newP]}:c)})); setShowProductModal(false);};
  const getAvailableProducts = () => {if(!currentCategoryKey)return[];const c = homePageData.categories.find(cat=>cat.category_key===currentCategoryKey);if(!c)return[];const ids = new Set(c.products.map(p=>p.product_id));return allProducts.filter(p=>p.category_key===currentCategoryKey&&!ids.has(p._id)&&(p.translations.tr.name||'').toLowerCase().includes(searchTerm.toLowerCase()));};

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border"/><h4>Yükleniyor...</h4></Container>;
  if (error && !homePageData._id) return <Container className="mt-5"><Alert variant="danger">Hata: {error}</Alert></Container>;

  return (
    <Container fluid className="p-3 p-md-4">
      {/* ÜST BAR */}
      <Row className="mb-4 align-items-center bg-light p-3 rounded sticky-top shadow-sm" style={{top: '60px', zIndex: 1020}}>
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

      {statusMessage.show && <Alert variant={statusMessage.type} onClose={() => setStatusMessage({show: false})} dismissible>{statusMessage.message}</Alert>}

      <Row>
        <Col xl={8} className="mb-4">
          <Card className="mb-4"><Card.Header as="h5">Genel Sayfa Metinleri ({currentLang.toUpperCase()})</Card.Header><Card.Body><Form.Group className="mb-3"><Form.Label>Sayfa Başlığı</Form.Label><Form.Control type="text" value={homePageData.page_title?.[currentLang] || ''} onChange={e => handleMultiLangChange('page_title', null, e.target.value)} /></Form.Group><Form.Group className="mb-3"><Form.Label>Sayfa Alt Başlığı</Form.Label><Form.Control as="textarea" rows={3} value={homePageData.page_subtitle?.[currentLang] || ''} onChange={e => handleMultiLangChange('page_subtitle', null, e.target.value)} /></Form.Group></Card.Body></Card>
          <Card className="mb-4"><Card.Header as="h5" className="d-flex justify-content-between align-items-center"><span>Hero Slider</span><Button variant="success" size="sm" onClick={handleOpenNewSlideModal}><FaPlus /> Yeni Slayt Ekle</Button></Card.Header><ListGroup variant="flush">{homePageData.heroSlides?.map((slide, index) => (<ListGroup.Item key={slide._id || slide.slider_id} className="d-flex align-items-center p-3">{slide.image && <img src={`${SERVER_URL}${slide.image}`} alt="slide" style={{width:50, height:50, objectFit:'cover', borderRadius: '4px'}} className="me-3"/>}<div className="flex-grow-1"><h6 className="mb-0">{slide.title?.[currentLang] || slide.title?.tr || 'Başlıksız'}</h6><small className="text-muted">{slide.subtitle?.[currentLang]||slide.subtitle?.tr||'Alt başlık yok'}</small></div><div><Button variant="outline-primary" size="sm" className="me-2" onClick={()=>handleOpenEditSlideModal(slide, index)}><FaPencilAlt /></Button><Button variant="outline-danger" size="sm" onClick={()=>deleteArrayItem('heroSlides', index)}><FaTrash /></Button></div></ListGroup.Item>))}{(!homePageData.heroSlides||homePageData.heroSlides.length === 0) && <ListGroup.Item className="text-center text-muted">Henüz slayt eklenmemiş.</ListGroup.Item>}</ListGroup></Card>
          <Card><Card.Header as="h5">Anasayfa Kategorileri</Card.Header><Card.Body>{homePageData.categories?.map((cat)=>(<div key={cat.category_key} className="p-3 border rounded mb-3"><div className="d-flex justify-content-between align-items-center mb-2"><h6 className="mb-0">{cat.title?.[currentLang] || cat.category_key}<Badge pill bg="secondary" className="ms-2">{cat.products?.length || 0} ürün</Badge></h6><Button variant="outline-primary" size="sm" onClick={()=>openAddProductModal(cat.category_key)}><FaPlus/> Ürün Ekle</Button></div><Row>{(cat.products||[]).map(p=>(<Col key={p.product_id} xs={6} md={4} lg={3} className="mb-2"><Card className="h-100"><Card.Img variant="top" src={p.image} style={{height:'80px',objectFit:'cover'}}/><Card.Body className="p-2 pos-relative"><Card.Title style={{fontSize:'0.8rem',marginBottom:'25px'}}>{p.translations.tr.name}</Card.Title><Button variant="danger" size="sm" className="position-absolute" style={{bottom:'5px',right:'5px'}} onClick={()=>removeProductFromCategory(cat.category_key,p.product_id)}><FaTimes/></Button></Card.Body></Card></Col>))}</Row></div>))}</Card.Body></Card>
        </Col>
        <Col xl={4}>
          <Card className="mb-4"><Card.Header as="h5">Özel Banner ({currentLang.toUpperCase()})</Card.Header><Card.Body><Form.Group className="mb-2"><Form.Label>Başlık</Form.Label><Form.Control size="sm" value={homePageData.banner?.title?.[currentLang]||''} onChange={e=>handleMultiLangChange('banner','title',e.target.value)}/></Form.Group><Form.Group className="mb-2"><Form.Label>Açıklama</Form.Label><Form.Control size="sm" value={homePageData.banner?.desc?.[currentLang]||''} onChange={e=>handleMultiLangChange('banner','desc',e.target.value)}/></Form.Group><Form.Group><Form.Label>Buton Metni</Form.Label><Form.Control size="sm" value={homePageData.banner?.cta?.[currentLang]||''} onChange={e=>handleMultiLangChange('banner','cta',e.target.value)}/></Form.Group></Card.Body></Card>
          <Card className="mb-4"><Card.Header as="h5" className="d-flex justify-content-between align-items-center"><span>Avantajlar</span><Button variant="success" size="sm" onClick={()=>addArrayItem('advantages',newAdvantageTemplate)}><FaPlus/></Button></Card.Header><ListGroup variant="flush">{homePageData.advantages?.map((item, index)=>(<ListGroup.Item key={index}><InputGroup><Form.Control style={{flex:'0 0 50px'}} placeholder="İkon" value={item.icon||''} onChange={e=>handleArrayChange('advantages',index,'icon',e.target.value)}/><Form.Control placeholder={`Metin (${currentLang.toUpperCase()})`} value={item.text?.[currentLang]||''} onChange={e=>handleArrayChange('advantages',index,'text',e.target.value,true)}/><Button variant="outline-danger" onClick={()=>deleteArrayItem('advantages',index)}><FaTrash/></Button></InputGroup></ListGroup.Item>))}</ListGroup></Card>
          <Card className="mb-4"><Card.Header as="h5" className="d-flex justify-content-between align-items-center"><span>İstatistikler</span><Button variant="success" size="sm" onClick={()=>addArrayItem('stats',newStatTemplate)}><FaPlus/></Button></Card.Header><ListGroup variant="flush">{homePageData.stats?.map((item,index)=>(<ListGroup.Item key={index}><InputGroup><Form.Control placeholder="Değer (örn: 10.000+)" value={item.value||''} onChange={e=>handleArrayChange('stats',index,'value',e.target.value)}/><Form.Control placeholder={`Açıklama (${currentLang.toUpperCase()})`} value={item.desc?.[currentLang]||''} onChange={e=>handleArrayChange('stats',index,'desc',e.target.value,true)}/><Button variant="outline-danger" onClick={()=>deleteArrayItem('stats',index)}><FaTrash/></Button></InputGroup></ListGroup.Item>))}</ListGroup></Card>
        </Col>
      </Row>

      {/* --- MODALLAR --- */}
      <Modal show={showProductModal} onHide={()=>setShowProductModal(false)} size="lg"><Modal.Header closeButton><Modal.Title>Kategoriye Ürün Ekle</Modal.Title></Modal.Header><Modal.Body><InputGroup className="mb-3"><InputGroup.Text><FaSearch/></InputGroup.Text><FormControl placeholder="Ürün ara..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/></InputGroup><ListGroup style={{maxHeight:'400px',overflowY:'auto'}}>{getAvailableProducts().map(p=>(<ListGroup.Item key={p._id} action onClick={()=>addProductToCategory(p)} className="d-flex align-items-center"><span><img src={p.image} alt={p.translations.tr.name} width="40" height="40" style={{objectFit:'cover',marginRight:'10px'}}/>{p.translations.tr.name}</span></ListGroup.Item>))}{getAvailableProducts().length === 0 && <ListGroup.Item disabled>Uygun ürün bulunamadı.</ListGroup.Item>}</ListGroup></Modal.Body></Modal>

      <Modal show={showSlideModal} onHide={()=>setShowSlideModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton><Modal.Title>{isEditingSlide?'Slaytı Düzenle':'Yeni Slayt Ekle'}</Modal.Title></Modal.Header>
        <Modal.Body>
          {currentSlide && <Form>
            <Row>
              <Col md={4}>
                <Form.Label>Slayt Resmi</Form.Label>
                {currentSlide.image ? <img src={`${SERVER_URL}${currentSlide.image}`} alt="Önizleme" className="img-fluid rounded mb-2"/> : <div className="text-center p-4 border rounded mb-2 text-muted">Resim Seçilmedi</div>}
                <Button variant="outline-primary" className="w-100" onClick={openImageSelectionModal}><FaImage className="me-2"/>Resim Değiştir</Button>
              </Col>
              <Col md={8}>
                <Tabs defaultActiveKey="tr" className="mb-3"><Tab eventKey="tr" title="Türkçe 🇹🇷"><Form.Group className="mb-3"><Form.Label>Başlık</Form.Label><Form.Control value={currentSlide.title?.tr||''} onChange={e=>handleSlideChange('title',e.target.value,true,'tr')}/></Form.Group><Form.Group className="mb-3"><Form.Label>Alt Başlık</Form.Label><Form.Control value={currentSlide.subtitle?.tr||''} onChange={e=>handleSlideChange('subtitle',e.target.value,true,'tr')}/></Form.Group><Form.Group><Form.Label>Buton Yazısı (Opsiyonel)</Form.Label><Form.Control value={currentSlide.cta?.tr||''} onChange={e=>handleSlideChange('cta',e.target.value,true,'tr')}/></Form.Group></Tab><Tab eventKey="en" title="İngilizce 🇬🇧"><Form.Group className="mb-3"><Form.Label>Title</Form.Label><Form.Control value={currentSlide.title?.en||''} onChange={e=>handleSlideChange('title',e.target.value,true,'en')}/></Form.Group><Form.Group className="mb-3"><Form.Label>Subtitle</Form.Label><Form.Control value={currentSlide.subtitle?.en||''} onChange={e=>handleSlideChange('subtitle',e.target.value,true,'en')}/></Form.Group><Form.Group><Form.Label>Button Text (Optional)</Form.Label><Form.Control value={currentSlide.cta?.en||''} onChange={e=>handleSlideChange('cta',e.target.value,true,'en')}/></Form.Group></Tab></Tabs>
              </Col>
            </Row>
          </Form> }
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={()=>setShowSlideModal(false)}>İptal</Button><Button variant="primary" onClick={handleSaveSlide}><FaSave className="me-2"/>{isEditingSlide?'Değişiklikleri Kaydet':'Slaytı Ekle'}</Button></Modal.Footer>
      </Modal>

      <Modal show={showImageModal} onHide={()=>setShowImageModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Resim Seç</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3"><Form.Label>Yeni Resim Yükle</Form.Label><Form.Control type="file" accept="image/*" onChange={handleImageUpload}/></Form.Group>
          {imagePreview && <div className="text-center"><img src={`${SERVER_URL}${imagePreview}`} alt="Önizleme" className="img-fluid" style={{maxHeight:'250px'}}/></div>}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={()=>setShowImageModal(false)}>İptal</Button><Button variant="primary" onClick={saveImageToSlide} disabled={!imagePreview}><FaSave className="me-2"/>Seç</Button></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminHome;