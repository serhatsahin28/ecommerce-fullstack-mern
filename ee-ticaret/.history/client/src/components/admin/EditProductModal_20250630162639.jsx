import React from 'react';
import { Modal, Form, Button, Alert, Image, InputGroup, Spinner } from 'react-bootstrap';

const EditProductModal = ({
  show,
  onHide,
  editProduct,
  setEditProduct,
  updating,
  updateError,
  onUpdate,
  onNotification,
  products,
  categories = [] // Kategori listesi dışarıdan prop olarak alınır
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
        en: { ...prev.translations.en.features, features: [...prev.translations.en.features, ''] }
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

    const trChanged =
      tr.name.trim() !== (original.translations.tr.name || '').trim() ||
      tr.description.trim() !== (original.translations.tr.description || '').trim() ||
      !isStringArrayEqual(tr.features, original.translations.tr.features);

    if (trChanged) {
      if (!en.name || en.name.trim() === '') {
        onNotification('İngilizce ürün adı boş bırakılamaz!');
        return;
      }
      if (!en.description || en.description.trim() === '') {
        onNotification('İngilizce açıklama boş bırakılamaz!');
        return;
      }
      if (!en.features || en.features.length !== tr.features.length) {
        onNotification('İngilizce özellikler Türkçe ile aynı sayıda olmalı!');
        return;
      }
      for (let i = 0; i < tr.features.length; i++) {
        if (!en.features[i] || en.features[i].trim() === '') {
          onNotification(`${i + 1}. İngilizce özellik boş bırakılamaz.`);
          return;
        }
      }
      const enSame =
        en.name.trim() === (original.translations.en.name || '').trim() &&
        en.description.trim() === (original.translations.en.description || '').trim() &&
        isStringArrayEqual(en.features, original.translations.en.features);

      if (enSame) {
        onNotification('TR içerik değişti ama EN güncellenmedi!');
        return;
      }
    }

    onUpdate(editProduct);
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

            {/* Ana Görsel */}
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

            {/* Diğer Resimler */}
            <Form.Group className="mb-3" controlId="editProductImages">
              <Form.Label>Diğer Resimler</Form.Label>
              <div className="d-flex flex-wrap mb-2">
                {editProduct.images?.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', marginRight: 10, marginBottom: 10 }}>
                    <Image
                      src={img}
                      thumbnail
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      alt={`img-${idx}`}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      style={{ position: 'absolute', top: 0, right: 0 }}
                      onClick={() => handleRemoveImage(idx)}
                    >
                      X
                    </Button>
                  </div>
                ))}
              </div>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                onChange={e => handleInputChange('images', e.target.files)}
              />
            </Form.Group>

            {/* Kategori */}
            <Form.Group className="mb-3" controlId="editProductCategory">
              <Form.Label>Kategori</Form.Label>
              <Form.Select
                value={editProduct.category || ''}
                onChange={e => handleInputChange('category', e.target.value)}
              >
                <option value="">Kategori seçiniz</option>
                {categories.map(cat => (
                  <option key={cat._id || cat} value={cat._id || cat}>
                    {cat.name || cat}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Fiyat */}
            <Form.Group className="mb-3">
              <Form.Label>Fiyat ($)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={editProduct.price || ''}
                onChange={e => handleInputChange('price', e.target.value)}
              />
            </Form.Group>

            {/* Puan */}
            <Form.Group className="mb-3">
              <Form.Label>Puan (0-5)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={editProduct.rating || ''}
                onChange={e => handleInputChange('rating', e.target.value)}
              />
            </Form.Group>

            {/* Türkçe İçerik */}
            <h5>Türkçe İçerik</h5>
            <Form.Group className="mb-3">
              <Form.Label>Ürün Adı</Form.Label>
              <Form.Control
                type="text"
                value={editProduct.translations.tr.name}
                onChange={e => handleInputChange('name', e.target.value, 'tr')}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editProduct.translations.tr.description}
                onChange={e => handleInputChange('description', e.target.value, 'tr')}
              />
            </Form.Group>
            <Form.Label>Özellikler</Form.Label>
            {editProduct.translations.tr.features.map((feat, idx) => (
              <InputGroup className="mb-2" key={`tr-feature-${idx}`}>
                <Form.Control
                  type="text"
                  value={feat}
                  onChange={e => handleInputChange('features', e.target.value, 'tr', idx)}
                />
                <Button variant="outline-danger" onClick={() => handleRemoveFeature(idx)}>-</Button>
              </InputGroup>
            ))}
            <Button variant="outline-primary" size="sm" onClick={handleAddFeature} className="mb-4">
              + Özellik Ekle
            </Button>

            {/* İngilizce İçerik */}
            <h5>English Content</h5>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={editProduct.translations.en.name}
                onChange={e => handleInputChange('name', e.target.value, 'en')}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editProduct.translations.en.description}
                onChange={e => handleInputChange('description', e.target.value, 'en')}
              />
            </Form.Group>
            <Form.Label>Features</Form.Label>
            {editProduct.translations.en.features.map((feat, idx) => (
              <InputGroup className="mb-2" key={`en-feature-${idx}`}>
                <Form.Control
                  type="text"
                  value={feat}
                  onChange={e => handleInputChange('features', e.target.value, 'en', idx)}
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
        <Button variant="primary" onClick={handleUpdate} disabled={updating}>
          {updating ? <Spinner animation="border" size="sm" /> : 'Güncelle'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProductModal;
