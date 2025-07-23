import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Nav, Tab, InputGroup, ListGroup, Badge, Modal, FormControl } from 'react-bootstrap';
import { FaSave, FaPlus, FaTrash, FaSearch, FaTimes, FaGlobe } from 'react-icons/fa';

// Başlangıç için boş bir veri yapısı
const initialData = {
    page_language: ['tr', 'en'],
    page_title: { tr: '', en: '' },
    page_subtitle: { tr: '', en: '' },
    heroSlides: [],
    banner: { title: { tr: '', en: '' }, desc: { tr: '', en: '' } },
    advantages: [],
    stats: [],
    categories: []
};

const AdminHome = () => {
    // --- STATE'LER ---
    const [homeData, setHomeData] = useState(initialData);
    const [allProducts, setAllProducts] = useState([]);
    const [activeLang, setActiveLang] = useState('tr');

    // Sistem State'leri
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState({ show: false, message: '' });

    // Modal State'leri
    const [showProductModal, setShowProductModal] = useState(false);
    const [currentCategoryKey, setCurrentCategoryKey] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // --- VERİ ÇEKME ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/admin/home'); // Yeni GET rotası
            if (!response.ok) throw new Error('Veri çekilemedi.');
            const result = await response.json();
            setHomeData(result.homeData || initialData);
            setAllProducts(result.allProducts || []);
            setActiveLang(result.homeData?.page_language?.[0] || 'tr');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- KAYDETME ---
    const handleSave = async () => {
        if (!homeData._id) return alert("Kaydedilecek veri ID'si bulunamadı.");
        setIsSaving(true);
        setStatus({ show: false, message: '' });
        try {
            const response = await fetch(`http://localhost:5000/admin/home/${homeData._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(homeData) // Tüm güncel state'i gönder
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setStatus({ show: true, message: result.message, type: 'success' });
        } catch (err) {
            setStatus({ show: true, message: err.message || 'Bir hata oluştu.', type: 'danger' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatus({ show: false, message: '' }), 4000);
        }
    };
    
    // --- GÜNCELLEME YARDIMCILARI ---

    // Üst seviye objeleri güncellemek için (örn: page_title)
    const handleFieldChange = (fieldName, lang, value) => {
        setHomeData(prev => ({
            ...prev,
            [fieldName]: {
                ...prev[fieldName],
                [lang]: value
            }
        }));
    };

    // Dizi (Array) içindeki elemanları güncellemek için (örn: heroSlides)
    const handleArrayItemChange = (arrayName, index, fieldName, lang, value) => {
        setHomeData(prev => {
            const newArray = [...prev[arrayName]];
            newArray[index] = {
                ...newArray[index],
                [fieldName]: {
                    ...newArray[index][fieldName],
                    [lang]: value
                }
            };
            return { ...prev, [arrayName]: newArray };
        });
    };
    
    // Resim gibi dilden bağımsız alanları güncellemek için
    const handleArrayItemStaticChange = (arrayName, index, fieldName, value) => {
        setHomeData(prev => {
            const newArray = [...prev[arrayName]];
            newArray[index][fieldName] = value;
            return { ...prev, [arrayName]: newArray };
        });
    };
    
    // Dizilere yeni eleman ekleme/çıkarma
    const addArrayItem = (arrayName, newItem) => setHomeData(prev => ({ ...prev, [arrayName]: [...prev[arrayName], newItem] }));
    const deleteArrayItem = (arrayName, index) => setHomeData(prev => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }));
    
    // Kategori ve Ürün yönetimi
    const openAddProductModal = (key) => { setCurrentCategoryKey(key); setShowProductModal(true); setSearchTerm(''); };
    const addProductToCategory = (product) => { /*...*/ };
    const removeProductFromCategory = (catKey, prodId) => { /*...*/ };
    const getAvailableProducts = () => { /*...*/ };

    // --- RENDER ---
    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container fluid className="p-3 p-md-4">
            {/* ÜST BAR */}
            <Row className="mb-4 align-items-center bg-light p-3 rounded shadow-sm sticky-top" style={{top: 0, zIndex: 1020}}>
                <Col> <h2 className="mb-0">Anasayfa Yönetimi</h2> </Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                        <FaSave className="me-2" /> {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                </Col>
            </Row>

            {/* BİLDİRİMLER */}
            {status.show && <Alert variant={status.type} onClose={() => setStatus({show: false})} dismissible>{status.message}</Alert>}
            
            <Tab.Container activeKey={activeLang} onSelect={(k) => setActiveLang(k)}>
                <Nav variant="pills" className="mb-3">
                    {homeData.page_language.map(lang => (
                        <Nav.Item key={lang}>
                            <Nav.Link eventKey={lang}>{lang.toUpperCase()}</Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>
                <Tab.Content>
                     {/* Bütün formlar bu tek sekme içeriğinde olacak ve aktif dile göre değer gösterecek */}
                     <Tab.Pane eventKey={activeLang}>
                         <Row>
                             <Col lg={8} className="mb-4">
                                 {/* Genel Ayarlar */}
                                 <Card className="mb-4">
                                     <Card.Header as="h5">Genel Sayfa Metinleri</Card.Header>
                                     <Card.Body>
                                         <Form.Group className="mb-3">
                                             <Form.Label>Sayfa Başlığı ({activeLang.toUpperCase()})</Form.Label>
                                             <Form.Control value={homeData.page_title[activeLang] || ''} onChange={(e) => handleFieldChange('page_title', activeLang, e.target.value)} />
                                         </Form.Group>
                                         <Form.Group>
                                             <Form.Label>Sayfa Alt Başlığı ({activeLang.toUpperCase()})</Form.Label>
                                             <Form.Control as="textarea" rows={3} value={homeData.page_subtitle[activeLang] || ''} onChange={(e) => handleFieldChange('page_subtitle', activeLang, e.target.value)} />
                                         </Form.Group>
                                     </Card.Body>
                                 </Card>

                                 {/* Slider Yönetimi */}
                                 <Card className="mb-4">
                                    <Card.Header as="h5" className="d-flex justify-content-between">
                                        Hero Slider
                                        <Button size="sm" onClick={() => addArrayItem('heroSlides', { image: '', title: {tr:'', en:''}, subtitle:{tr:'', en:''} } )}>
                                            <FaPlus/> Yeni Slayt
                                        </Button>
                                    </Card.Header>
                                    <ListGroup variant="flush">
                                        {homeData.heroSlides.map((slide, index) => (
                                            <ListGroup.Item key={index}>
                                                <Row>
                                                    <Col>
                                                        <Form.Control className="mb-1" placeholder="Resim URL (Dilden Bağımsız)" value={slide.image} onChange={(e) => handleArrayItemStaticChange('heroSlides', index, 'image', e.target.value)} />
                                                        <Form.Control className="mb-1" placeholder={`Başlık (${activeLang.toUpperCase()})`} value={slide.title[activeLang] || ''} onChange={e => handleArrayItemChange('heroSlides', index, 'title', activeLang, e.target.value)} />
                                                        <Form.Control size="sm" placeholder={`Alt Başlık (${activeLang.toUpperCase()})`} value={slide.subtitle[activeLang] || ''} onChange={e => handleArrayItemChange('heroSlides', index, 'subtitle', activeLang, e.target.value)} />
                                                    </Col>
                                                    <Col xs="auto">
                                                        <Button variant="outline-danger" onClick={() => deleteArrayItem('heroSlides', index)}><FaTrash /></Button>
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                 </Card>

                                {/* Diğer modüller (Kategoriler, vb.) aynı mantıkla buraya eklenebilir. */}
                             </Col>
                             <Col lg={4}>
                                 {/* Avantajlar */}
                                <Card>
                                    <Card.Header as="h5" className="d-flex justify-content-between">
                                        Avantajlar
                                        <Button size="sm" onClick={() => addArrayItem('advantages', { icon: '✨', text: {tr:'', en:''} } )}>
                                            <FaPlus/>
                                        </Button>
                                    </Card.Header>
                                    <ListGroup variant="flush">
                                        {homeData.advantages.map((item, index) => (
                                            <ListGroup.Item key={index}>
                                                <InputGroup>
                                                     <Form.Control style={{flex:'0 0 50px'}} value={item.icon} onChange={e => handleArrayItemStaticChange('advantages', index, 'icon', e.target.value)} />
                                                     <Form.Control placeholder={`Metin (${activeLang.toUpperCase()})`} value={item.text[activeLang] || ''} onChange={e => handleArrayItemChange('advantages', index, 'text', activeLang, e.target.value)} />
                                                     <Button variant="outline-danger" onClick={() => deleteArrayItem('advantages', index)}><FaTrash /></Button>
                                                </InputGroup>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Card>
                             </Col>
                         </Row>
                     </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Container>
    );
};

export default AdminHome;