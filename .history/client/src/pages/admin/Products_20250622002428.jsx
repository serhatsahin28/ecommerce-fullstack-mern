import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spinner, Alert, Image, Modal, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const categories = [
  { key: 'electronics', label: 'Electronics' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'books', label: 'Books' },
  { key: 'home_office', label: 'Home & Office' }
];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal ve düzenleme durumu
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Global başarı mesajı ekran sağ üst köşesi için
  const [globalSuccessMessage, setGlobalSuccessMessage] = useState('');

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get('http://localhost:5000/admin/productsList');
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError('Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (categoryFilter) filtered = filtered.filter(p => p.category_key === categoryFilter);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.translations?.en?.name?.toLowerCase().includes(term)) ||
        (p.translations?.tr?.name?.toLowerCase().includes(term))
      );
    }
    setFilteredProducts(filtered);
  }, [categoryFilter, searchTerm, products]);

  const handleEditClick = (product) => {
    setEditProduct(JSON.parse(JSON.stringify(product)));
    setUpdateError(null);
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditProduct(null);
    setUpdateError(null);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Türkçe içerik güncellenirken İngilizce'ye otomatik ekleme yapılacak
  const handleInputChange = (field, value, lang = null) => {
    if (!editProduct) return;

    if (lang) {
      setEditProduct(prev => {
        const newTranslations = { ...prev.translations };

        // Eğer Türkçe ise ve features veya description ekleniyorsa,
        // aynı veri İngilizceye de eklenmeli (boşsa)
        if (lang === 'tr' && (field === 'features' || field === 'description' || field === 'name')) {
          if (field === 'features') {
            // features dizisi için, sadece ekleme ve silme inputlarda yapılıyor, onu handleArrayInputChange ile yapıyoruz
            // Burada features değişikliği yok, features array değişikliği ayrı fonksiyonda olacak.
            return prev;
          }
          // Eğer description ya da name ise, İngilizce boşsa otomatik kopyala
          if (!newTranslations.en[field] || newTranslations.en[field].trim() === '') {
            newTranslations.en[field] = value;
          }
        }

        if (field === 'features') {
          // features dizi inputları ayrı fonksiyonda işleniyor, burada işlem yok
          return prev;
        }

        newTranslations[lang][field] = value;
        return { ...prev, translations: newTranslations };
      });
    } else {
      const numericFields = ['price', 'rating'];
      const finalValue = numericFields.includes(field) && value !== '' ? parseFloat(value) : value;
      setEditProduct(prev => ({ ...prev, [field]: finalValue }));
    }
  };

  // Özellikler (features) için dizi inputlar
  const handleArrayInputChange = (arrayName, lang, index, value) => {
    setEditProduct(prev => {
      const newTranslations = { ...prev.translations };
      const newArray = [...newTranslations[lang][arrayName]];
      newArray[index] = value;
      newTranslations[lang][arrayName] = newArray;

      // Eğer TR'de özellik değişmişse, EN'de karşılığı yoksa otomatik ekle
      if (arrayName === 'features' && lang === 'tr') {
        if (!newTranslations.en.features) newTranslations.en.features = [];
        if (newTranslations.en.features.length <= index) {
          newTranslations.en.features.push(value);
        }
      }

      return { ...prev, translations: newTranslations };
    });
  };

  const addArrayItem = (arrayName, lang) => {
    setEditProduct(prev => {
      const newTranslations = { ...prev.translations };
      const newArray = [...(newTranslations[lang][arrayName] || []), ''];
      newTranslations[lang][arrayName] = newArray;

      // TR'de ekleme varsa EN'de de boş ekle
      if (arrayName === 'features' && lang === 'tr') {
        if (!newTranslations.en.features) newTranslations.en.features = [];
        newTranslations.en.features.push('');
      }

      return { ...prev, translations: newTranslations };
    });
  };

  const removeArrayItem = (arrayName, lang, index) => {
    setEditProduct(prev => {
      const newTranslations = { ...prev.translations };
      newTranslations[lang][arrayName] = newTranslations[lang][arrayName].filter((_, i) => i !== index);

      // TR'den silindiyse EN'den de aynı indeksi sil
      if (arrayName === 'features' && lang === 'tr') {
        if (newTranslations.en.features) {
          newTranslations.en.features = newTranslations.en.features.filter((_, i) => i !== index);
        }
      }
      return { ...prev, translations: newTranslations };
    });
  };

  // Güncelleme öncesi değişiklik var mı kontrolü
  // Teknik özellikler kaldırıldı, onları dikkate almıyoruz.
  const hasSignificantChanges = (original, edited) => {
    // Basit alanlar
    if (original.category_key !== edited.category_key) return true;
    if (original.price !== edited.price) return true;
    if (original.rating !== edited.rating) return true;

    // translations kontrolü - sadece name, description ve features
    const langs = ['tr', 'en'];
    for (const lang of langs) {
      if (!original.translations[lang]) return true;
      if (!edited.translations[lang]) return true;

      if (original.translations[lang].name !== edited.translations[lang].name) return true;
      if (original.translations[lang].description !== edited.translations[lang].description) return true;

      // features dizisi karşılaştırması
      const origFeatures = original.translations[lang].features || [];
      const editedFeatures = edited.translations[lang].features || [];
      if (origFeatures.length !== editedFeatures.length) return true;
      for (let i = 0; i < origFeatures.length; i++) {
        if (origFeatures[i] !== editedFeatures[i]) return true;
      }
    }

    return false;
  };

  // İngilizce alanların boş olması kontrolü (tr dolu ise en boşsa güncelleme iptal)
  const isEnglishContentValid = (edited) => {
    if (!edited.translations.en) return false;

    if (
      (!edited.translations.en.name || edited.translations.en.name.trim() === '') ||
      (!edited.translations.en.description || edited.translations.en.description.trim() === '')
    ) return false;

    // features varsa hepsi boşsa false, en az bir dolu olması yeterli olabilir
    const enFeatures = edited.translations.en.features || [];
    const hasFeature = enFeatures.some(f => f.trim() !== '');
    const trFeatures = edited.translations.tr.features || [];
    const trHasFeature = trFeatures.some(f => f.trim() !== '');

    if (trHasFeature && !hasFeature) return false;

    return true;
  };

  const handleUpdate = async () => {
    if (!editProduct) return;

    const original = products.find(p => p._id === editProduct._id);

    if (!hasSignificantChanges(original, editProduct)) {
      // Değişiklik yok, yine de başarılı mesaj göster
      setShowEditModal(false);
      setGlobalSuccessMessage('Ürün başarılı bir şekilde güncellendi.');
      setTimeout(() => setGlobalSuccessMessage(''), 3000);
      return;
    }

    if (!isEnglishContentValid(editProduct)) {
      setUpdateError('İngilizce içerik boş bırakılamaz, Türkçe eklediyseniz İngilizceyi de doldurun.');
      return;
    }

    setUpdating(true);
    setUpdateError(null);
    try {
      await axios.put(`http://localhost:5000/admin/updateProduct/${editProduct._id}`, editProduct);

      setProducts(prev => prev.map(p => (p._id === editProduct._id ? editProduct : p)));
      setShowEditModal(false);

      setGlobalSuccessMessage('Ürün başarılı bir şekilde güncellendi.');
      setTimeout(() => setGlobalSuccessMessage(''), 3000);
    } catch (err) {
      setUpdateError('Ürün güncellenirken bir hata oluştu.');
    } finally {
      setUpdating(false);
    }
  };

  // Silme işlemi aynı kaldı (kısaltıyorum)

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div style={{ position: 'relative' }}>
      <h3 className="mb-4">Ürün Yönetimi</h3>

      {/* Global Başarı Mesajı - ekran sağ üst köşe */}
      {globalSuccessMessage && (
        <Alert
          variant="success"
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1050,
            minWidth: '250px',
          }}
        >
          {globalSuccessMessage}
        </Alert>
      )}

      <Form className="d-flex mb-3 gap-2 flex-wrap">
        {/* Kategori filtre */}
        <Form.Select
          style={{ maxWidth: 200 }}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          aria-label="Kategori Filtre"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.label}</option>
          ))}
        </Form.Select>

        <Form.Control
          type="search"
          placeholder="Ürün ara..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </Form>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Ürün Adı (TR)</th>
            <th>Fiyat</th>
            <th>Kategori</th>
            <th>Puan</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(product => (
            <tr key={product._id}>
              <td>{product.translations?.tr?.name}</td>
              <td>{product.price}₺</td>
              <td>{categories.find(c => c.key === product.category_key)?.label}</td>
              <td>{product.rating}</td>
              <td>
                <Button variant="outline-primary" size="sm" onClick={() => handleEditClick(product)}>Düzenle</Button>{' '}
                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(product)}>Sil</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Düzenleme Modal */}
      <Modal show={showEditModal} onHide={handleEditClose} backdrop="static" centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ürün Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editProduct && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Kategori</Form.Label>
                <Form.Select
                  value={editProduct.category_key}
                  onChange={e => setEditProduct(prev => ({ ...prev, category_key: e.target.value }))}
                >
                  {categories.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fiyat</Form.Label>
                <Form.Control
                  type="number"
                  value={editProduct.price}
                  onChange={e => setEditProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Puan</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={editProduct.rating}
                  onChange={e => setEditProduct(prev => ({ ...prev, rating: Number(e.target.value) }))}
                />
              </Form.Group>

              <hr />

              <h4>Türkçe İçerik</h4>
              <Form.Group className="mb-3">
                <Form.Label>Ürün Adı (TR)</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.translations.tr.name}
                  onChange={e => handleInputChange('name', e.target.value, 'tr')}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Açıklama (TR)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editProduct.translations.tr.description}
                  onChange={e => handleInputChange('description', e.target.value, 'tr')}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Özellikler (TR)</Form.Label>
                {editProduct.translations.tr.features?.map((feature, index) => (
                  <InputGroup className="mb-2" key={index}>
                    <Form.Control
                      value={feature}
                      onChange={e => handleArrayInputChange('features', 'tr', index, e.target.value)}
                    />
                    <Button variant="outline-danger" onClick={() => removeArrayItem('features', 'tr', index)}>Sil</Button>
                  </InputGroup>
                ))}
                <Button variant="outline-primary" onClick={() => addArrayItem('features', 'tr')}>
                  + Özellik Ekle
                </Button>
              </Form.Group>

              <hr />

              <h4>İngilizce İçerik</h4>
              <Form.Group className="mb-3">
                <Form.Label>Ürün Adı (EN)</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.translations.en.name}
                  onChange={e => handleInputChange('name', e.target.value, 'en')}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Açıklama (EN)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editProduct.translations.en.description}
                  onChange={e => handleInputChange('description', e.target.value, 'en')}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Özellikler (EN)</Form.Label>
                {editProduct.translations.en.features?.map((feature, index) => (
                  <InputGroup className="mb-2" key={index}>
                    <Form.Control
                      value={feature}
                      onChange={e => handleArrayInputChange('features', 'en', index, e.target.value)}
                    />
                    <Button variant="outline-danger" onClick={() => removeArrayItem('features', 'en', index)}>Sil</Button>
                  </InputGroup>
                ))}
                <Button variant="outline-primary" onClick={() => addArrayItem('features', 'en')}>
                  + Feature Add
                </Button>
              </Form.Group>
            </Form>
          )}
          {updateError && <Alert variant="danger" className="mt-3">{updateError}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditClose} disabled={updating}>
            İptal
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={updating}>
            {updating ? <Spinner as="span" animation="border" size="sm" /> : 'Güncelle'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Modalı */}
      <Modal show={showDeleteModal} onHide={handleDeleteClose} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Ürünü Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToDelete && (
            <p>
              <strong>{productToDelete.translations.tr.name}</strong> adlı ürünü silmek istediğinize emin misiniz?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteClose} disabled={deleting}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? <Spinner as="span" animation="border" size="sm" /> : 'Sil'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminProducts;
