import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spinner, Alert, Image, Modal, InputGroup } from 'react-bootstrap';
import axios from 'axios';

// ... (categories array'i aynı kalıyor)

const AdminProducts = () => {
  // ... (mevcut state'ler aynı kalıyor)
  // [showEditModal, setShowEditModal] = useState(false); etc.

  // --- YENİ FONKSİYONLAR ---

  // Dizi içindeki bir input'un değerini güncellemek için
  const handleArrayInputChange = (arrayName, lang, index, value) => {
    setEditProduct(prev => {
      const newTranslations = { ...prev.translations };
      const newArray = [...newTranslations[lang][arrayName]];
      newArray[index] = value;
      newTranslations[lang][arrayName] = newArray;
      return { ...prev, translations: newTranslations };
    });
  };

  // Diziye yeni bir eleman eklemek için
  const addArrayItem = (arrayName, lang) => {
    setEditProduct(prev => {
      const newTranslations = { ...prev.translations };
      const newArray = [...(newTranslations[lang][arrayName] || []), '']; // Eğer dizi yoksa boş dizi oluştur
      newTranslations[lang][arrayName] = newArray;
      return { ...prev, translations: newTranslations };
    });
  };

  // Diziden bir elemanı silmek için
  const removeArrayItem = (arrayName, lang, index) => {
    setEditProduct(prev => {
      const newTranslations = { ...prev.translations };
      const newArray = newTranslations[lang][arrayName].filter((_, i) => i !== index);
      newTranslations[lang][arrayName] = newArray;
      return { ...prev, translations: newTranslations };
    });
  };


  // --- DÜZENLENMİŞ FONKSİYONLAR ---

  // Form input değişimlerini handle etme (description gibi basit alanlar için)
  const handleInputChange = (field, value, lang = null) => {
    if (!editProduct) return;

    if (lang) {
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
    } else {
      const numericFields = ['price', 'rating'];
      const finalValue = numericFields.includes(field) && value !== '' ? parseFloat(value) : value;
      setEditProduct(prev => ({
        ...prev,
        [field]: finalValue
      }));
    }
  };


  // ... (diğer tüm fonksiyonlar - fetch, delete, update - aynı kalabilir)

  return (
    <div>
      {/* ... (Tablo ve filtreleme kısmı aynı) */}

      {/* Düzenleme Modalı */}
      <Modal show={showEditModal} onHide={handleEditClose} backdrop="static" size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Ürün Güncelle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editProduct && (
            <Form>
              {/* --- Mevcut Alanlar --- */}
              <Form.Group className="mb-3">
                <Form.Label>Kategori</Form.Label>
                <Form.Select value={editProduct.category_key} onChange={e => handleInputChange('category_key', e.target.value)}>
                  {categories.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fiyat ($)</Form.Label>
                <Form.Control type="number" step="0.01" value={editProduct.price} onChange={e => handleInputChange('price', e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Puan</Form.Label>
                <Form.Control type="number" step="0.1" min="0" max="5" value={editProduct.rating} onChange={e => handleInputChange('rating', e.target.value)} />
              </Form.Group>
              
              <hr />

              {/* --- Türkçe İçerikler --- */}
              <h4>Türkçe İçerik</h4>
              <Form.Group className="mb-3">
                <Form.Label>Ürün Adı (TR)</Form.Label>
                <Form.Control type="text" value={editProduct.translations.tr.name} onChange={e => handleInputChange('name', e.target.value, 'tr')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Açıklama (TR)</Form.Label>
                <Form.Control as="textarea" rows={3} value={editProduct.translations.tr.description} onChange={e => handleInputChange('description', e.target.value, 'tr')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Özellikler (TR)</Form.Label>
                {editProduct.translations.tr.features?.map((feature, index) => (
                  <InputGroup className="mb-2" key={index}>
                    <Form.Control value={feature} onChange={(e) => handleArrayInputChange('features', 'tr', index, e.target.value)} />
                    <Button variant="outline-danger" onClick={() => removeArrayItem('features', 'tr', index)}>Sil</Button>
                  </InputGroup>
                ))}
                <Button variant="outline-success" size="sm" onClick={() => addArrayItem('features', 'tr')}>+ Özellik Ekle</Button>
              </Form.Group>
              {/* Reviews için de aynı mantık eklenebilir. Şimdilik features yeterli. */}

              <hr />

              {/* --- İngilizce İçerikler --- */}
              <h4>English Content</h4>
              <Form.Group className="mb-3">
                <Form.Label>Product Name (EN)</Form.Label>
                <Form.Control type="text" value={editProduct.translations.en.name} onChange={e => handleInputChange('name', e.target.value, 'en')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description (EN)</Form.Label>
                <Form.Control as="textarea" rows={3} value={editProduct.translations.en.description} onChange={e => handleInputChange('description', e.target.value, 'en')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Features (EN)</Form.Label>
                {editProduct.translations.en.features?.map((feature, index) => (
                  <InputGroup className="mb-2" key={index}>
                    <Form.Control value={feature} onChange={(e) => handleArrayInputChange('features', 'en', index, e.target.value)} />
                    <Button variant="outline-danger" onClick={() => removeArrayItem('features', 'en', index)}>Sil</Button>
                  </InputGroup>
                ))}
                <Button variant="outline-success" size="sm" onClick={() => addArrayItem('features', 'en')}>+ Add Feature</Button>
              </Form.Group>

              {updateError && <Alert variant="danger">{updateError}</Alert>}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* ... (Modal footer aynı) */}
          <Button variant="secondary" onClick={handleEditClose} disabled={updating}>
            Kapat
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={updating}>
            {updating ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Güncelleniyor...</> : 'Değişiklikleri Kaydet'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modalı (Aynı kalıyor) */}
      {/* ... */}
    </div>
  );
};

export default AdminProducts;