import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup
} from 'react-bootstrap';
import {
  FaPlus, FaTrash, FaSave, FaTimes, FaPencilAlt
} from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const AdminHome = () => {
  const initialData = {
    page_title: { tr: '', en: '' },
    page_subtitle: { tr: '', en: '' },
    heroSlides: [],
    banner: {
      image: '',
      title: { tr: '', en: '' },
      desc: { tr: '', en: '' },
      cta: { tr: '', en: '' },
    },
    advantages: [],
    stats: [],
    categories: [],
  };

  const newSlideTemplate = {
    image: '',
    title: { tr: '', en: '' },
    subtitle: { tr: '', en: '' },
    cta: { tr: '', en: '' },
  };

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/admin/homeList');
      if (!response.ok) throw new Error('Veri alınamadı');
      const result = await response.json();
      setHomePageData({ ...initialData, ...result.homeData[0] });
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

  const handleMultiLangChange = (field, subField, value) => {
    setHomePageData(prev => {
      if (subField) {
        return { ...prev, [field]: { ...prev[field], [subField]: { ...prev[field][subField], [currentLang]: value } } };
      }
      return { ...prev, [field]: { ...prev[field], [currentLang]: value } };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/admin/home/${homePageData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homePageData)
      });
      if (!res.ok) throw new Error('Kaydetme hatası');
      setStatusMessage({ show: true, message: 'Kaydedildi', type: 'success' });
    } catch (err) {
      setStatusMessage({ show: true, message: err.message, type: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

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
    setCurrentSlide(prev => {
      if (isMultiLang) {
        return { ...prev, [field]: { ...prev[field], [lang || currentLang]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSaveSlide = () => {
    if (isEditingSlide) {
      const updated = [...homePageData.heroSlides];
      updated[currentSlide.index] = { ...currentSlide };
      delete updated[currentSlide.index].index;
      setHomePageData(prev => ({ ...prev, heroSlides: updated }));
    } else {
      setHomePageData(prev => ({ ...prev, heroSlides: [...prev.heroSlides, currentSlide] }));
    }
    setShowSlideModal(false);
  };

  const deleteSlide = index => {
    setHomePageData(prev => ({ ...prev, heroSlides: prev.heroSlides.filter((_, i) => i !== index) }));
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container>
      <Row className="mb-3">
        <Col><h3>Anasayfa Yönetimi</h3></Col>
        <Col className="text-end">
          <ButtonGroup>
            <Button variant={currentLang === 'tr' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('tr')}>TR</Button>
            <Button variant={currentLang === 'en' ? 'primary' : 'outline-primary'} onClick={() => setCurrentLang('en')}>EN</Button>
          </ButtonGroup>
          <Button variant="success" className="ms-2" onClick={handleSave}><FaSave /> Kaydet</Button>
        </Col>
      </Row>
      {statusMessage.show && <Alert variant={statusMessage.type}>{statusMessage.message}</Alert>}
      <Card className="mb-3">
        <Card.Header>Genel Bilgiler</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Başlık</Form.Label>
            <Form.Control value={homePageData.page_title[currentLang]} onChange={e => handleMultiLangChange('page_title', null, e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Alt Başlık</Form.Label>
            <Form.Control as="textarea" value={homePageData.page_subtitle[currentLang]} onChange={e => handleMultiLangChange('page_subtitle', null, e.target.value)} />
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Hero Slider</span>
          <Button size="sm" variant="success" onClick={handleOpenNewSlideModal}><FaPlus /> Yeni Slayt</Button>
        </Card.Header>
        <ListGroup variant="flush">
          {homePageData.heroSlides.map((slide, index) => (
            <ListGroup.Item key={slide.slider_id}>
              <Row className="align-items-center">
                <Col xs={2}>{slide.image && <img src={slide.image} className="img-fluid" alt="Slide" />}</Col>
                <Col>
                  <h6>{slide.title[currentLang]}</h6>
                  <small>{slide.subtitle[currentLang]}</small>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-primary" size="sm" onClick={() => handleOpenEditSlideModal(slide, index)}><FaPencilAlt /></Button>
                  <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => deleteSlide(index)}><FaTrash /></Button>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>

      <Modal show={showSlideModal} onHide={() => setShowSlideModal(false)}>
        <Modal.Header closeButton><Modal.Title>Slayt</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Görsel URL</Form.Label>
            <Form.Control value={currentSlide?.image} onChange={e => handleSlideChange('image', e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Başlık ({currentLang.toUpperCase()})</Form.Label>
            <Form.Control value={currentSlide?.title?.[currentLang] || ''} onChange={e => handleSlideChange('title', e.target.value, true)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Alt Başlık ({currentLang.toUpperCase()})</Form.Label>
            <Form.Control value={currentSlide?.subtitle?.[currentLang] || ''} onChange={e => handleSlideChange('subtitle', e.target.value, true)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSlideModal(false)}>İptal</Button>
          <Button variant="primary" onClick={handleSaveSlide}><FaSave /> Kaydet</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminHome;
