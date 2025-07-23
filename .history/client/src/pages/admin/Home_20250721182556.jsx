import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Modal,
  Alert, Spinner, ListGroup, InputGroup, FormControl, Badge, ButtonGroup
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaImage, FaUpload, FaEdit } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

// ... initialData remains the same ...

const AdminHome = () => {
  // ... existing states remain the same ...
  
  // NEW STATES FOR SLIDER MODAL
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [isEditingSlide, setIsEditingSlide] = useState(false);

  // ... existing functions remain the same ...

  // OPEN NEW SLIDE MODAL
  const handleOpenNewSlideModal = () => {
    setCurrentSlide({ ...newSlideTemplate, slider_id: uuidv4() });
    setIsEditingSlide(false);
    setShowSlideModal(true);
  };

  // OPEN EDIT SLIDE MODAL
  const handleOpenEditSlideModal = (slide, index) => {
    setCurrentSlide({ ...slide, index });
    setIsEditingSlide(true);
    setShowSlideModal(true);
  };

  // HANDLE SLIDE MODAL CHANGES
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

  // SAVE SLIDE FROM MODAL
  const handleSaveSlide = () => {
    if (isEditingSlide) {
      // Update existing slide
      const indexToUpdate = currentSlide.index;
      const updatedSlides = [...homePageData.heroSlides];
      updatedSlides[indexToUpdate] = currentSlide;
      setHomePageData(prev => ({ ...prev, heroSlides: updatedSlides }));
    } else {
      // Add new slide
      setHomePageData(prev => ({
        ...prev,
        heroSlides: [...(prev.heroSlides || []), currentSlide]
      }));
    }
    setShowSlideModal(false);
  };

  // ... existing functions remain the same ...

  // MODIFIED: Handle image upload specifically for slide modal
  const handleImageUpload = async (event) => {
    // ... existing upload logic ...
    
    if (response.ok) {
      // Update image preview AND current slide if in slide modal
      setImagePreview(result.imagePath);
      if (showSlideModal && currentSlide) {
        setCurrentSlide(prev => ({ ...prev, image: result.imagePath }));
      }
    }
    // ...
  };

  // MODIFIED: Remove manual image path input from UI
  // MODIFIED: Remove button link from banner section

  return (
    <Container fluid className="p-3 p-md-4">
      {/* ... existing UI remains the same ... */}
      
      {/* SLIDER MANAGEMENT CARD - MODIFIED UI */}
      <Card className="mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          <span>Hero Slider</span>
          <Button variant="success" size="sm" onClick={handleOpenNewSlideModal}>
            <FaPlus /> Yeni Slayt Ekle
          </Button>
        </Card.Header>
        <ListGroup variant="flush">
          {homePageData.heroSlides?.map((slide, index) => (
            <ListGroup.Item key={slide.slider_id || index} className="p-3">
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

      {/* BANNER CARD - MODIFIED UI (REMOVED BUTTON LINK) */}
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
          {/* REMOVED BUTTON LINK FIELD */}
        </Card.Body>
      </Card>

      {/* NEW SLIDER MODAL */}
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
                    setCurrentImageField({ type: 'heroSlides', index: currentSlide.index });
                    setShowImageModal(true);
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

      {/* ... existing modals remain the same ... */}
    </Container>
  );
};

export default AdminHome;