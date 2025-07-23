import React from 'react';
import { Modal,Col,Card,Row, Form, Button, Alert, Image, InputGroup, Spinner } from 'react-bootstrap';

const EditProductModal = ({
  show,
  onHide,
  editProduct,
  setEditProduct,
  updating,
  updateError,
  onUpdate,
  onNotification,
  products
}) => {

  const handleInputChange = (field, value, lang = null, index = null) => {
    if (!editProduct) return;

    if (lang && index !== null) {
      const featuresCopy = [...editProduct.translations[lang].features];
      featuresCopy[index] = value;
      setEditProduct(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            ...prev.translations[lang],
            features: featuresCopy
          }
        }
      }));
    } else if (lang) {
      setEditProduct(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            ...prev.translations[lang],
            [field]: value
          }
        }
      }));
    } else if (field === 'image') {
      if (value && value[0]) {
        const file = value[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditProduct(prev => ({ ...prev, image: reader.result, imageFile: file }));
        };
        reader.readAsDataURL(file);
      }
    } else if (field === 'images') {
      const files = Array.from(value);
      const newFilePaths = files.map(file => URL.createObjectURL(file));

      setEditProduct(prev => ({
        ...prev,
        images: prev.images ? [...prev.images, ...newFilePaths] : newFilePaths,
        newImageFiles: files
      }));
    } else {
      if (field === 'price' || field === 'rating') {
        const numValue = value === '' ? 0 : parseFloat(value);
        const finalValue = isNaN(numValue) ? 0 : numValue;
        setEditProduct(prev => ({ ...prev, [field]: finalValue }));
      } else {
        setEditProduct(prev => ({ ...prev, [field]: value }));
      }
    }
  };

  const handleRemoveFeature = (index) => {
    setEditProduct(prev => {
      const trFeatures = [...prev.translations.tr.features];
      const enFeatures = [...prev.translations.en.features];
      trFeatures.splice(index, 1);
      enFeatures.splice(index, 1);
      return {
        ...prev,
        translations: {
          ...prev.translations,
          tr: { ...prev.translations.tr, features: trFeatures },
          en: { ...prev.translations.en, features: enFeatures }
        }
      };
    });
  };

  const handleAddFeature = () => {
    setEditProduct(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        tr: { ...prev.translations.tr, features: [...prev.translations.tr.features, ''] },
        en: { ...prev.translations.en, features: [...prev.translations.en.features, ''] }
      }
    }));
  };

  const handleRemoveImage = async (idx) => {
    if (!editProduct) return;

    const newImages = [...editProduct.images];
    newImages.splice(idx, 1);
    setEditProduct(prev => ({ ...prev, images: newImages }));

    try {
      const formData = new FormData();
      formData.append('images', JSON.stringify(newImages));
      if (editProduct.newImageFiles) {
        editProduct.newImageFiles.forEach(file => {
          formData.append('image', file);
        });
      }

      const response = await fetch(`http://localhost:5000/admin/updateProduct/${editProduct._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Güncelleme başarısız');
    } catch (error) {
      console.error('Resim güncelleme hatası:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editProduct) return;

    const original = products.find(p => p._id === editProduct._id);
    if (!original) {
      onNotification('Orijinal ürün bulunamadı.', 'danger');
      return;
    }

    const tr = editProduct.translations.tr;
    const en = editProduct.translations.en;

    const isStringArrayEqual = (arr1, arr2) => {
      if (!arr1 && !arr2) return true;
      if (!arr1 || !arr2) return false;
      if (arr1.length !== arr2.length) return false;
      for (let i = 0; i < arr1.length; i++) {
        if ((arr1[i] || '').trim() !== (arr2[i] || '').trim()) return false;
      }
      return true;
    };

    const trNameChanged = tr.name.trim() !== (original.translations.tr.name || '').trim();
    const trDescChanged = tr.description.trim() !== (original.translations.tr.description || '').trim();
    const trFeaturesChanged = !isStringArrayEqual(tr.features, original.translations.tr.features);

    const anyTrChanged = trNameChanged || trDescChanged || trFeaturesChanged;

    if (anyTrChanged) {
      if (!en.name || en.name.trim() === '') {
        onNotification('İngilizce içerik boş bırakılamaz! Lütfen İngilizce ürün adını doldurun.');
        return;
      }
      if (!en.description || en.description.trim() === '') {
        onNotification('İngilizce açıklama boş bırakılamaz! Lütfen İngilizce açıklamayı doldurun.');
        return;
      }
      if (!en.features || en.features.length !== tr.features.length) {
        onNotification('İngilizce özellikler Türkçe özelliklerle aynı sayıda olmalıdır.');
        return;
      }
      for (let i = 0; i < tr.features.length; i++) {
        if (!en.features[i] || en.features[i].trim() === '') {
          onNotification(`İngilizce özellikler boş bırakılamaz! Lütfen ${i + 1}. özelliği doldurun.`);
          return;
        }
      }
      if (
        en.name.trim() === (original.translations.en.name || '').trim() &&
        en.description.trim() === (original.translations.en.description || '').trim() &&
        isStringArrayEqual(en.features, original.translations.en.features)
      ) {
        onNotification('Türkçe içerikte değişiklik var, ancak İngilizce içerik güncellenmemiş. Lütfen İngilizce içerikte de değişiklik yapın.');
        return;
      }
    }

    onUpdate(editProduct);
  };
 return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      backdrop="static" 
      keyboard={false} 
      centered
      className="product-edit-modal"
    >
      <Modal.Header closeButton className="bg-dark text-white py-3">
        <Modal.Title className="fs-4 fw-bold">Ürün Düzenleme Paneli</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        {updateError && (
          <Alert variant="danger" className="shadow-sm rounded-lg mb-4">
            <i className="bi bi-exclamation-circle me-2"></i> 
            {updateError}
          </Alert>
        )}
        
        {editProduct && (
          <Form className="edit-product-form">
            {/* Görseller Bölümü */}
            <div className="mb-4">
              <h4 className="text-dark fw-bold mb-3 border-bottom pb-2">Görseller</h4>
              
              <Row className="g-4">
                {/* Ana Resim */}
                <Col md={6}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Header className="bg-light fw-bold py-2">Ana Resim</Card.Header>
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-center mb-3">
                        <Image
                          src={editProduct.image}
                          rounded
                          thumbnail
                          className="product-main-image"
                          style={{ 
                            maxHeight: '200px', 
                            objectFit: 'contain',
                            border: '1px solid #dee2e6'
                          }}
                        />
                      </div>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-dark">Resmi Değiştir</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={e => handleInputChange('image', e.target.files)}
                          className="border-secondary"
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
                
                {/* Diğer Resimler */}
                <Col md={6}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Header className="bg-light fw-bold py-2">Diğer Resimler</Card.Header>
                    <Card.Body>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-dark mb-3">Yeni Resim Ekle</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={e => handleInputChange('images', e.target.files)}
                          className="border-secondary mb-3"
                        />
                      </Form.Group>
                      
                      <div className="d-flex flex-wrap gap-3 mb-2">
                        {editProduct.images?.map((img, idx) => (
                          <div 
                            key={idx} 
                            className="position-relative image-thumbnail-container"
                            style={{ width: 110, height: 110 }}
                          >
                            <Image
                              src={img.startsWith('/images/') ? img : img}
                              thumbnail
                              className="h-100 w-100"
                              style={{ 
                                objectFit: 'cover', 
                                borderRadius: '0.25rem',
                                border: '1px solid #dee2e6'
                              }}
                              alt={`Diğer resim ${idx + 1}`}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              className="position-absolute top-0 end-0 rounded-circle p-1"
                              style={{ 
                                transform: 'translate(30%, -30%)',
                                zIndex: 10,
                                width: '24px',
                                height: '24px'
                              }}
                              onClick={() => handleRemoveImage(idx)}
                              aria-label={`Resim ${idx + 1} kaldır`}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
            
            {/* Ürün Detayları */}
            <div className="mb-4">
              <h4 className="text-dark fw-bold mb-3 border-bottom pb-2">Ürün Detayları</h4>
              
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">Kategori</Form.Label>
                    <Form.Select
                      value={editProduct.category_key || ''}
                      onChange={e => handleInputChange('category_key', e.target.value)}
                      className="border-secondary"
                    >
                      <option value="">Kategori seçin</option>
                      {categories.map(category => (
                        <option key={category.key} value={category.key}>
                          {category.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">Fiyat ($)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-secondary">$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={editProduct.price || ''}
                        onChange={e => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        className="border-secondary"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">Puan (0-5)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-secondary">
                        <i className="bi bi-star-fill text-warning"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={editProduct.rating || ''}
                        onChange={e => handleInputChange('rating', e.target.value)}
                        placeholder="0.0"
                        className="border-secondary"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </div>
            
            {/* Çoklu Dil İçerik */}
            <div className="mb-4">
              <h4 className="text-dark fw-bold mb-3 border-bottom pb-2">Çoklu Dil İçerik</h4>
              
              <Row className="g-4">
                {/* Türkçe İçerik */}
                <Col md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Header className="bg-primary text-white fw-bold py-2">
                      Türkçe İçerik
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-dark">Ürün Adı</Form.Label>
                        <Form.Control
                          type="text"
                          value={editProduct.translations.tr.name}
                          onChange={e => handleInputChange('name', e.target.value, 'tr')}
                          placeholder="Ürün adı girin"
                          className="border-secondary"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-dark">Açıklama</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={editProduct.translations.tr.description}
                          onChange={e => handleInputChange('description', e.target.value, 'tr')}
                          placeholder="Ürün açıklaması girin"
                          className="border-secondary"
                        />
                      </Form.Group>
                      
                      <div className="mb-3">
                        <Form.Label className="fw-semibold text-dark d-block">Özellikler</Form.Label>
                        {editProduct.translations.tr.features.map((feat, idx) => (
                          <InputGroup className="mb-2" key={`tr-feature-${idx}`}>
                            <Form.Control
                              type="text"
                              value={feat}
                              onChange={e => handleInputChange('features', e.target.value, 'tr', idx)}
                              placeholder={`Özellik #${idx + 1}`}
                              className="border-secondary"
                            />
                            <Button 
                              variant="outline-danger" 
                              onClick={() => handleRemoveFeature(idx)}
                              className="border-secondary"
                              aria-label="Özellik kaldır"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </InputGroup>
                        ))}
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={handleAddFeature}
                          className="mt-2 border-secondary"
                        >
                          <i className="bi bi-plus-circle me-1"></i> Özellik Ekle
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                {/* İngilizce İçerik */}
                <Col md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Header className="bg-info text-dark fw-bold py-2">
                      English Content
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-dark">Product Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={editProduct.translations.en.name}
                          onChange={e => handleInputChange('name', e.target.value, 'en')}
                          placeholder="Enter product name"
                          className="border-secondary"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-dark">Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={editProduct.translations.en.description}
                          onChange={e => handleInputChange('description', e.target.value, 'en')}
                          placeholder="Enter product description"
                          className="border-secondary"
                        />
                      </Form.Group>
                      
                      <div>
                        <Form.Label className="fw-semibold text-dark d-block">Features</Form.Label>
                        {editProduct.translations.en.features.map((feat, idx) => (
                          <InputGroup className="mb-2" key={`en-feature-${idx}`}>
                            <Form.Control
                              type="text"
                              value={feat}
                              onChange={e => handleInputChange('features', e.target.value, 'en', idx)}
                              placeholder={`Feature #${idx + 1}`}
                              className="border-secondary"
                            />
                          </InputGroup>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Form>
        )}
      </Modal.Body>
      
      <Modal.Footer className="d-flex justify-content-between bg-light py-3">
        <Button 
          variant="outline-secondary" 
          onClick={onHide} 
          disabled={updating}
          className="px-4 py-2 fw-medium"
        >
          <i className="bi bi-x-circle me-2"></i> İptal
        </Button>
        
        <Button 
          variant="primary" 
          onClick={handleUpdate} 
          disabled={updating}
          className="px-4 py-2 fw-medium d-flex align-items-center gap-2"
        >
          {updating ? (
            <>
              <Spinner animation="border" size="sm" /> Güncelleniyor...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle"></i> Güncellemeyi Kaydet
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProductModal;