// components/admin/EditProductModal.jsx
import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Image, InputGroup, Spinner } from 'react-bootstrap';

const EditProductModal = ({
  show,
  onHide,
  editProduct,
  setEditProduct,
  products,
  onNotification,
  onProductUpdated, // Güncelleme sonrası ürün listesi güncellenmesi için callback
}) => {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

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
            features: featuresCopy,
          },
        },
      }));
    } else if (lang) {
      setEditProduct(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            ...prev.translations[lang],
            [field]: value,
          },
        },
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

  const handleAddFeature = () => {
    setEditProduct(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        tr: { ...prev.translations.tr, features: [...prev.translations.tr.features, ''] },
        en: { ...prev.translations.en, features: [...prev.translations.en.features, ''] },
      },
    }));
  };

  const handleRemoveFeature = index => {
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
          en: { ...prev.translations.en, features: enFeatures },
        },
      };
    });
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

    setUpdating(true);
    setUpdateError(null);

    try {
      const formData = new FormData();
      formData.append('price', editProduct.price);
      formData.append('rating', editProduct.rating);

      if (editProduct.imageFile) {
        formData.append('image', editProduct.imageFile);
      }

      // translations'u string yaparak gönder
      formData.append('translations', JSON.stringify(editProduct.translations));

      // Diğer alanlar varsa ekle
      // Örnek: formData.append('otherField', editProduct.otherField);

      const response = await fetch(`/api/products/${editProduct._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Güncelleme sırasında hata oluştu');
      }

      const data = await response.json();
      onNotification('Ürün başarıyla güncellendi.', 'success');
      onProductUpdated(data.product); // Ana listeyi güncellemek için
      onHide();
    } catch (error) {
      setUpdateError(error.message);
      onNotification(error.message, 'danger');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Ürün Düzenle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {updateError && <Alert variant="danger">{updateError}</Alert>}
        {editProduct && (
          <Form>
            <Form.Group className="mb-3" controlId="editProductImage">
              <Form.Label>Ürün Resmi</Form.Label>
              <div className="mb-2">
                <Image src={editProduct.image} thumbnail style={{ maxHeight: '150px' }} />
              </div>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={e => handleInputChange('image', e.target.files)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editProductPrice">
              <Form.Label>Fiyat ($)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={editProduct.price || ''}
                onChange={e => handleInputChange('price', e.target.value)}
                placeholder="0.00"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editProductRating">
              <Form.Label>Puan (0-5)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={editProduct.rating || ''}
                onChange={e => handleInputChange('rating', e.target.value)}
                placeholder="0.0"
              />
            </Form.Group>

            {/* Türkçe içerik */}
            <h5>Türkçe İçerik</h5>
            <Form.Group className="mb-3" controlId="editProductTRName">
              <Form.Label>Ürün Adı</Form.Label>
              <Form.Control
                type="text"
                value={editProduct.translations.tr.name}
                onChange={e => handleInputChange('name', e.target.value, 'tr')}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editProductTRDescription">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editProduct.translations.tr.description}
                onChange={e => handleInputChange('description', e.target.value, 'tr')}
              />
            </Form.Group>

            {/* Özellikler */}
            <h6>Özellikler</h6>
            {editProduct.translations.tr.features.map((feat, idx) => (
              <InputGroup className="mb-2" key={`tr-feature-${idx}`}>
                <Form.Control
                  placeholder={`Özellik ${idx + 1}`}
                  value={feat}
                  onChange={e => handleInputChange(null, e.target.value, 'tr', idx)}
                />
                <Button variant="outline-danger" onClick={() => handleRemoveFeature(idx)}>
                  Sil
                </Button>
              </InputGroup>
            ))}
            <Button variant="outline-primary" size="sm" onClick={handleAddFeature}>
              + Özellik Ekle
            </Button>

            {/* İngilizce içerik */}
            <h5 className="mt-4">English Content</h5>
            <Form.Group className="mb-3" controlId="editProductENName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={editProduct.translations.en.name}
                onChange={e => handleInputChange('name', e.target.value, 'en')}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editProductENDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editProduct.translations.en.description}
                onChange={e => handleInputChange('description', e.target.value, 'en')}
              />
            </Form.Group>

            <h6>Features</h6>
            {editProduct.translations.en.features.map((feat, idx) => (
              <InputGroup className="mb-2" key={`en-feature-${idx}`}>
                <Form.Control
                  placeholder={`Feature ${idx + 1}`}
                  value={feat}
                  onChange={e => handleInputChange(null, e.target.value, 'en', idx)}
                />
              </InputGroup>
            ))}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={updating}>
          İptal
        </Button>
        <Button variant="success" onClick={handleUpdate} disabled={updating}>
          {updating ? <Spinner animation="border" size="sm" /> : 'Güncelle'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProductModal;
