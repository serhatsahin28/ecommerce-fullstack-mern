// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Container, Row, Col, Card, Button, Form, Modal,
//   Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup
// } from 'react-bootstrap';
// import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaImage, FaEdit } from 'react-icons/fa';
// import { v4 as uuidv4 } from 'uuid';

// // Sunucu adresi - resim yollarını tamamlamak için
// const SERVER_URL = 'http://localhost:5000';

// // Resim yolunu tamamlama yardımcı fonksiyonu
// const getFullImagePath = (path) => {
//   if (!path) return '/images/placeholder-slide.jpg'; // Varsayılan resim yolu
//   if (path.startsWith('http') || path.startsWith('/images/')) {
//     return path;
//   }
//   return `${SERVER_URL}${path}`;
// };


// // Anasayfa verisi boş gelirse diye yeni veri yapısına uygun varsayılan yapı
// const initialData = {
//   page_title: { tr: '', en: '' },
//   page_subtitle: { tr: '', en: '' },
//   heroSlides: [],
//   banner: {
//     image: "",
//     title: { tr: '', en: '' },
//     desc: { tr: '', en: '' },
//     cta: { tr: '', en: '' },
//     // cta_link kaldırıldı
//   },
//   advantages: [],
//   stats: [],
//   categories: [],
// };

// // Yeni bir slayt/avantaj/istatistik eklerken kullanılacak şablonlar
// const newSlideTemplate = {
//   slider_id: '', // Modal açılırken uuidv4 ile atanacak
//   image: '/images/placeholder-slide.jpg', // Varsayılan placeholder
//   title: { tr: '', en: '' },
//   subtitle: { tr: '', en: '' },
//   cta: { tr: '', en: '' },
//   // cta_link kaldırıldı
// };
// const newAdvantageTemplate = { icon: '✨', text: { tr: '', en: '' } };
// const newStatTemplate = { value: '', desc: { tr: '', en: '' } };

// const AdminHome = () => {
//   // --- STATE YÖNETİMİ ---
//   const [homePageData, setHomePageData] = useState(initialData);
//   const [allProducts, setAllProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [statusMessage, setStatusMessage] = useState({ show: false, message: '', type: 'success' });
//   const [currentLang, setCurrentLang] = useState('tr');

//   // --- YENİ EKLENEN STATE'LER (MODAL İÇİN) ---
//   const [showSlideModal, setShowSlideModal] = useState(false);
//   const [currentSlide, setCurrentSlide] = useState(null); // Düzenlenen veya yeni eklenen slaytı tutar
//   const [isEditingSlide, setIsEditingSlide] = useState(false); // Modal'ın modunu belirler (ekleme/düzenleme)
//   const [editingSlideIndex, setEditingSlideIndex] = useState(null); // Düzenlenen slaydın ana dizideki index'i

//   // Diğer Modal Yönetimi
//   const [showProductModal, setShowProductModal] = useState(false);
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [currentCategoryKey, setCurrentCategoryKey] = useState('');
//   const [imageUploadContext, setImageUploadContext] = useState({ type: '', isModal: false });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [imagePreview, setImagePreview] = useState('');

//   // --- VERİ ÇEKME ---
//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await fetch('http://localhost:5000/admin/homeList');
//       if (!response.ok) throw new Error('Sunucu verileri alınamadı.');
//       const result = await response.json();

//       if (result.homeData && result.homeData.length > 0) {
//         setHomePageData({ ...initialData, ...result.homeData[0] });
//       } else {
//         setHomePageData(initialData);
//         setError("Anasayfa verisi bulunamadı. Yeni bir veri yapısı oluşturuluyor.");
//       }
//       setAllProducts(result.productData || []);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // --- GENEL KAYDETME FONKSİYONU ---
//   const handleSave = async () => {
//     if (!homePageData._id) {
//       alert("Hata: Kaydedilecek veri ID'si yok.");
//       return;
//     }
//     setIsSaving(true);
//     // Göndermeden önce veriyi temizleyelim
//     const dataToSend = JSON.parse(JSON.stringify(homePageData));

//     // Backend'de CastError'a sebep olabilecek geçici frontend ID'lerini kaldıralım.
//     if (dataToSend.heroSlides) {
//       dataToSend.heroSlides.forEach(slide => {
//         if (slide.slider_id) {
//           delete slide.slider_id;
//         }
//       });
//     }

//     try {
//       const response = await fetch(`http://localhost:5000/admin/home/${homePageData._id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(dataToSend),
//       });

//       const result = await response.json();
//       if (!response.ok) throw new Error(result.message || 'Bir hata oluştu.');

//       if (result.updatedData) {
//         setHomePageData(result.updatedData);
//       }

//       setStatusMessage({ show: true, message: 'Veriler başarıyla kaydedildi!', type: 'success' });
//     } catch (err) {
//       console.error("Save error:", err);
//       setStatusMessage({ show: true, message: 'Kaydetme hatası: ' + err.message, type: 'danger' });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // --- SLAYT MODAL YÖNETİMİ ---

//   // Yeni Slayt Ekleme Modalı'nı açar
//   const handleOpenNewSlideModal = () => {
//     setCurrentSlide({ ...newSlideTemplate, slider_id: uuidv4() }); // Boş şablon ve geçici ID
//     setIsEditingSlide(false);
//     setEditingSlideIndex(null);
//     setShowSlideModal(true);
//   };

