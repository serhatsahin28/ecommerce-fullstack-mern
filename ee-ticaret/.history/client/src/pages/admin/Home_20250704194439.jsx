import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Row, Col, Card, Button, Form, Modal,
    Alert, Spinner, ListGroup, InputGroup, FormControl, Badge
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit, FaSave, FaSearch, FaTimes } from 'react-icons/fa';

// Anasayfa verisi boş gelirse veya yüklenemezse diye varsayılan boş bir yapı
const initialData = {
    page_title: '',
    page_subtitle: '',
    heroSlides: [],
    banner: { title: '', desc: '', cta: '', cta_link: '' },
    advantages: [],
    stats: [],
    categories: [],
};

const AdminHome = () => {
    // --- STATE YÖNETİMİ ---
    const [homePageData, setHomePageData] = useState(initialData);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ show: false, message: '', type: 'success' });
    
    // Modal Yönetimi
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    // Kategoriye Ürün Ekleme Modalı
    const [showProductModal, setShowProductModal] = useState(false);
    const [currentCategoryKey, setCurrentCategoryKey] = useState('');
    const [searchTerm, setSearchTerm] = useState('');


    // --- VERİ ÇEKME ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:5000/admin/homeList');
            if (!response.ok) throw new Error('Sunucu verileri alınamadı.');
            const result = await response.json();

            if (result.homeData && result.homeData.length > 0) {
                setHomePageData(result.homeData[0]);
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
            if (!response.ok) throw new Error(result.message);
            setStatusMessage({ show: true, message: result.message, type: 'success' });
        } catch (err) {
            setStatusMessage({ show: true, message: err.message, type: 'danger' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatusMessage({ show: false, message: '' }), 4000);
        }
    };
    

    // --- YARDIMCI FONKSİYONLAR (GÜNCELLEME & SİLME) ---

    // Basit text inputları için
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setHomePageData(prev => ({ ...prev, [name]: value }));
    };

    // İç içe geçmiş objeler için (örn: banner)
    const handleNestedChange = (parent, field, value) => {
        setHomePageData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };
    
    // Dizi elemanlarını yönetmek için genel fonksiyonlar
    const handleArrayChange = (arrayName, index, field, value) => {
        setHomePageData(prev => {
            const newArray = [...prev[arrayName]];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [arrayName]: newArray };
        });
    };

    const addArrayItem = (arrayName, newItem) => {
        setHomePageData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], newItem]
        }));
    };

    const deleteArrayItem = (arrayName, index) => {
        if (!window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;
        setHomePageData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };
    
    // Kategoriden ürün silme
    const removeProductFromCategory = (categoryKey, productId) => {
        setHomePageData(prev => ({
            ...prev,
            categories: prev.categories.map(cat => 
                cat.category_key === categoryKey 
                ? { ...cat, products: cat.products.filter(p => p._id !== productId) } 
                : cat
            )
        }));
    }

    // Ürün ekleme modalını açar
    const openAddProductModal = (key) => {
        setCurrentCategoryKey(key);
        setShowProductModal(true);
    };

    // Seçilen ürünü kategoriye ekler
    const addProductToCategory = (product) => {
        setHomePageData(prev => {
            const newCategories = prev.categories.map(cat => {
                if(cat.category_key === currentCategoryKey) {
                    // Ürün zaten var mı diye kontrol et
                    if (cat.products.some(p => p._id === product._id)) {
                        alert("Bu ürün zaten kategoride mevcut.");
                        return cat;
                    }
                    return { ...cat, products: [...cat.products, product]};
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
      if(!currentCategory) return [];

      const currentProductIds = new Set(currentCategory.products.map(p => p._id));
      
      return allProducts
          .filter(p => p.category_key === currentCategoryKey) // Sadece ilgili kategori ürünleri
          .filter(p => !currentProductIds.has(p._id)) // Henüz eklenmemiş olanlar
          .filter(p => (p.translations?.tr?.name || '').toLowerCase().includes(searchTerm.toLowerCase())); // Arama ile eşleşenler
    };

    // --- YÜKLEME VE HATA DURUMLARI ---
    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /><h4>Yükleniyor...</h4></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">Hata: {error}</Alert></Container>;

    
    return (
        <Container fluid className="p-3 p-md-4">
            {/* ÜST BAR: BAŞLIK VE KAYDET BUTONU */}
            <Row className="mb-4 align-items-center bg-light p-3 rounded sticky-top shadow-sm" style={{top: 0, zIndex: 1020}}>
                <Col>
                    <h2 className="mb-0">Anasayfa Yönetimi</h2>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                        <FaSave className="me-2" />
                        {isSaving ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}
                    </Button>
                </Col>
            </Row>

            {/* DURUM BİLDİRİM MESAJI */}
            {statusMessage.show && (
                 <Alert variant={statusMessage.type} onClose={() => setStatusMessage({show: false})} dismissible>
                    {statusMessage.message}
                 </Alert>
            )}

            <Row>
                <Col xl={8} className="mb-4">
                     {/* ANA AYARLAR KARTI */}
                     <Card className="mb-4">
                        <Card.Header as="h5">Genel Sayfa Ayarları</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Sayfa Başlığı</Form.Label>
                                <Form.Control type="text" name="page_title" value={homePageData.page_title} onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Sayfa Alt Başlığı</Form.Label>
                                <Form.Control as="textarea" rows={3} name="page_subtitle" value={homePageData.page_subtitle} onChange={handleInputChange} />
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* SLIDER YÖNETİMİ KARTI */}
                    <Card className="mb-4">
                         <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                            <span>Hero Slider</span>
                            <Button variant="success" size="sm" onClick={() => addArrayItem('heroSlides', { image: '', title: '', subtitle: '', cta: '', cta_link: '' })}>
                                <FaPlus /> Yeni Slayt Ekle
                            </Button>
                         </Card.Header>
                         <ListGroup variant="flush">
                            {homePageData.heroSlides.map((slide, index) => (
                                <ListGroup.Item key={index}>
                                    <Row className="align-items-center">
                                        <Col>
                                            <Form.Control className="mb-2" placeholder="Slayt Başlığı" value={slide.title} onChange={(e) => handleArrayChange('heroSlides', index, 'title', e.target.value)} />
                                            <Form.Control size="sm" placeholder="Resim URL" value={slide.image} onChange={(e) => handleArrayChange('heroSlides', index, 'image', e.target.value)} />
                                        </Col>
                                        <Col xs="auto">
                                            <Button variant="outline-danger" size="sm" onClick={() => deleteArrayItem('heroSlides', index)}><FaTrash /></Button>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                         </ListGroup>
                    </Card>
                     
                     {/* KATEGORİ VE ÜRÜN YÖNETİMİ */}
                     <Card>
                        <Card.Header as="h5">Kategoriler ve Ürünler</Card.Header>
                        <Card.Body>
                            {homePageData.categories.map((cat, catIndex) => (
                                <div key={cat.category_key} className="p-3 border rounded mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0">{cat.title} <Badge pill bg="secondary">{cat.products.length} ürün</Badge></h6>
                                        <Button variant="outline-primary" size="sm" onClick={() => openAddProductModal(cat.category_key)}><FaPlus/> Ürün Ekle</Button>
                                    </div>
                                    <Row>
                                        {cat.products.map(product => (
                                            <Col key={product._id} xs={6} md={4} lg={3} className="mb-2">
                                                <Card className="h-100">
                                                    <Card.Img variant="top" src={product.image} style={{height: '80px', objectFit: 'cover'}}/>
                                                    <Card.Body className="p-2 position-relative">
                                                        <Card.Title style={{fontSize: '0.8rem', marginBottom: '20px'}}>{product.translations.tr.name}</Card.Title>
                                                        <Button variant="danger" size="sm" style={{position:'absolute', bottom:'5px', right:'5px'}} onClick={() => removeProductFromCategory(cat.category_key, product._id)}>
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
                         <Card.Header as="h5">Özel Banner</Card.Header>
                         <Card.Body>
                            <Form.Group className="mb-2">
                                <Form.Label>Başlık</Form.Label>
                                <Form.Control size="sm" value={homePageData.banner.title} onChange={(e) => handleNestedChange('banner', 'title', e.target.value)}/>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Açıklama</Form.Label>
                                <Form.Control size="sm" value={homePageData.banner.desc} onChange={(e) => handleNestedChange('banner', 'desc', e.target.value)}/>
                            </Form.Group>
                             <Form.Group className="mb-2">
                                <Form.Label>Buton Metni</Form.Label>
                                <Form.Control size="sm" value={homePageData.banner.cta} onChange={(e) => handleNestedChange('banner', 'cta', e.target.value)}/>
                            </Form.Group>
                         </Card.Body>
                     </Card>

                      {/* AVANTAJLAR KARTI */}
                     <Card className="mb-4">
                         <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                            <span>Avantajlar</span>
                            <Button variant="success" size="sm" onClick={() => addArrayItem('advantages', {icon: '', text: ''})}><FaPlus /></Button>
                         </Card.Header>
                         <ListGroup variant="flush">
                             {homePageData.advantages.map((item, index) => (
                                <ListGroup.Item key={index}>
                                    <InputGroup>
                                        <Form.Control style={{flex: '0 0 50px'}} placeholder="İkon" value={item.icon} onChange={e => handleArrayChange('advantages', index, 'icon', e.target.value)} />
                                        <Form.Control placeholder="Metin" value={item.text} onChange={e => handleArrayChange('advantages', index, 'text', e.target.value)} />
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
                            <Button variant="success" size="sm" onClick={() => addArrayItem('stats', {value: '', desc: ''})}><FaPlus /></Button>
                         </Card.Header>
                          <ListGroup variant="flush">
                             {homePageData.stats.map((item, index) => (
                                <ListGroup.Item key={index}>
                                    <InputGroup>
                                        <Form.Control placeholder="Değer (örn: 10.000+)" value={item.value} onChange={e => handleArrayChange('stats', index, 'value', e.target.value)} />
                                        <Form.Control placeholder="Açıklama (örn: Mutlu Müşteri)" value={item.desc} onChange={e => handleArrayChange('stats', index, 'desc', e.target.value)} />
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
                        <InputGroup.Text><FaSearch/></InputGroup.Text>
                        <FormControl placeholder="Eklemek için ürün ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </InputGroup>
                    <ListGroup style={{maxHeight: '400px', overflowY: 'auto'}}>
                       {getAvailableProducts().map(p => (
                           <ListGroup.Item key={p._id} action onClick={() => addProductToCategory(p)} className="d-flex justify-content-between align-items-center">
                               {p.translations?.tr?.name || 'İsimsiz Ürün'}
                               <Badge bg="primary">{p.price} TL</Badge>
                           </ListGroup.Item>
                       ))}
                       {getAvailableProducts().length === 0 && <ListGroup.Item disabled>Bu kategoriye eklenebilecek uygun ürün bulunamadı.</ListGroup.Item>}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default AdminHome;