import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaImage, FaEdit } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const SERVER_URL = `${import.meta.env.VITE_API_URL}`;

const getFullImagePath = (path) => {
  if (!path) return '/images/placeholder-slide.jpg';
  // Eğer path bir "blob:" (yerel önizleme) veya "http" ise direkt döndür
  if (path.startsWith('blob:') || path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, ""); 
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

const newSlideTemplate = {
  slider_id: '',
  image: '/images/placeholder-slide.jpg',
  title: { tr: '', en: '' },
  subtitle: { tr: '', en: '' },
  cta: { tr: '', en: '' },
};

const AdminHome = () => {
  const [homePageData, setHomePageData] = useState(initialData);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ show: false, message: '', type: 'success' });
  const [currentLang, setCurrentLang] = useState('tr');

  const [showSlideModal, setShowSlideModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState(null);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState('');
  const [imageUploadContext, setImageUploadContext] = useState({ type: '', isModal: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null); // Dosya objesini tutmak için null yaptık

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/homeList`);
      if (!response.ok) throw new Error('Veriler alınamadı.');
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

  // --- ASIL KAYIT MANTIĞI ---
  const handleSave = async () => {
    if (!homePageData._id) {
      alert("Hata: Kaydedilecek veri ID'si yok.");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSend = JSON.parse(JSON.stringify(homePageData));

      // 1. ADIM: Firebase'e yüklenmesi gereken resimleri PARALEL yükle
      if (dataToSend.heroSlides) {
        const uploadPromises = dataToSend.heroSlides.map(async (slide) => {
          // Eğer slide içinde bir rawFile varsa (yeni seçilmiş demektir)
          if (slide.rawFile) {
            const formData = new FormData();
            formData.append('image', slide.rawFile);

            const uploadRes = await fetch(`${SERVER_URL}/admin/home/upload-image`, {
              method: 'POST',
              body: formData
            });
            const uploadData = await uploadRes.json();
            
            slide.image = uploadData.imagePath; // Firebase linkini yaz
            delete slide.rawFile; // Geçici dosyayı temizle
          }
          // Veritabanına gitmemesi gereken alanları temizle
          if (slide.slider_id) delete slide.slider_id;
          return slide;
        });

        await Promise.all(uploadPromises);
      }

      // 2. ADIM: MongoDB Güncellemesi
      const apiUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "");
      const response = await fetch(`${apiUrl}/admin/home/${homePageData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Kayıt başarısız.');

      if (result.updatedData) {
        setHomePageData(result.updatedData);
      }

      setStatusMessage({ show: true, message: 'Her şey başarıyla buluta yüklendi!', type: 'success' });
    } catch (err) {
      console.error("Save error:", err);
      setStatusMessage({ show: true, message: 'Hata: ' + err.message, type: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Firebase'e GİTMEZ. Sadece önizleme oluşturur.
    const previewUrl = URL.createObjectURL(file);
    setImagePreview({
      file: file,
      url: previewUrl
    });
  };

  const saveImage = () => {
    if (!imagePreview) return;
    const { type, isModal } = imageUploadContext;

    if (isModal && type === 'heroSlides') {
      setCurrentSlide(prev => ({
        ...prev,
        image: imagePreview.url, // UI için blob URL
        rawFile: imagePreview.file // Kayıt anı için asıl dosya
      }));
    }

    setShowImageModal(false);
    setImagePreview(null);
  };

  // --- DİĞER YARDIMCI FONKSİYONLAR ---
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
    setCurrentSlide(prev => {
      if (isMultiLang) {
        return { ...prev, [field]: { ...prev[field], [currentLang]: value } };
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
  };

  const handleMultiLangChange = (field, subField, value, isTopLevel = false) => {
    if (isTopLevel) {
      setHomePageData(prev => ({ ...prev, [field]: { ...prev[field], [currentLang]: value } }));
    } else {
      setHomePageData(prev => ({
        ...prev,
        [field]: { ...prev[field], [subField]: { ...prev[field][subField], [currentLang]: value } }
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
    setHomePageData(prev => ({ ...prev, [arrayName]: [...(prev[arrayName] || []), newItemTemplate] }));
  };

  const deleteArrayItem = (arrayName, index) => {
    if (!window.confirm("Silinsin mi?")) return;
    setHomePageData(prev => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }));
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
      image: product.image,
      translations: product.translations
    };
    setHomePageData(prev => ({
      ...prev,
      categories: prev.categories.map(cat => {
        if (cat.category_key === currentCategoryKey) {
          if (cat.products?.some(p => p.product_id === product._id)) return cat;
          return { ...cat, products: [...(cat.products || []), productForHomePage] };
        }
        return cat;
      })
    }));
    setShowProductModal(false);
  };

  const getAvailableProducts = () => {
    if (!currentCategoryKey) return [];
    const cat = homePageData.categories.find(c => c.category_key === currentCategoryKey);
    const currentIds = new Set(cat?.products?.map(p => p.product_id) || []);
    return allProducts.filter(p => p.category_key === currentCategoryKey && !currentIds.has(p._id) && Number(p.stock) > 0)
                      .filter(p => p.translations?.tr?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /><h4>Yükleniyor...</h4></Container>;

  return (
    <Container fluid className="p-2 p-md-3 p-lg-4">
      <div className="mb-4 align-items-center bg-light p-3 rounded sticky-top shadow-sm d-flex justify-content-between gap-2" style={{ top: '60px', zIndex: 1020 }}>
        <h2 className="mb-0">Anasayfa Yönetimi</h2>
        <div className="d-flex gap-2">
          <ButtonGroup>
            <Button variant={currentLang === 'tr' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('tr')}>TR</Button>
            <Button variant={currentLang === 'en' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('en')}>EN</Button>
          </ButtonGroup>
          <Button variant="success" onClick={handleSave} disabled={isSaving}>
            <FaSave className="me-2" />
            {isSaving ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
          </Button>
        </div>
      </div>

      {statusMessage.show && <Alert variant={statusMessage.type} onClose={() => setStatusMessage({ show: false })} dismissible>{statusMessage.message}</Alert>}

      <Row>
        <Col xl={8} lg={7}>
          <Card className="mb-4">
            <Card.Header as="h5">Genel Metinler</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Başlık</Form.Label>
                <Form.Control value={homePageData.page_title?.[currentLang] || ''} onChange={e => handleMultiLangChange('page_title', null, e.target.value, true)} />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between">
              <span>Hero Slider</span>
              <Button variant="success" size="sm" onClick={handleOpenNewSlideModal}><FaPlus /> Ekle</Button>
            </Card.Header>
            <ListGroup variant="flush">
              {homePageData.heroSlides?.map((slide, index) => (
                <ListGroup.Item key={index} className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <img src={getFullImagePath(slide.image)} alt="Preview" style={{ width: '60px', height: '40px', objectFit: 'cover' }} className="me-3" />
                    <span>{slide.title?.[currentLang] || 'Başlıksız'}</span>
                  </div>
                  <div>
                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenEditSlideModal(slide, index)} className="me-2"><FaEdit /></Button>
                    <Button variant="outline-danger" size="sm" onClick={() => deleteArrayItem('heroSlides', index)}><FaTrash /></Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
          
          {/* Kategoriler Bölümü */}
          <Card>
            <Card.Header as="h5">Kategori Ürünleri</Card.Header>
            <Card.Body>
              {homePageData.categories?.map(cat => (
                <div key={cat.category_key} className="mb-4 p-2 border rounded">
                  <div className="d-flex justify-content-between mb-2">
                    <h6>{cat.title?.[currentLang]}</h6>
                    <Button size="sm" onClick={() => openAddProductModal(cat.category_key)}><FaPlus /> Ürün</Button>
                  </div>
                  <Row>
                    {cat.products?.map(p => (
                      <Col key={p.product_id} xs={3} className="text-center position-relative">
                         <img src={getFullImagePath(p.image)} width="100%" className="img-thumbnail" />
                         <Button variant="danger" size="sm" className="position-absolute top-0 end-0" onClick={() => removeProductFromCategory(cat.category_key, p.product_id)}><FaTimes /></Button>
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={5}>
            <Card className="mb-4">
              <Card.Header>Banner</Card.Header>
              <Card.Body>
                <Form.Control className="mb-2" placeholder="Başlık" value={homePageData.banner?.title?.[currentLang] || ''} onChange={e => handleMultiLangChange('banner', 'title', e.target.value)} />
                <Form.Control as="textarea" placeholder="Açıklama" value={homePageData.banner?.desc?.[currentLang] || ''} onChange={e => handleMultiLangChange('banner', 'desc', e.target.value)} />
              </Card.Body>
            </Card>
        </Col>
      </Row>

      {/* --- MODALLAR --- */}
      <Modal show={showSlideModal} onHide={() => setShowSlideModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Slayt Düzenle</Modal.Title></Modal.Header>
        <Modal.Body>
          {currentSlide && (
            <Row>
              <Col md={4} className="text-center">
                <img src={getFullImagePath(currentSlide.image)} className="img-fluid mb-2 border" />
                <Button variant="outline-dark" size="sm" onClick={() => setShowImageModal(true)}><FaImage /> Resim Seç</Button>
              </Col>
              <Col md={8}>
                <Form.Label>Başlık ({currentLang.toUpperCase()})</Form.Label>
                <Form.Control value={currentSlide.title[currentLang] || ''} onChange={e => handleSlideChange('title', e.target.value, true)} />
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSaveSlide}>Tamam</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
        <Modal.Header closeButton><Modal.Title>Resim Seç</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
          {imagePreview && <img src={imagePreview.url} className="img-fluid mt-3" />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={saveImage} disabled={!imagePreview}>Seçili Resmi Kullan</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton><Modal.Title>Ürün Ekle</Modal.Title></Modal.Header>
        <Modal.Body>
          <FormControl placeholder="Ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <ListGroup className="mt-2">
            {getAvailableProducts().map(p => (
              <ListGroup.Item key={p._id} action onClick={() => addProductToCategory(p)}>{p.translations?.tr?.name}</ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default AdminHome;