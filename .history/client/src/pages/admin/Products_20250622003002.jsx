import React, { useEffect, useState } from 'react';
// InputGroup import'u eklendi
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

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Bildirim için state
  const [notification, setNotification] = useState(null);

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
        console.error("Fetch Error:", err);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Filtreleme ve arama işlemi
  useEffect(() => {
    let filtered = products;
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category_key === categoryFilter);
    }
    if (searchTerm.trim()) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.translations?.en?.name && p.translations.en.name.toLowerCase().includes(lowercasedSearchTerm)) ||
        (p.translations?.tr?.name && p.translations.tr.name.toLowerCase().includes(lowercasedSearchTerm))
      );
    }
    setFilteredProducts(filtered);
  }, [categoryFilter, searchTerm, products]);

  // Edit/Delete Modal açma/kapatma fonksiyonları
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

  // Basit form inputlarını yöneten fonksiyon
  const handleInputChange = (field, value, lang = null) => {
    if (!editProduct) return;
    if (lang) {
      setEditProduct(prev => ({
        ...prev,
        translations: { ...prev.translations, [lang]: { ...prev.translations[lang], [field]: value } }
      }));
    } else {
      const numericFields = ['price', 'rating'];
      const finalValue = numericFields.includes(field) && value !== '' ? parseFloat(value) : value;
      setEditProduct(prev => ({ ...prev, [field]: finalValue }));
    }
  };

  // Güncelleme işlemi, İngilizce boşsa iptal ve uyarı
  const handleUpdate = async () => {
    if (!editProduct) return;
    setUpdateError(null);

    // Orijinal ürünü bul
    const originalProduct = products.find(p => p._id === editProduct._id);
    if (!originalProduct) {
      setUpdateError('Orijinal ürün bulunamadı.');
      return;
    }

    // Türkçe isim değişmiş mi?
    const trNameChanged = originalProduct.translations.tr.name !== editProduct.translations.tr.name;
    // Eğer Türkçe isim değiştiyse İngilizce isim boş olamaz
    if (trNameChanged && (!editProduct.translations.en.name || editProduct.translations.en.name.trim() === '')) {
      setNotification('İngilizce içerik boş bırakılamaz!');
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    // Güncelleme yapılmadan önce Türkçe ile İngilizce özellik dizisi eşitlensin, İngilizce boşsa güncelleme iptal
    if (trNameChanged) {
      // Eğer Türkçe features varsa ama İngilizce yoksa veya eksikse eşitle
      const trFeatures = editProduct.translations.tr.features || [];
      let enFeatures = editProduct.translations.en.features || [];

      if (enFeatures.length < trFeatures.length) {
        enFeatures = [...enFeatures];
        for (let i = enFeatures.length; i < trFeatures.length; i++) {
          enFeatures[i] = '';
        }
        setEditProduct(prev => ({
          ...prev,
          translations: {
            ...prev.translations,
            en: {
              ...prev.translations.en,
              features: enFeatures
            }
          }
        }));
        setNotification('İngilizce özellikler boş bırakıldı, güncelleme yapılmadı.');
        setTimeout(() => setNotification(null), 4000);
        return;
      }
    }

    setUpdating(true);
    try {
      await axios.put(`http://localhost:5000/admin/updateProduct/${editProduct._id}`, editProduct);
      setProducts(prev => prev.map(p => p._id === editProduct._id ? editProduct : p));
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

  // Silme fonksiyonu şimdilik pasif bırakıldı
  const handleConfirmDelete = async () => {
    // Silme işlemi şimdilik yapılmayacak
    alert('Silme işlemi şimdilik devre dışı.');
    handleDeleteClose();
  };

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      {/* Sağ üstte bildirim */}
      {notification && (
        <Alert variant="warning" style={{ position: 'fixed', top: 20, right: 20, zIndex: 1050 }}>
          {notification}
        </Alert>
      )}

      <h3 className="mb-4">Ürün Yönetimi</h3>
      <Form className="d-flex mb-3 gap-2 flex-wrap">
        <Form.Control type="text" placeholder="Ürün adı ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ maxWidth: '300px' }} />
        <Form.Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ maxWidth: '200px' }}>
          <option value="">Tüm Kategoriler</option>
          {categories.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
        </Form.Select>
        <Button variant="primary" className="ms-auto" onClick={() => alert('Yeni ürün ekleme formu açılacak.')}>+ Yeni Ürün Ekle</Button>
      </Form>
      <Table bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Resim</th><th>Ürün Adı (TR)</th><th>Ürün Adı (EN)</th><th>Kategori</th><th>Fiyat ($)</th><th>Puan</th><th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr><td colSpan="7" className="text-center">Arama kriterlerine uygun ürün bulunamadı.</td></tr>
          ) : (
            filteredProducts.map(product => (
              <tr key={product._id}>
                <td style={{ width: '100px' }}><Image src={product.image} thumbnail alt={product.translations.en.name} /></td>
                <td>{product.translations.tr.name}</td>
                <td>{product.translations.en.name}</td>
                <td>{categories.find(c => c.key === product.category_key)?.label || product.category_key}</td>
                <td>{product.price.toFixed(2)}</td>
                <td>{product.rating.toFixed(1)}</td>
                <td>
                  <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditClick(product)}>Düzenle</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteClick(product)}>Sil</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Düzenleme Modalı */}
      <Modal show={showEditModal} onHide={handleEditClose} backdrop="static" size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Ürün Güncelle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editProduct && (
            <Form>
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

              {/* Türkçe İçerik */}
              <h4>Türkçe İçerik</h4>
              <Form.Group className="mb-3">
                <Form.Label>Ürün Adı (TR)</Form.Label>
                <Form.Control type="text" value={editProduct.translations.tr.name} onChange={e => handleInputChange('name', e.target.value, 'tr')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Açıklama (TR)</Form.Label>
                <Form.Control as="textarea" rows={3} value={editProduct.translations.tr.description} onChange={e => handleInputChange('description', e.target.value, 'tr')} />
              </Form.Group>

              {/* Özellikler kısmı kaldırıldı */}

              <hr />

              {/* İngilizce İçerik */}
              <h4>English Content</h4>
              <Form.Group className="mb-3">
                <Form.Label>Product Name (EN)</Form.Label>
                <Form.Control type="text" value={editProduct.translations.en.name} onChange={e => handleInputChange('name', e.target.value, 'en')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description (EN)</Form.Label>
                <Form.Control as="textarea" rows={3} value={editProduct.translations.en.description} onChange={e => handleInputChange('description', e.target.value, 'en')} />
              </Form.Group>

              {/* İngilizce features kısmı kaldırıldı */}
            </Form>
          )}
          {updateError && <Alert variant="danger" className="mt-2">{updateError}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditClose} disabled={updating}>İptal</Button>
          <Button variant="primary" onClick={handleUpdate} disabled={updating}>
            {updating ? <Spinner animation="border" size="sm" /> : 'Güncelle'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Modalı */}
      <Modal show={showDeleteModal} onHide={handleDeleteClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ürün Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToDelete && (
            <p><strong>{productToDelete.translations.tr.name}</strong> isimli ürünü silmek istediğinize emin misiniz?</p>
          )}
          <Alert variant="warning">
            Not: Silme işlemi şimdilik devre dışı bırakılmıştır.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteClose} disabled={deleting}>İptal</Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>Sil</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminProducts;