//   // Mevcut Slaytı Düzenleme Modalı'nı açar
//   const handleOpenEditSlideModal = (slide, index) => {
//     setCurrentSlide({ ...slide });
//     setIsEditingSlide(true);
//     setEditingSlideIndex(index); // Ana dizideki index'i sakla
//     setShowSlideModal(true);
//   };

//   // Modal içindeki slayt bilgilerini günceller
//   const handleSlideChange = (field, value, isMultiLang = false) => {
//     setCurrentSlide(prev => {
//       if (isMultiLang) {
//         return {
//           ...prev,
//           [field]: { ...prev[field], [currentLang]: value }
//         };
//       }
//       return { ...prev, [field]: value };
//     });
//   };

//   // Modal'daki "Değişiklikleri Kaydet" butonu
//   const handleSaveSlide = () => {
//     setHomePageData(prev => {
//       const updatedSlides = [...(prev.heroSlides || [])];
//       if (isEditingSlide && editingSlideIndex !== null) {
//         // Düzenleme modunda: slaytı dizide güncelle
//         updatedSlides[editingSlideIndex] = currentSlide;
//       } else {
//         // Ekleme modunda: yeni slaytı dizinin sonuna ekle
//         updatedSlides.push(currentSlide);
//       }
//       return { ...prev, heroSlides: updatedSlides };
//     });

//     setShowSlideModal(false); // Modalı kapat
//     setCurrentSlide(null);      // Geçici slayt verisini temizle
//     setEditingSlideIndex(null); // Index'i temizle
//   };


//   // --- RESIM YÖNETİMİ ---
//   const openImageModal = (context) => {
//     setImageUploadContext(context);
//     setShowImageModal(true);
//     setImagePreview('');
//   };

//   const handleImageUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append('image', file);

//     try {
//       const response = await fetch(`${SERVER_URL}/admin/home/upload-image`, { method: 'POST', body: formData });
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.message || 'Resim yüklenemedi.');

//       setImagePreview(result.imagePath); // Backend'den gelen yolu önizlemeye ata

//     } catch (err) {
//       setStatusMessage({ show: true, message: 'Resim yükleme hatası: ' + err.message, type: 'danger' });
//     }
//   };

//   const saveImage = () => {
//     if (!imagePreview) return;
//     const { type, isModal } = imageUploadContext;

//     if (type === 'heroSlides' && isModal) {
//       // Eğer ana slayt düzenleme modalı açıksa, `currentSlide` state'ini güncelle
//       handleSlideChange('image', imagePreview);
//     } else if (type === 'banner') {
//       // Eğer banner için resim seçiliyorsa, ana `homePageData`'yı güncelle
//       setHomePageData(prev => ({
//         ...prev,
//         banner: { ...prev.banner, image: imagePreview }
//       }));
//     }

//     setShowImageModal(false);
//     setImagePreview('');
//   };


//   // --- DİZİ İŞLEMLERİ (Avantaj, İstatistik vb.) ---
//   const handleMultiLangChange = (field, subField, value) => {
//     setHomePageData(prev => ({
//         ...prev,
//         [field]: {
//             ...prev[field],
//             [subField || currentLang]: subField ? { ...prev[field][subField], [currentLang]: value } : value
//         }
//     }));
//   };

//   const handleArrayChange = (arrayName, index, field, value, isMultiLang = false) => {
//     setHomePageData(prev => {
//         const newArray = [...prev[arrayName]];
//         if (isMultiLang) {
//             newArray[index] = { ...newArray[index], [field]: { ...newArray[index][field], [currentLang]: value } };
//         } else {
//             newArray[index] = { ...newArray[index], [field]: value };
//         }
//         return { ...prev, [arrayName]: newArray };
//     });
//   };

//   const addArrayItem = (arrayName, newItemTemplate) => {
//     setHomePageData(prev => ({
//       ...prev,
//       [arrayName]: [...(prev[arrayName] || []), newItemTemplate]
//     }));
//   };

//   const deleteArrayItem = (arrayName, index) => {
//     if (!window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;
//     setHomePageData(prev => ({
//       ...prev,
//       [arrayName]: prev[arrayName].filter((_, i) => i !== index)
//     }));
//   };
  
//   // --- KATEGORİ ÜRÜN İŞLEMLERİ ---
//   const removeProductFromCategory = (categoryKey, productId) => {
//     setHomePageData(prev => ({
//       ...prev,
//       categories: prev.categories.map(cat =>
//         cat.category_key === categoryKey
//           ? { ...cat, products: (cat.products || []).filter(p => p.product_id !== productId) }
//           : cat
//       ),
//     }));
//   };

//   const openAddProductModal = (key) => {
//     setCurrentCategoryKey(key);
//     setShowProductModal(true);
//     setSearchTerm('');
//   };

//   const addProductToCategory = (product) => {
//     const productForHomePage = {
//         product_id: product._id.toString(),
//         stock: product.stock,
//         price: product.price,
//         rating: product.rating,
//         image: product.image,
//         images: product.images,
//         translations: product.translations
//     };
//     setHomePageData(prev => {
//         const newCategories = prev.categories.map(cat => {
//             if (cat.category_key === currentCategoryKey) {
//                 if ((cat.products || []).some(p => p.product_id === product._id)) {
//                     alert("Bu ürün zaten kategoride mevcut.");
//                     return cat;
//                 }
//                 return { ...cat, products: [...(cat.products || []), productForHomePage] };
//             }
//             return cat;
//         });
//         return { ...prev, categories: newCategories };
//     });
//     setShowProductModal(false);
//   };
  
//   const getAvailableProducts = () => {
//     if (!currentCategoryKey) return [];
//     const currentCategory = homePageData.categories.find(c => c.category_key === currentCategoryKey);
//     if (!currentCategory) return [];
//     const currentProductIds = new Set((currentCategory.products || []).map(p => p.product_id));
//     return allProducts
//       .filter(p => p.category_key === currentCategoryKey && !currentProductIds.has(p._id))
//       .filter(p => (p.translations?.tr?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
//   };
  

//   if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /><h4>Yükleniyor...</h4></Container>;
//   if (error && !homePageData._id) return <Container className="mt-5"><Alert variant="danger">Hata: {error}</Alert></Container>;

//   return (
//     <Container fluid className="p-3 p-md-4">
//       {/* ÜST BAR */}
//       <Row className="mb-4 align-items-center bg-light p-3 rounded sticky-top shadow-sm" style={{ top: '60px', zIndex: 1020 }}>
//         <Col><h2 className="mb-0">Anasayfa Yönetimi</h2></Col>
//         <Col xs="auto">
//           <ButtonGroup>
//             <Button variant={currentLang === 'tr' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('tr')}>TR 🇹🇷</Button>
//             <Button variant={currentLang === 'en' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('en')}>EN 🇬🇧</Button>
//           </ButtonGroup>
//         </Col>
//         <Col xs="auto">
//           <Button variant="success" onClick={handleSave} disabled={isSaving}>
//             <FaSave className="me-2" />
//             {isSaving ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}
//           </Button>
//         </Col>
//       </Row>

//       {/* DURUM BİLDİRİM MESAJI */}
//       {statusMessage.show && <Alert variant={statusMessage.type} onClose={() => setStatusMessage({ show: false })} dismissible>{statusMessage.message}</Alert>}

//       <Row>
//         <Col xl={8} className="mb-4">
//           {/* GENEL AYARLAR KARTI */}
//           <Card className="mb-4">
//             <Card.Header as="h5">Genel Sayfa Metinleri ({currentLang.toUpperCase()})</Card.Header>
//             <Card.Body>
//               <Form.Group className="mb-3">
//                 <Form.Label>Sayfa Başlığı</Form.Label>
//                 <Form.Control type="text" value={homePageData.page_title?.[currentLang] || ''} onChange={e => handleMultiLangChange('page_title', null, e.target.value)} />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Sayfa Alt Başlığı</Form.Label>
//                 <Form.Control as="textarea" rows={2} value={homePageData.page_subtitle?.[currentLang] || ''} onChange={e => handleMultiLangChange('page_subtitle', null, e.target.value)} />
//               </Form.Group>
//             </Card.Body>
//           </Card>

//           {/* SLIDER YÖNETİMİ KARTI (YENİ TASARIM) */}
//           <Card className="mb-4">
//             <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
//               <span>Hero Slider</span>
//               <Button variant="success" size="sm" onClick={handleOpenNewSlideModal}>
//                 <FaPlus /> Yeni Slayt Ekle
//               </Button>
//             </Card.Header>
//             <ListGroup variant="flush">
//               {homePageData.heroSlides?.length === 0 && <ListGroup.Item>Henüz slayt eklenmemiş.</ListGroup.Item>}
//               {homePageData.heroSlides?.map((slide, index) => (
//                 <ListGroup.Item key={slide.slider_id || slide._id || index} className="d-flex justify-content-between align-items-center p-3">
//                   <div className="d-flex align-items-center">
//                     <img src={getFullImagePath(slide.image)} alt="Slide" className="img-thumbnail me-3" style={{ width: '80px', height: '50px', objectFit: 'cover' }} />
//                     <div>
//                       <h6 className="mb-0">{slide.title?.[currentLang] || 'Başlıksız Slayt'}</h6>
//                       <small className="text-muted">{slide.subtitle?.[currentLang] || 'Alt başlık yok'}</small>
//                     </div>
//                   </div>
//                   <div>
//                     <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEditSlideModal(slide, index)}>
//                       <FaEdit /> Düzenle
//                     </Button>
//                     <Button variant="outline-danger" size="sm" onClick={() => deleteArrayItem('heroSlides', index)}>
//                       <FaTrash />
//                     </Button>
//                   </div>
//                 </ListGroup.Item>
//               ))}
//             </ListGroup>
//           </Card>
          
