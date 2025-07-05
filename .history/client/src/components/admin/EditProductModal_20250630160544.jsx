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
  products
}) => {

  const handleInputChange = (field, value, lang = null, index = null) => {
    if (!editProduct) return;

    if (lang && index !== null) {
      // Features array update for translations
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
      // Other translation fields update
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
      // Single main image update with base64 preview
      if (value && value[0]) {
        const file = value[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditProduct(prev => ({ ...prev, image: reader.result, imageFile: file }));
        };
        reader.readAsDataURL(file);
      }
    } else if (field === 'images') {
      // Multiple images update - add new files and create preview URLs
      const files = Array.from(value);
      const newFilePaths = files.map(file => URL.createObjectURL(file));
      setEditProduct(prev => ({
        ...prev,
        images: prev.images ? [...prev.images, ...newFilePaths] : newFilePaths,
        newImageFiles: prev.newImageFiles ? [...prev.newImageFiles, ...files] : files
      }));
    } else {
      // Numeric fields with validation
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

  const handleUpdate = async (updatedProduct) => {
  try {
    setUpdating(true);

    const formData = new FormData();

    // Diğer ürün bilgilerini FormData'ya ekle
    for (const key in updatedProduct) {
      if (key !== 'imageFile' && key !== 'newImageFiles') {
        if (key === 'translations') {
          formData.append(key, JSON.stringify(updatedProduct[key]));
        } else {
          formData.append(key, updatedProduct[key]);
        }
      }
    }

    // Ana resim dosyası varsa ekle
    if (updatedProduct.imageFile) {
      formData.append('image', updatedProduct.imageFile);
    }

    // Yeni çoklu resimler varsa ekle
    if (updatedProduct.newImageFiles && updatedProduct.newImageFiles.length > 0) {
      updatedProduct.newImageFiles.forEach(file => {
        formData.append('image', file); // 'image' field name kullanıyoruz çünkü backend upload.array('image') bekliyor
      });
    }

    // Tek bir API çağrısı (PUT)
    await axios.put(
      `http://localhost:5000/admin/updateProduct/${updatedProduct._id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // UI güncelleme
    setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    handleEditClose();

    setNotification('Ürün başarıyla güncellendi!');
    setTimeout(() => setNotification(null), 4000);

  } catch (err) {
    setUpdateError('Ürün güncellenirken bir hata oluştu.');
    console.error("Update Error:", err);
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
        {updateError && <Alert variant="danger">{updateError}</Alert> }
        {editProduct && (
          <Form>
            {/* Ana Ürün Resmi */}
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
                {editProduct.images && editProduct.images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', marginRight: 10, marginBottom: 10 }}>
                    <Image
                      src={img.startsWith('/images/') ? img : img}
                      thumbnail
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      alt={`image-${idx}`}
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

            {/* Fiyat */}
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

            {/* Puan */}
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

            {/* Türkçe İçerik */}
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
