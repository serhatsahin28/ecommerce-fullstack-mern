import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, Image, InputGroup, Alert, Spinner } from 'react-bootstrap';

const AddProductModal = ({ show, onHide, onNotification, onProductAdded }) => {
    const AddProductModal = ({ show, onHide, onNotification, onProductUpdated, product }) => {
  const [newProduct, setNewProduct] = useState({
    image: '',
    images: [],
    category_key: '',
    price: 0,
    rating: 0,
    translations: {
      tr: { name: '', description: '', features: [''] },
      en: { name: '', description: '', features: [''] }
    },
    imageFile: null,
    newImageFiles: []
  });

  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  // Form reset on modal close
  useEffect(() => {
    if (!show) {
      setNewProduct({
        image: '',
        images: [],
        category_key: '',
        price: 0,
        rating: 0,
        translations: {
          tr: { name: '', description: '', features: [''] },
          en: { name: '', description: '', features: [''] }
        },
        imageFile: null,
        newImageFiles: []
      });
      setAddError(null);
      setAdding(false);
    }
  }, [show]);

  const handleInputChange = (field, value, lang = null, index = null) => {
    if (lang && index !== null) {
      const featuresCopy = [...newProduct.translations[lang].features];
      featuresCopy[index] = value;
      setNewProduct(prev => ({
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
      setNewProduct(prev => ({
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
          setNewProduct(prev => ({ ...prev, image: reader.result, imageFile: file }));
        };
        reader.readAsDataURL(file);
      }
    } else if (field === 'images') {
      const files = Array.from(value);
      const newFilePaths = files.map(file => URL.createObjectURL(file));
      setNewProduct(prev => ({
        ...prev,
        images: prev.images ? [...prev.images, ...newFilePaths] : newFilePaths,
        newImageFiles: [...(prev.newImageFiles || []), ...files]
      }));
    } else {
      if (field === 'price' || field === 'rating') {
        const numValue = value === '' ? 0 : parseFloat(value);
        const finalValue = isNaN(numValue) ? 0 : numValue;
        setNewProduct(prev => ({ ...prev, [field]: finalValue }));
      } else {
        setNewProduct(prev => ({ ...prev, [field]: value }));
      }
    }
  };

  const handleRemoveFeature = (index) => {
    setNewProduct(prev => {
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
    setNewProduct(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        tr: { ...prev.translations.tr, features: [...prev.translations.tr.features, ''] },
        en: { ...prev.translations.en, features: [...prev.translations.en.features, ''] }
      }
    }));
  };

  const handleRemoveImage = (idx) => {
    const newImages = [...newProduct.images];
    const newImageFiles = [...newProduct.newImageFiles];
    newImages.splice(idx, 1);
    newImageFiles.splice(idx, 1);
    setNewProduct(prev => ({
      ...prev,
      images: newImages,
      newImageFiles: newImageFiles
    }));
  };

  const validateProduct = () => {
    const tr = newProduct.translations.tr;
    const en = newProduct.translations.en;

    if (!tr.name.trim()) {
      onNotification('Türkçe ürün adı boş bırakılamaz!', 'danger');
      return false;
    }
    if (!tr.description.trim()) {
      onNotification('Türkçe açıklama boş bırakılamaz!', 'danger');
      return false;
    }
    if (!en.name.trim()) {
      onNotification('İngilizce ürün adı boş bırakılamaz!', 'danger');
      return false;
    }
    if (!en.description.trim()) {
      onNotification('İngilizce açıklama boş bırakılamaz!', 'danger');
      return false;
    }
    if (!newProduct.category_key) {
      onNotification('Kategori seçimi zorunludur!', 'danger');
      return false;
    }
    if (newProduct.price <= 0) {
      onNotification('Fiyat 0\'dan büyük olmalıdır!', 'danger');
      return false;
    }
    if (!newProduct.imageFile) {
      onNotification('Ana resim yüklenmesi zorunludur!', 'danger');
      return false;
    }
    for (let i = 0; i < tr.features.length; i++) {
      if (tr.features[i] && tr.features[i].trim() !== '') {
        if (!en.features[i] || en.features[i].trim() === '') {
          onNotification(`İngilizce ${i + 1}. özellik boş bırakılamaz!`, 'danger');
          return false;
        }
      }
    }
    return true;
  };

  const handleAddProduct = async () => {
    if (!validateProduct()) return;

    try {
      setAdding(true);
      setAddError(null);

      const formData = new FormData();
      formData.append('category_key', newProduct.category_key);
      formData.append('price', newProduct.price);
      formData.append('rating', newProduct.rating);
      formData.append('translations', JSON.stringify(newProduct.translations));

      if (newProduct.imageFile) {
        formData.append('image', newProduct.imageFile);
      }
      if (newProduct.newImageFiles && newProduct.newImageFiles.length > 0) {
        newProduct.newImageFiles.forEach(file => {
          formData.append('image', file);
        });
      }

      const response = await fetch('http://localhost:5000/admin/addProduct', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Ürün ekleme başarısız');

      const addedProduct = await response.json();

      onNotification('Ürün başarıyla eklendi!', 'success');
      onProductAdded && onProductAdded(addedProduct);
      onHide();

    } catch (error) {
      setAddError('Ürün eklenirken bir hata oluştu.');
      console.error('Add Product Error:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Yeni Ürün Ekle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {addError && <Alert variant="danger" className="shadow-sm">{addError}</Alert>}
        <Form>
          {/* Görseller */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-light fw-bold text-dark">Ana Resim *</Card.Header>
                <Card.Body className="d-flex flex-column align-items-center">
                  {newProduct.image && (
                    <Image
                      src={newProduct.image}
                      rounded
                      thumbnail
                      style={{ maxHeight: '180px', objectFit: 'contain' }}
                      className="mb-3"
                      alt="Ana resim"
                    />
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={e => handleInputChange('image', e.target.files)}
                    aria-label="Ürün ana resmi yükle"
                    required
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-light fw-bold text-dark">Diğer Resimler</Card.Header>
                <Card.Body>
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    {newProduct.images?.map((img, idx) => (
                      <div key={idx} className="position-relative" style={{ width: 110, height: 110 }}>
                        <Image
                          src={img}
                          thumbnail
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.25rem' }}
                          alt={`Diğer resim ${idx + 1}`}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 rounded-circle p-1"
                          style={{ zIndex: 10 }}
                          onClick={() => handleRemoveImage(idx)}
                          aria-label={`Resim ${idx + 1} kaldır`}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => handleInputChange('images', e.target.files)}
                    aria-label="Diğer ürün resimleri yükle"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Kategori ve Fiyat */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold text-dark">Kategori *</Form.Label>
                <Form.Select
                  value={newProduct.category_key || ''}
                  onChange={e => handleInputChange('category_key', e.target.value)}
                  required
                >
                  <option value="">Kategori seçin</option>
                  <option value="fashion">Fashion</option>
                  <option value="books">Books</option>
                  <option value="electronics">Electronics</option>
                  <option value="home_office">Home & Office</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold text-dark">Fiyat ($) *</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.price || ''}
                  onChange={e => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold text-dark">Puan (0-5)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={newProduct.rating || ''}
                  onChange={e => handleInputChange('rating', e.target.value)}
                  placeholder="0 - 5"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* İçerikler (Türkçe & İngilizce) */}
          <Row className="mb-4">
            <Col md={6}>
              <h5 className="mb-3 border-bottom pb-2 fw-bold text-dark">Türkçe İçerik</h5>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">Ürün Adı *</Form.Label>
                <Form.Control
                  type="text"
                  value={newProduct.translations.tr.name}
                  onChange={e => handleInputChange('name', e.target.value, 'tr')}
                  placeholder="Ürün adı girin"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">Açıklama *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={newProduct.translations.tr.description}
                  onChange={e => handleInputChange('description', e.target.value, 'tr')}
                  placeholder="Ürün açıklaması girin"
                  required
                />
              </Form.Group>
              <Form.Label className="fw-bold text-dark">Özellikler</Form.Label>
              {newProduct.translations.tr.features.map((feature, idx) => (
                <InputGroup className="mb-2" key={`tr-feature-${idx}`}>
                  <Form.Control
                    type="text"
                    placeholder={`Özellik ${idx + 1}`}
                    value={feature}
                    onChange={e => handleInputChange('features', e.target.value, 'tr', idx)}
                  />
                  <Button
                    variant="outline-danger"
                    onClick={() => handleRemoveFeature(idx)}
                    aria-label={`${idx + 1}. Türkçe özelliği sil`}
                  >
                    &times;
                  </Button>
                </InputGroup>
              ))}
              <Button variant="outline-primary" size="sm" onClick={handleAddFeature} className="mt-1">
                + Özellik Ekle
              </Button>
            </Col>

            <Col md={6}>
              <h5 className="mb-3 border-bottom pb-2 fw-bold text-dark">English Content</h5>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">Product Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={newProduct.translations.en.name}
                  onChange={e => handleInputChange('name', e.target.value, 'en')}
                  placeholder="Enter product name"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={newProduct.translations.en.description}
                  onChange={e => handleInputChange('description', e.target.value, 'en')}
                  placeholder="Enter product description"
                  required
                />
              </Form.Group>
              <Form.Label className="fw-bold text-dark">Features</Form.Label>
              {newProduct.translations.en.features.map((feature, idx) => (
                <InputGroup className="mb-2" key={`en-feature-${idx}`}>
                  <Form.Control
                    type="text"
                    placeholder={`Feature ${idx + 1}`}
                    value={feature}
                    onChange={e => handleInputChange('features', e.target.value, 'en', idx)}
                  />
                  <Button
                    variant="outline-danger"
                    onClick={() => handleRemoveFeature(idx)}
                    aria-label={`${idx + 1}. English feature delete`}
                  >
                    &times;
                  </Button>
                </InputGroup>
              ))}
              <Button variant="outline-primary" size="sm" onClick={handleAddFeature} className="mt-1">
                + Add Feature
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={adding}>
          İptal
        </Button>
        <Button variant="primary" onClick={handleAddProduct} disabled={adding}>
          {adding ? (
            <>
              <Spinner animation="border" size="sm" /> Kaydediliyor...
            </>
          ) : (
            'Ürünü Ekle'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProductModal;