//            {/* KATEGORİ VE ÜRÜN YÖNETİMİ */}
//           <Card>
//             <Card.Header as="h5">Anasayfa Kategorileri ve Ürünleri</Card.Header>
//             <Card.Body>
//               {homePageData.categories?.map((cat) => (
//                 <div key={cat.category_key} className="p-3 border rounded mb-3">
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <h6 className="mb-0">{cat.title?.[currentLang] || cat.category_key} <Badge pill bg="secondary">{cat.products?.length || 0} ürün</Badge></h6>
//                     <Button variant="outline-primary" size="sm" onClick={() => openAddProductModal(cat.category_key)}><FaPlus /> Ürün Ekle</Button>
//                   </div>
//                   <Row>
//                     {(cat.products || []).map(product => (
//                       <Col key={`${cat.category_key}-${product.product_id}`} xs={6} md={4} lg={3} className="mb-2">
//                         <Card className="h-100">
//                           <Card.Img variant="top" src={getFullImagePath(product.image)} style={{ height: '80px', objectFit: 'cover' }} />
//                           <Card.Body className="p-2 position-relative">
//                             <Card.Title style={{ fontSize: '0.8rem', marginBottom: '25px' }}>
//                               {product.translations?.tr?.name || 'İsimsiz Ürün'}
//                             </Card.Title>
//                             <Button
//                               variant="danger"
//                               size="sm"
//                               className="position-absolute"
//                               style={{ bottom: '5px', right: '5px' }}
//                               onClick={() => removeProductFromCategory(cat.category_key, product.product_id)}
//                             >
//                               <FaTimes />
//                             </Button>
//                           </Card.Body>
//                         </Card>
//                       </Col>
//                     ))}
//                   </Row>
//                 </div>
//               ))}
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col xl={4}>
//           {/* BANNER KARTI */}
//           <Card className="mb-4">
//             <Card.Header as="h5">Özel Banner ({currentLang.toUpperCase()})</Card.Header>
//             <Card.Body>
//                 <div className="text-center mb-2">
//                    <img src={getFullImagePath(homePageData.banner?.image)} alt="Banner" className="img-fluid rounded" style={{maxHeight: '150px'}} />
//                 </div>
//                  <Button className="w-100 mb-3" variant="outline-secondary" size="sm" onClick={() => openImageModal({ type: 'banner', isModal: false })}>
//                     <FaImage /> Banner Resmini Değiştir
//                 </Button>
//               <Form.Group className="mb-2">
//                 <Form.Label>Başlık</Form.Label>
//                 <Form.Control size="sm" value={homePageData.banner?.title?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'title', e.target.value)} />
//               </Form.Group>
//               <Form.Group className="mb-2">
//                 <Form.Label>Açıklama</Form.Label>
//                 <Form.Control size="sm" as="textarea" rows={2} value={homePageData.banner?.desc?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'desc', e.target.value)} />
//               </Form.Group>
//               <Form.Group>
//                 <Form.Label>Buton Metni</Form.Label>
//                 <Form.Control size="sm" value={homePageData.banner?.cta?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'cta', e.target.value)} />
//               </Form.Group>
//             </Card.Body>
//           </Card>

//           {/* AVANTAJLAR VE ISTATISTIKLER */}
//           <Card className="mb-4">
//             <Card.Header as="h5" className="d-flex justify-content-between align-items-center"><span>Avantajlar</span><Button variant="success" size="sm" onClick={() => addArrayItem('advantages', newAdvantageTemplate)}><FaPlus /></Button></Card.Header>
//             <ListGroup variant="flush">
//               {homePageData.advantages?.map((item, index) => (
//                 <ListGroup.Item key={index}><InputGroup><Form.Control style={{ flex: '0 0 50px' }} placeholder="✨" value={item.icon || ''} onChange={e => handleArrayChange('advantages', index, 'icon', e.target.value)} /><Form.Control placeholder={`Metin (${currentLang.toUpperCase()})`} value={item.text?.[currentLang] || ''} onChange={e => handleArrayChange('advantages', index, 'text', e.target.value, true)} /><Button variant="outline-danger" onClick={() => deleteArrayItem('advantages', index)}><FaTrash /></Button></InputGroup></ListGroup.Item>
//               ))}
//             </ListGroup>
//           </Card>

//           <Card>
//             <Card.Header as="h5" className="d-flex justify-content-between align-items-center"><span>İstatistikler</span><Button variant="success" size="sm" onClick={() => addArrayItem('stats', newStatTemplate)}><FaPlus /></Button></Card.Header>
//             <ListGroup variant="flush">
//               {homePageData.stats?.map((item, index) => (
//                 <ListGroup.Item key={index}><InputGroup><Form.Control placeholder="Değer" value={item.value || ''} onChange={e => handleArrayChange('stats', index, 'value', e.target.value)} /><Form.Control placeholder={`Açıklama (${currentLang.toUpperCase()})`} value={item.desc?.[currentLang] || ''} onChange={e => handleArrayChange('stats', index, 'desc', e.target.value, true)} /><Button variant="outline-danger" onClick={() => deleteArrayItem('stats', index)}><FaTrash /></Button></InputGroup></ListGroup.Item>
//               ))}
//             </ListGroup>
//           </Card>
//         </Col>
//       </Row>

//       {/* === MODALLAR === */}
      
