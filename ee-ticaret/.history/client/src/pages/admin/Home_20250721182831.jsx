import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaImage, FaUpload, FaEdit } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const initialData = {
  // ... initialData tanımı aynı kalacak ...
};

const newSlideTemplate = {
  // ... newSlideTemplate aynı kalacak ...
};

// ... diğer sabitler aynı ...

const AdminHome = () => {
  // ... mevcut state'ler aynı kalacak ...
  
  // Yeni state'ler ekliyoruz
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [isEditingSlide, setIsEditingSlide] = useState(false);

  // Yeni slayt modalını aç
  const handleOpenNewSlideModal = () => {
    setCurrentSlide({ ...newSlideTemplate, slider_id: uuidv4() });
    setIsEditingSlide(false);
    setShowSlideModal(true);
  };

  // Mevcut slaytı düzenle
  const handleOpenEditSlideModal = (slide, index) => {
    setCurrentSlide({ ...slide, index });
    setIsEditingSlide(true);
    setShowSlideModal(true);
  };

  // Modal içindeki değişiklikleri yönet
  const handleSlideModalChange = (field, value, isMultiLang = false) => {
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

  // Slaytı kaydet
  const handleSaveSlide = () => {
    if (isEditingSlide) {
      // Düzenlenen slaytı güncelle
      const indexToUpdate = currentSlide.index;
      const updatedSlides = [...homePageData.heroSlides];
      updatedSlides[indexToUpdate] = currentSlide;
      setHomePageData(prev => ({ ...prev, heroSlides: updatedSlides }));
    } else {
      // Yeni slayt ekle
      setHomePageData(prev => ({
        ...prev,
        heroSlides: [...(prev.heroSlides || []), currentSlide]
      }));
    }
    setShowSlideModal(false);
  };

  // ... mevcut fonksiyonlar aynı kalacak ...

  return (
    <Container fluid className="p-3 p-md-4">
      {/* ... Üst bar ve diğer bileşenler aynı kalacak ... */}

      {/* SLIDER YÖNETİMİ KARTI - GÜNCELLENDİ */}
      <Card className="mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          <span>Hero Slider</span>
          <Button variant="success" size="sm" onClick={handleOpenNewSlideModal}>
            <FaPlus /> Yeni Slayt Ekle
          </Button>
        </Card.Header>
        <ListGroup variant="flush">
          {homePageData.heroSlides?.map((slide, index) => (
            <ListGroup.Item key={index} className="p-3">
              <Row>
                <Col md={2} className="d-flex flex-column align-items-center">
                  {slide.image ? (
                    <img 
                      src={slide.image} 
                      alt="Slide" 
                      className="img-thumbnail mb-2" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div className="bg-light border d-flex align-items-center justify-content-center" 
                         style={{ width: '80px', height: '80px' }}>
                      <FaImage size={24} className="text-muted" />
                    </div>
                  )}
                  <div className="d-flex gap-1 mt-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => handleOpenEditSlideModal(slide, index)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => deleteArrayItem('heroSlides', index, slide)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Col>
                <Col md={10}>
                  <div className="mb-2">
                    <strong>Başlık ({currentLang.toUpperCase()}):</strong> {slide.title?.[currentLang] || 'Belirtilmemiş'}
                  </div>
                  <div className="mb-2">
                    <strong>Alt Başlık ({currentLang.toUpperCase()}):</strong> {slide.subtitle?.[currentLang] || 'Belirtilmemiş'}
                  </div>
                  <div className="mb-2">
                    <strong>Buton:</strong> {slide.cta?.[currentLang] || 'Belirtilmemiş'}
                  </div>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>

      {/* BANNER KARTI - GÜNCELLENDİ (Buton Link kaldırıldı) */}
      <Card className="mb-4">
        <Card.Header as="h5">Özel Banner ({currentLang.toUpperCase()})</Card.Header>
        <Card.Body>
          <Form.Group className="mb-2">
            <Form.Label>Başlık</Form.Label>
            <Form.Control size="sm" value={homePageData.banner?.title?.[currentLang] || ''} 
                          onChange={(e) => handleMultiLangChange('banner', 'title', e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Açıklama</Form.Label>
            <Form.Control size="sm" value={homePageData.banner?.desc?.[currentLang] || ''} 
                          onChange={(e) => handleMultiLangChange('banner', 'desc', e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Buton Metni</Form.Label>
            <Form.Control size="sm" value={homePageData.banner?.cta?.[currentLang] || ''} 
                          onChange={(e) => handleMultiLangChange('banner', 'cta', e.target.value)} />
          </Form.Group>
          {/* Buton Link alanı kaldırıldı */}
        </Card.Body>
      </Card>

      {/* YENİ SLIDER MODALI */}
      <Modal show={showSlideModal} onHide={() => setShowSlideModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditingSlide ? 'Slayt Düzenle' : 'Yeni Slayt Ekle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Başlık ({currentLang.toUpperCase()})</Form.Label>
              <Form.Control 
                type="text" 
                value={currentSlide?.title?.[currentLang] || ''} 
                onChange={(e) => handleSlideModalChange('title', e.target.value, true)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Alt Başlık ({currentLang.toUpperCase()})</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={currentSlide?.subtitle?.[currentLang] || ''} 
                onChange={(e) => handleSlideModalChange('subtitle', e.target.value, true)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Buton Metni ({currentLang.toUpperCase()})</Form.Label>
              <Form.Control 
                type="text" 
                value={currentSlide?.cta?.[currentLang] || ''} 
                onChange={(e) => handleSlideModalChange('cta', e.target.value, true)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Buton Linki</Form.Label>
              <Form.Control 
                type="text" 
                value={currentSlide?.cta_link || ''} 
                onChange={(e) => handleSlideModalChange('cta_link', e.target.value)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Resim</Form.Label>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    // Mevcut resim yükleme modalını aç
                    openImageModal('heroSlides');
                  }}
                >
                  <FaImage /> Resim Seç
                </Button>
                {currentSlide?.image && (
                  <span className="text-truncate" style={{ maxWidth: '200px' }}>
                    {currentSlide.image}
                  </span>
                )}
              </div>
              
              {currentSlide?.image && (
                <div className="text-center">
                  <img 
                    src={currentSlide.image} 
                    alt="Önizleme" 
                    className="img-fluid rounded" 
                    style={{ maxHeight: '200px' }} 
                  />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSlideModal(false)}>
            İptal
          </Button>
          <Button variant="primary" onClick={handleSaveSlide}>
            Kaydet
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ... mevcut modallar aynı kalacak ... */}
    </Container>
  );
};

export default AdminHome;