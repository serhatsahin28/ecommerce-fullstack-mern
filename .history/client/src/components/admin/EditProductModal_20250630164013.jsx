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

const EditProductModal = ({
  show,
  onHide,
  editProduct,
  handleInputChange,
  handleRemoveImage,
  handleRemoveFeature,
  handleAddFeature,
  handleUpdate,
  updateError,
  updating,
}) => {
   return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Ürün Düzenle</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {updateError && (
          <Alert variant="danger" className="shadow-sm">
            {updateError}
          </Alert>
        )}

        {editProduct && (
          <Form>
            {/* Ana Resim */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Ürün Resmi</Form.Label>
              <div className="mb-3 d-flex justify-content-center">
                <Image
                  src={editProduct.image}
                  thumbnail
                  style={{ maxHeight: "160px", borderRadius: "8px", boxShadow: "0 0 8px rgba(0,0,0,0.1)" }}
                />
              </div>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => handleInputChange("image", e.target.files)}
              />
            </Form.Group>

            {/* Diğer Resimler */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Diğer Resimler</Form.Label>
              <div className="d-flex flex-wrap mb-3">
                {editProduct.images?.map((img, idx) => (
                  <div
                    key={idx}
                    className="position-relative me-3 mb-3"
                    style={{ width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 0 6px rgba(0,0,0,0.1)" }}
                  >
                    <Image
                      src={img}
                      thumbnail
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 rounded-circle p-1"
                      onClick={() => handleRemoveImage(idx)}
                      style={{ zIndex: 10, lineHeight: "1" }}
                      aria-label="Remove image"
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
                onChange={(e) => handleInputChange("images", e.target.files)}
              />
            </Form.Group>

            {/* Kategori */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Kategori</Form.Label>
              <Form.Select
                value={editProduct.category_key || ""}
                onChange={(e) => handleInputChange("category_key", e.target.value)}
                aria-label="Kategori seçimi"
              >
                <option value="">Kategori seçin</option>
                <option value="fashion">Fashion</option>
                <option value="books">Books</option>
                <option value="electronics">Electronics</option>
                <option value="home_office">Home & Office</option>
              </Form.Select>
            </Form.Group>

            {/* Fiyat */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Fiyat ($)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={editProduct.price || ""}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
              />
            </Form.Group>

            {/* Puan */}
            <Form.Group className="mb-5">
              <Form.Label className="fw-semibold">Puan (0-5)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={editProduct.rating || ""}
                onChange={(e) => handleInputChange("rating", e.target.value)}
                placeholder="0.0"
              />
            </Form.Group>

            {/* Türkçe İçerik */}
            <h5 className="mb-3 border-bottom pb-2 text-primary">Türkçe İçerik</h5>

            <Form.Group className="mb-3">
              <Form.Label>Ürün Adı</Form.Label>
              <Form.Control
                type="text"
                value={editProduct.translations.tr.name}
                onChange={(e) => handleInputChange("name", e.target.value, "tr")}
                placeholder="Ürün adını girin"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editProduct.translations.tr.description}
                onChange={(e) => handleInputChange("description", e.target.value, "tr")}
                placeholder="Ürün açıklamasını girin"
              />
            </Form.Group>

            <Form.Label className="fw-semibold mb-2 d-block">Özellikler</Form.Label>
            {editProduct.translations.tr.features.map((feat, idx) => (
              <InputGroup className="mb-2" key={`tr-feature-${idx}`}>
                <Form.Control
                  type="text"
                  value={feat}
                  onChange={(e) => handleInputChange("features", e.target.value, "tr", idx)}
                  placeholder="Özellik girin"
                />
                <Button
                  variant="outline-danger"
                  onClick={() => handleRemoveFeature(idx)}
                  aria-label="Özellik kaldır"
                >
                  &minus;
                </Button>
              </InputGroup>
            ))}
            <Button variant="outline-primary" size="sm" onClick={handleAddFeature} className="mb-5">
              + Özellik Ekle
            </Button>

            {/* İngilizce İçerik */}
            <h5 className="mb-3 border-bottom pb-2 text-primary">English Content</h5>

            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={editProduct.translations.en.name}
                onChange={(e) => handleInputChange("name", e.target.value, "en")}
                placeholder="Enter product name"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editProduct.translations.en.description}
                onChange={(e) => handleInputChange("description", e.target.value, "en")}
                placeholder="Enter description"
              />
            </Form.Group>

            <Form.Label className="fw-semibold mb-2 d-block">Features</Form.Label>
            {editProduct.translations.en.features.map((feat, idx) => (
              <InputGroup className="mb-2" key={`en-feature-${idx}`}>
                <Form.Control
                  type="text"
                  value={feat}
                  onChange={(e) => handleInputChange("features", e.target.value, "en", idx)}
                  placeholder="Enter feature"
                />
              </InputGroup>
            ))}
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={onHide} disabled={updating}>
          İptal
        </Button>
        <Button variant="primary" onClick={handleUpdate} disabled={updating} className="d-flex align-items-center">
          {updating && <Spinner animation="border" size="sm" className="me-2" />}
          Güncelle
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
};

export default EditProductModal;