//       {/* YENİ Slayt Ekleme/Düzenleme Modalı */}
//       <Modal show={showSlideModal} onHide={() => setShowSlideModal(false)} size="lg" backdrop="static">
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {isEditingSlide ? 'Slaytı Düzenle' : 'Yeni Slayt Ekle'} ({currentLang.toUpperCase()})
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {currentSlide && (
//             <Form>
//                 <Row>
//                     <Col md={4}>
//                         <Form.Label>Slayt Resmi</Form.Label>
//                         <div className="text-center border p-2 rounded">
//                             <img src={getFullImagePath(currentSlide.image)} alt="Slide Preview" className="img-fluid mb-2" />
//                             <Button variant="outline-secondary" size="sm" className="w-100" onClick={() => openImageModal({type: 'heroSlides', isModal: true})}>
//                                <FaImage /> Resmi Değiştir
//                             </Button>
//                         </div>
//                     </Col>
//                     <Col md={8}>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Başlık</Form.Label>
//                             <Form.Control type="text" placeholder="Slayt başlığı..." value={currentSlide.title[currentLang] || ''} onChange={(e) => handleSlideChange('title', e.target.value, true)} />
//                         </Form.Group>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Alt Başlık</Form.Label>
//                             <Form.Control as="textarea" rows={3} placeholder="Slayt için kısa açıklama..." value={currentSlide.subtitle[currentLang] || ''} onChange={(e) => handleSlideChange('subtitle', e.target.value, true)} />
//                         </Form.Group>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Buton Metni</Form.Label>
//                             <Form.Control type="text" placeholder="Örn: Şimdi İncele" value={currentSlide.cta[currentLang] || ''} onChange={(e) => handleSlideChange('cta', e.target.value, true)} />
//                         </Form.Group>
//                     </Col>
//                 </Row>
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowSlideModal(false)}>İptal</Button>
//           <Button variant="primary" onClick={handleSaveSlide}>
//             <FaSave /> {isEditingSlide ? 'Değişiklikleri Kaydet' : 'Slaytı Ekle'}
//           </Button>
//         </Modal.Footer>
//       </Modal>


//       {/* Ürün Ekleme Modalı */}
//       <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
//         <Modal.Header closeButton><Modal.Title>Kategoriye Ürün Ekle</Modal.Title></Modal.Header>
//         <Modal.Body>
//           <InputGroup className="mb-3"><InputGroup.Text><FaSearch /></InputGroup.Text><FormControl placeholder="Aramak için ürün adı yazın..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></InputGroup>
//           <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
//             {getAvailableProducts().length === 0 && <ListGroup.Item disabled>Eklenecek uygun ürün bulunamadı.</ListGroup.Item>}
//             {getAvailableProducts().map(p => (<ListGroup.Item key={p._id} action onClick={() => addProductToCategory(p)} className="d-flex justify-content-between align-items-center"><span><img src={getFullImagePath(p.image)} alt={p.translations?.tr?.name} width="40" height="40" style={{ objectFit: 'cover', marginRight: '10px' }} />{p.translations?.tr?.name || 'İsimsiz'}</span><Badge bg="primary" pill>{p.price} TL</Badge></ListGroup.Item>))}
//           </ListGroup>
//         </Modal.Body>
//       </Modal>

//       {/* Resim Yükleme Modalı */}
//       <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="md">
//         <Modal.Header closeButton><Modal.Title>Resim Yükle</Modal.Title></Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Bilgisayarınızdan bir resim dosyası seçin</Form.Label>
//             <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
//           </Form.Group>
//           {imagePreview && <div className="text-center mb-3"><img src={getFullImagePath(imagePreview)} alt="Önizleme" className="img-fluid" style={{ maxHeight: '200px' }} /></div>}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowImageModal(false)}>İptal</Button>
//           <Button variant="primary" onClick={saveImage} disabled={!imagePreview}><FaSave /> Seçili Resmi Kullan</Button>
//         </Modal.Footer>
//       </Modal>

//     </Container>
//   );
// };

// export default AdminHome;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaImage, FaUpload } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
// Anasayfa verisi boş gelirse diye yeni veri yapısına uygun varsayılan yapı
const initialData = {
  page_title: { tr: '', en: '' },
  page_subtitle: { tr: '', en: '' },
  view_all: { tr: '', en: '' },
  featured_products: { tr: '', en: '' },
  best_sellers: { tr: '', en: '' },
  loading: { tr: '', en: '' },
  heroSlides: [],
  banner: {
    image: "",
    title: { tr: '', en: '' },
    desc: { tr: '', en: '' },
    cta: { tr: '', en: '' },
    cta_link: { tr: '', en: '' }
  },
  advantages: [],
  stats: [],
  categories: [],
};



// Yeni bir slayt/avantaj/istatistik eklerken kullanılacak şablonlar
const newSlideTemplate = {
  slider_id: uuidv4(),
  image: '',
  title: { tr: '', en: '' },
  subtitle: { tr: '', en: '' },
  cta: { tr: '', en: '' },
  cta_link: { tr: '', en: '' }
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

// YENİ EKLENEN STATE'LER
const [showSlideModal, setShowSlideModal] = useState(false);
const [currentSlide, setCurrentSlide] = useState(null); // Düzenlenen veya yeni eklenen slaytı tutacak
const [isEditingSlide, setIsEditingSlide] = useState(false); // Modal'ın 
  // Yeni eklenen state: Hangi dilde düzenleme yapıldığını tutar
  const [currentLang, setCurrentLang] = useState('tr');

  // Modal Yönetimi
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState('');
  const [currentImageField, setCurrentImageField] = useState({ type: '', index: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const [selectedSlideContext, setSelectedSlideContext] = useState({
    homePageId: '',
    sliderId: '',
    arrayKey: '',
    index: null
  });


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
  // AdminHome.js

  const handleSave = async () => {
    if (!homePageData._id) {
      alert("Hata: Kaydedilecek veri ID'si yok.");
      return;
    }

    // Göndermeden önce veriyi temizleyelim
    const dataToSend = JSON.parse(JSON.stringify(homePageData)); // Derin kopya alarak orijinal state'i bozmuyoruz

    // Her slider'dan sadece frontend'de kullandığımız geçici ID'yi kaldıralım.
    // Backend kendi _id'sini zaten oluşturacak.
    if (dataToSend.heroSlides) {
      dataToSend.heroSlides.forEach(slide => {
        // Backend'e gereksiz olan slider_id'yi siliyoruz.
        // Sadece gerçekten MongoDB tarafından oluşturulmamışsa (ObjectID değilse) silmek daha güvenli.
        if (slide.slider_id && !/^[0-9a-fA-F]{24}$/.test(slide.slider_id)) {
          delete slide.slider_id;
        }

        // Eğer varsa subdocument'in _id'sini de koruyalım, ama genelde bu
        // frontend'de olmaz. `delete slide.slider_id` daha basit ve yeterli olabilir.
      });
    }
    // ...
    // --- SLIDER MODAL YÖNETİMİ ---
    // Yeni Slayt Ekleme Modalı'nı açar
    const handleOpenNewSlideModal = () => {
      setCurrentSlide({ ...newSlideTemplate, slider_id: uuidv4() }); // Boş şablon ve geçici ID ile başlat
      setIsEditingSlide(false); // Ekleme modunda
      setShowSlideModal(true);
    };

    // Mevcut Slaytı Düzenleme Modalı'nı açar (Bunu daha sonra isterseniz bir "Düzenle" butonu ile bağlayabilirsiniz)
    const handleOpenEditSlideModal = (slide, index) => {
      setCurrentSlide({ ...slide, index }); // index'i de ekleyelim
      setIsEditingSlide(true); // Düzenleme modunda
      setShowSlideModal(true);
    };


    // Modal içindeki slayt bilgilerini günceller
    const handleSlideChange = (field, value, isMultiLang = false) => {
      setCurrentSlide(prev => {
        if (isMultiLang) {
          return {
            ...prev,
            [field]: {
              ...prev[field],
              [currentLang]: value
            }
          };
        }
        return { ...prev, [field]: value };
      });
    };


    // Modal'daki "Kaydet" butonu
    const handleSaveSlide = () => {
      if (isEditingSlide) {
        // Düzenleme modundaysa, ana state'teki slaytı güncelle
        const indexToUpdate = currentSlide.index;
        delete currentSlide.index; // index'i objeden temizle
        const updatedSlides = [...homePageData.heroSlides];
        updatedSlides[indexToUpdate] = currentSlide;
        setHomePageData(prev => ({ ...prev, heroSlides: updatedSlides }));
      } else {
        // Ekleme modundaysa, yeni slaytı ana state'e ekle
        setHomePageData(prev => ({
          ...prev,
          heroSlides: [...(prev.heroSlides || []), currentSlide]
        }));
      }
      setShowSlideModal(false); // Modalı kapat
      setCurrentSlide(null);   // Geçici slayt verisini temizle
    };

    // ...

    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/admin/home/${homePageData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend), // Temizlenmiş veriyi gönderiyoruz
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Bir hata oluştu.');

      // Sayfayı backend'den gelen son haliyle güncellemek her zaman en iyisidir.
      if (result.updatedData) {
        // Frontend ve backend verilerini senkronize tutar.
        // Yeni eklenen slider'lar artık veritabanından gelen _id'ye sahip olacak.
        setHomePageData(result.updatedData);
      }

      setStatusMessage({
        show: true,
        message: 'Veriler başarıyla kaydedildi!',
        type: 'success'
      });

      return true;

    } catch (err) {
      console.error("Save error:", err);
      setStatusMessage({
        show: true,
        message: 'Kaydetme hatası: ' + err.message,
        type: 'danger'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Yeni slayt eklerken placeholder resim ile ekle
  const addSlideWithPlaceholder = () => {
    const newSlideWithId = {
      ...newSlideTemplate,
      slider_id: uuidv4(), // Her zaman yeni ID oluştur
      image: '/images/placeholder-slide.jpg'
    };

    setHomePageData(prev => ({
      ...prev,
      heroSlides: [...(prev.heroSlides || []), newSlideWithId]
    }));

    setStatusMessage({
      show: true,
      message: 'Yeni slider eklendi. Kaydetmeyi unutmayın!',
      type: 'info'
    });
  };

  // --- RESIM YÖNETİMİ ---
  const openImageModal = (type, index = null) => {
    let sliderId = null;
    let homePageId = homePageData._id;

    if (type === 'heroSlides' && index !== null) {
      sliderId = homePageData.heroSlides?.[index]?.slider_id || null;
    }

    setCurrentImageField({ type, index, sliderId, homePageId });
    setShowImageModal(true);
    setImagePreview('');
  };


  // handleImageUpload fonksiyonunu güncellendi - sliderId otomatik olarak bulunuyor
  // ESKİ handleImageUpload FONKSİYONUNUN YERİNE BU YAZILACAK:

  // AdminHome.js içindeki ESKİ handleImageUpload fonksiyonunu SİLİP,
  // yerine AŞAĞIDAKİ YENİ fonksiyonu yapıştırın:

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Değişiklik burada: Artık ID göndermeyen, sadece resim yükleyen bir adrese istek atıyoruz.
      const response = await fetch(`http://localhost:5000/admin/home/upload-image`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        // Backend'den gelen resim yolunu alıp önizlemeye koyuyoruz.
        setImagePreview(result.imagePath);
      } else {
        throw new Error(result.message || 'Resim yüklenemedi.');
      }
    } catch (err) {
      setStatusMessage({
        show: true,
        message: 'Resim yükleme hatası: ' + err.message,
        type: 'danger'
      });
    }
  };



  // Yeni slider ekleme fonksiyonu (asenkron olarak güncellendi)
  const addNewSlider = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/hero-slider', {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Backend hatası');

      const newSlide = await response.json();

      setHomePageData(prev => ({
        ...prev,
        heroSlides: [...prev.heroSlides, newSlide]
      }));

    } catch (err) {
      setStatusMessage({
        show: true,
        message: 'Slider eklenemedi: ' + err.message,
        type: 'danger'
      });
    }
  };

  //saveImage fonksiyonu
  const saveImage = async () => {
    if (!imagePreview) return;

    const { type, index } = currentImageField;

    if (type === 'heroSlides') {
      handleArrayChange('heroSlides', index, 'image', imagePreview);
    }

    setShowImageModal(false);
    setImagePreview('');

    setStatusMessage({
      show: true,
      message: 'Resim başarıyla eklendi!',
      type: 'success'
    });
  };


  // --- YARDIMCI FONKSİYONLAR (GÜNCELLEME & SİLME) ---
  const handleMultiLangChange = (field, subField, value) => {
    setHomePageData(prev => {
      if (subField) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [subField]: {
              ...prev[field][subField],
              [currentLang]: value
            }
          }
        };
      }
      return {
        ...prev,
        [field]: {
          ...prev[field],
          [currentLang]: value
        }
      };
    });
  };

  const handleArrayChange = (arrayName, index, field, value, isMultiLang = false) => {
    setHomePageData(prev => {
      const newArray = [...prev[arrayName]];
      if (isMultiLang) {
        newArray[index] = {
          ...newArray[index],
          [field]: {
            ...newArray[index][field],
            [currentLang]: value
          }
        };
      } else {
        newArray[index] = { ...newArray[index], [field]: value };
      }
      return { ...prev, [arrayName]: newArray };
    });
  };


  //addArrayItem fonksiyonu
  const addArrayItem = (arrayName, newItemTemplate) => {
    setHomePageData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), newItemTemplate]
    }));
  };

  //DeleteArrayItem fonksiyonu
  const deleteArrayItem = async (arrayName, index, slide) => {
    if (!window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;
    const itemId = slide.slider_id;


    try {

      const response = await fetch(`http://localhost:5000/admin/hero-slider/${index}/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        alert("Silme işlemi başarısız: " + (error.message || "Sunucu hatası"));
        return;
      }

      setHomePageData(prev => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index)
      }));
    } catch (error
    ) {
      console.error("Silme hatası:", error);
      alert("Sunucuya ulaşılamadı.");
    }
  };

  // *** DÜZELTME: Kategori silme işleminde yanlış filtreleme yapılıyordu ***
  const removeProductFromCategory = (categoryKey, productId) => {
    if (!window.confirm("Bu ürünü kategoriden kaldırmak istediğinizden emin misiniz?")) return;

    console.log('Silinecek ürün:', { categoryKey, productId }); // Debug için

    setHomePageData(prev => {
      const updatedCategories = prev.categories.map(cat => {
        if (cat.category_key === categoryKey) {
          const currentProducts = cat.products || [];
          console.log('Mevcut ürünler:', currentProducts); // Debug için

          const filteredProducts = currentProducts.filter(p => {
            console.log('Karşılaştırma:', p.product_id, '!==', productId); // Debug için
            return p.product_id !== productId;
          });

          console.log('Filtreli ürünler:', filteredProducts); // Debug için

          return {
            ...cat,
            products: filteredProducts
          };
        }
        return cat;
      });

      console.log('Güncellenmiş kategoriler:', updatedCategories); // Debug için
      return { ...prev, categories: updatedCategories };
    });
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
      .filter(p => p.category_key === currentCategoryKey)
      .filter(p => !currentProductIds.has(p._id))
      .filter(p => (p.translations?.tr?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  };

  // --- YÜKLEME VE HATA DURUMLARI ---
  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /><h4>Yükleniyor...</h4></Container>;
  if (error && !homePageData._id) return <Container className="mt-5"><Alert variant="danger">Hata: {error}</Alert></Container>;

  return (
    <Container fluid className="p-3 p-md-4">
      {/* ÜST BAR */}
      <Row className="mb-4 align-items-center bg-light p-3 rounded sticky-top shadow-sm" style={{ top: '60px', zIndex: 1020 }}>
        <Col>
          <h2 className="mb-0">Anasayfa Yönetimi</h2>
        </Col>
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
          {/* ANA AYARLAR KARTI */}
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

          {/* SLIDER YÖNETİMİ KARTI */}
          <Card className="mb-4">
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
              <span>Hero Slider</span>

              <Button variant="success" size="sm" onClick={() => addArrayItem('heroSlides', newSlideTemplate)}>
                <FaPlus /> Yeni Slayt Ekle
              </Button>

            </Card.Header>
            <ListGroup variant="flush">
              {homePageData.heroSlides?.map((slide, index) => (
                <ListGroup.Item key={index} className="p-3">
                  <Row>
                    <Col md={10}>
                      <InputGroup className="mb-2">
                        <InputGroup.Text style={{ width: '100px' }}>Başlık ({currentLang.toUpperCase()})</InputGroup.Text>
                        <Form.Control placeholder="Slayt Başlığı" value={slide.title?.[currentLang] || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'title', e.target.value, true)} />
                      </InputGroup>
                      <InputGroup className="mb-2">
                        <InputGroup.Text style={{ width: '100px' }}>Alt Başlık</InputGroup.Text>
                        <Form.Control placeholder="Slayt Alt Başlığı" value={slide.subtitle?.[currentLang] || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'subtitle', e.target.value, true)} />
                      </InputGroup>
                      <InputGroup className="mb-2">
                        <InputGroup.Text style={{ width: '100px' }}>Resim</InputGroup.Text>
                        <Form.Control size="sm" placeholder="/images/ornek.jpg" value={slide.image || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'image', e.target.value)} />
                        <Button variant="outline-secondary" onClick={() => openImageModal('heroSlides', index)}>
                          <FaImage /> Resim Seç
                        </Button>
                      </InputGroup>
                      <InputGroup className="mb-2">
                        <InputGroup.Text style={{ width: '100px' }}>Buton Yazısı</InputGroup.Text>
                        <Form.Control size="sm" placeholder="Keşfet" value={slide.cta?.[currentLang] || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'cta', e.target.value, true)} />
                      </InputGroup>

                    </Col>
                    <Col md={2} className="d-flex align-items-center justify-content-center flex-column">
                      {slide.image && (
                        <img src={slide.image} alt="Slide" className="img-thumbnail mb-2" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                      )}
                      <Button variant="outline-danger" size="sm" onClick={() => deleteArrayItem('heroSlides', index, slide)}>
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
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
                          <Card.Img variant="top" src={product.image} style={{ height: '80px', objectFit: 'cover' }} />
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
                <Form.Control size="sm" value={homePageData.banner?.desc?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'desc', e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Buton Metni</Form.Label>
                <Form.Control size="sm" value={homePageData.banner?.cta?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'cta', e.target.value)} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Buton Link</Form.Label>
                <Form.Control size="sm" value={homePageData.banner?.cta_link?.[currentLang] || ''} onChange={(e) => handleMultiLangChange('banner', 'cta_link', e.target.value)} />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* AVANTAJLAR KARTI */}
          <Card className="mb-4">
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
              <span>Avantajlar</span>
              <Button variant="success" size="sm" onClick={() => addArrayItem('advantages', newAdvantageTemplate)}><FaPlus /></Button>
            </Card.Header>
            <ListGroup variant="flush">
              {homePageData.advantages?.map((item, index) => (
                <ListGroup.Item key={index}>
                  <InputGroup>
                    <Form.Control style={{ flex: '0 0 50px' }} placeholder="İkon" value={item.icon || ''} onChange={e => handleArrayChange('advantages', index, 'icon', e.target.value)} />
                    <Form.Control placeholder={`Metin (${currentLang.toUpperCase()})`} value={item.text?.[currentLang] || ''} onChange={e => handleArrayChange('advantages', index, 'text', e.target.value, true)} />
                    <Button variant="outline-danger" onClick={() => deleteArrayItem('advantages', index)}><FaTrash /></Button>
                  </InputGroup>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {/* ISTATISTIKLER KARTI */}
          <Card className="mb-4">
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
              <span>İstatistikler</span>
              <Button variant="success" size="sm" onClick={() => addArrayItem('stats', newStatTemplate)}><FaPlus /></Button>
            </Card.Header>
            <ListGroup variant="flush">
              {homePageData.stats?.map((item, index) => (
                <ListGroup.Item key={index}>
                  <InputGroup>
                    <Form.Control placeholder="Değer (örn: 10.000+)" value={item.value || ''} onChange={e => handleArrayChange('stats', index, 'value', e.target.value)} />
                    <Form.Control placeholder={`Açıklama (${currentLang.toUpperCase()})`} value={item.desc?.[currentLang] || ''} onChange={e => handleArrayChange('stats', index, 'desc', e.target.value, true)} />
                    <Button variant="outline-danger" onClick={() => deleteArrayItem('stats', index)}><FaTrash /></Button>
                  </InputGroup>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Ürün Ekleme Modalı */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Kategoriye Ürün Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <FormControl placeholder="Eklemek için ürün ara (Türkçe isme göre)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
          <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {getAvailableProducts().map(p => (
              <ListGroup.Item key={p._id} action onClick={() => addProductToCategory(p)} className="d-flex justify-content-between align-items-center">
                <span>
                  <img src={p.image} alt={p.translations?.tr?.name} width="40" height="40" style={{ objectFit: 'cover', marginRight: '10px' }} />
                  {p.translations?.tr?.name || 'İsimsiz Ürün'}
                </span>
                <Badge bg="primary" pill>{p.price} TL</Badge>
              </ListGroup.Item>
            ))}
            {getAvailableProducts().length === 0 && <ListGroup.Item disabled>Bu kategoriye eklenebilecek uygun ürün bulunamadı veya arama sonucu boş.</ListGroup.Item>}
          </ListGroup>
        </Modal.Body>
      </Modal>

      {/* Resim Yükleme Modalı */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Resim Seç</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Resim Yükle</Form.Label>
            {/* <Form.Control type="file" accept="image/*" onChange={handleImageUpload} /> */}
            <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
          </Form.Group>

          {imagePreview && (
            <div className="text-center mb-3">
              <img src={imagePreview} alt="Önizleme" className="img-fluid" style={{ maxHeight: '200px' }} />
            </div>
          )}


        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            İptal
          </Button>
          <Button variant="primary" onClick={saveImage} disabled={!imagePreview}>
            <FaSave /> Resmi Kaydet
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminHome;