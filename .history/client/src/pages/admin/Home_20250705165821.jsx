import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Row, Col, Card, Button, Form, Modal,
    Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup, Image
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes } from 'react-icons/fa';

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
    const [currentLang, setCurrentLang] = useState('tr');
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
            alert("Hata: Kaydedilecek veri ID'si yok. Sayfayı yenileyip tekrar deneyin.");
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
            if (!response.ok) throw new Error(result.message || 'Bir hata oluştu.');
            setStatusMessage({ show: true, message: result.message, type: 'success' });
        } catch (err) {
            setStatusMessage({ show: true, message: err.message, type: 'danger' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatusMessage({ show: false, message: '' }), 4000);
        }
    };

    // --- YARDIMCI FONKSİYONLAR (GÜNCELLEME & SİLME) ---

    const handleMultiLangChange = (field, subField, value) => {
        setHomePageData(prev => {
            if (subField) {
                return {
                    ...prev,
                    [field]: {
                        ...prev[field],
                        [subField]: { ...prev[field][subField], [currentLang]: value }
                    }
                };
            }
            return {
                ...prev,
                [field]: { ...prev[field], [currentLang]: value }
            };
        });
    };

    const handleArrayChange = (arrayName, index, field, value, isMultiLang = false) => {
        setHomePageData(prev => {
            const newArray = [...prev[arrayName]];
            if (isMultiLang) {
                newArray[index] = {
                    ...newArray[index],
                    [field]: { ...newArray[index][field], [currentLang]: value }
                };
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

    // DİKKAT: Bu fonksiyonun mantığı doğru. Sorun yaşanıyorsa, veri yapısı veya key'lerde bir tutarsızlık olabilir.
    // Bu versiyonun doğru çalıştığından emin olabilirsiniz.
    const removeProductFromCategory = (categoryKey, productIdToRemove) => {
        setHomePageData(prev => {
            const updatedCategories = prev.categories.map(cat => {
                // Doğru kategoriyi bul
                if (cat.category_key === categoryKey) {
                    // Kategorideki ürünler dizisini filtrele, silinecek olanı dışarıda bırak
                    const updatedProducts = (cat.products || []).filter(
                        product => product.product_id !== productIdToRemove
                    );
                    return { ...cat, products: updatedProducts };
                }
                // Diğer kategorileri olduğu gibi bırak
                return cat;
            });

            return { ...prev, categories: updatedCategories };
        });
    };

    const openAddProductModal = (key) => {
        setCurrentCategoryKey(key);
        setShowProductModal(true);
        setSearchTerm('');
    };

    const addProductToCategory = (productToAdd) => {
        const productForHomePage = {
            product_id: productToAdd._id.toString(),
            stock: productToAdd.stock,
            price: productToAdd.price,
            rating: productToAdd.rating,
            image: productToAdd.image,
            images: productToAdd.images,
            translations: productToAdd.translations
        };

        setHomePageData(prev => {
            const newCategories = prev.categories.map(cat => {
                if (cat.category_key === currentCategoryKey) {
                    if ((cat.products || []).some(p => p.product_id === productToAdd._id)) {
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


    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /><h4>Yükleniyor...</h4></Container>;
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
                    <Button variant="success" onClick={handleSave} disabled={isSaving}>
                        <FaSave className="me-2" />
                        {isSaving ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}
                    </Button>
                </Col>
            </Row>

            {statusMessage.show && (
                <Alert variant={statusMessage.type} onClose={() => setStatusMessage({ show: false })} dismissible>
                    {statusMessage.message}
                </Alert>
            )}

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
                            <Button variant="primary" size="sm" onClick={() => addArrayItem('heroSlides', newSlideTemplate)}>
                                <FaPlus /> Yeni Slayt Ekle
                            </Button>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {homePageData.heroSlides?.map((slide, index) => (
                                <ListGroup.Item key={index} className="p-3">
                                    <Row className="g-3">
                                        <Col md={8}>
                                            <InputGroup className="mb-2">
                                                <InputGroup.Text style={{ width: '100px' }}>Başlık ({currentLang.toUpperCase()})</InputGroup.Text>
                                                <Form.Control placeholder="Slayt Başlığı" value={slide.title?.[currentLang] || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'title', e.target.value, true)} />
                                            </InputGroup>
                                            <InputGroup className="mb-2">
                                                <InputGroup.Text style={{ width: '100px' }}>Alt Başlık</InputGroup.Text>
                                                <Form.Control placeholder="Slayt Alt Başlığı" value={slide.subtitle?.[currentLang] || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'subtitle', e.target.value, true)} />
                                            </InputGroup>
                                            <InputGroup className="mb-2">
                                                <InputGroup.Text style={{ width: '100px' }}>Resim URL</InputGroup.Text>
                                                <Form.Control size="sm" placeholder="/images/ornek.jpg" value={slide.image || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'image', e.target.value)} />
                                            </InputGroup>
                                            <InputGroup className="mb-2">
                                                <InputGroup.Text style={{ width: '100px' }}>Buton Yazısı</InputGroup.Text>
                                                <Form.Control size="sm" placeholder="Keşfet" value={slide.cta?.[currentLang] || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'cta', e.target.value, true)} />
                                            </InputGroup>
                                            <InputGroup>
                                                <InputGroup.Text style={{ width: '100px' }}>Buton Link</InputGroup.Text>
                                                <Form.Control size="sm" placeholder="/kategori/urunler" value={slide.cta_link?.[currentLang] || ''} onChange={(e) => handleArrayChange('heroSlides', index, 'cta_link', e.target.value, true)} />
                                            </InputGroup>
                                        </Col>
                                        {/* YENİLİK: Resim Önizleme ve Silme Butonu için ayrı bir sütun */}
                                        <Col md={4} className="d-flex flex-column align-items-center justify-content-center">
                                            {slide.image && <Image src={slide.image} thumbnail fluid style={{ maxHeight: '100px', marginBottom: '10px' }} />}
                                            <Button variant="outline-danger" size="sm" onClick={() => deleteArrayItem('heroSlides', index)}>
                                                <FaTrash className="me-1" /> Slaytı Sil
                                            </Button>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>

                    <Card>
                        <Card.Header as="h5">Anasayfa Kategorileri ve Ürünleri</Card.Header>
                        <Card.Body>
                            {homePageData.categories?.map((cat) => (
                                <div key={cat.category_key} className="p-3 border rounded mb-3 bg-light">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">{cat.title?.[currentLang] || cat.category_key} <Badge pill bg="secondary">{cat.products?.length || 0} ürün</Badge></h6>
                                        <Button variant="outline-primary" size="sm" onClick={() => openAddProductModal(cat.category_key)}><FaPlus /> Ürün Ekle</Button>
                                    </div>
                                    <Row className="g-2">
                                        {(cat.products || []).length > 0 ? (
                                            (cat.products || []).map(product => (
                                                <Col key={product.product_id} xs={6} sm={4} md={3}>
                                                    <Card className="h-100 shadow-sm">
                                                        <Card.Img variant="top" src={product.image} style={{ height: '80px', objectFit: 'cover' }} />
                                                        <Card.Body className="p-2 position-relative d-flex flex-column">
                                                            <Card.Title as="div" className="flex-grow-1" style={{ fontSize: '0.8rem', marginBottom: '25px' }}>
                                                                {product.translations?.[currentLang]?.name || product.translations?.tr?.name || 'İsimsiz Ürün'}
                                                            </Card.Title>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                className="position-absolute"
                                                                style={{ bottom: '5px', right: '5px', lineHeight: '1' }}
                                                                onClick={() => removeProductFromCategory(cat.category_key, product.product_id)}
                                                                title="Kategoriden Kaldır"
                                                            >
                                                                <FaTimes />
                                                            </Button>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))
                                        ) : (
                                            <Col><p className="text-muted text-center">Bu kategoride gösterilecek ürün yok.</p></Col>
                                        )}
                                    </Row>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>

                </Col>

                <Col xl={4}>
                    <div className="sticky-top" style={{ top: '150px' }}>
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

                        <Card className="mb-4">
                            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                                <span>Avantajlar</span>
                                <Button variant="primary" size="sm" onClick={() => addArrayItem('advantages', newAdvantageTemplate)}><FaPlus /></Button>
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

                        <Card className="mb-4">
                            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                                <span>İstatistikler</span>
                                <Button variant="primary" size="sm" onClick={() => addArrayItem('stats', newStatTemplate)}><FaPlus /></Button>
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
                    </div>
                </Col>
            </Row>

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
                        {getAvailableProducts().length > 0 ? getAvailableProducts().map(p => (
                            <ListGroup.Item key={p._id} action onClick={() => addProductToCategory(p)} className="d-flex justify-content-between align-items-center">
                                <span>
                                    <img src={p.image} alt={p.translations?.tr?.name} width="40" height="40" style={{ objectFit: 'cover', marginRight: '10px', borderRadius: '4px' }} />
                                    {p.translations?.tr?.name || 'İsimsiz Ürün'}
                                </span>
                                <Badge bg="primary" pill>{p.price} TL</Badge>
                            </ListGroup.Item>
                        )) : (
                            <ListGroup.Item disabled>Bu kategoriye eklenebilecek uygun ürün bulunamadı veya arama sonucu boş.</ListGroup.Item>
                        )}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default AdminHome;