import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spinner, Alert, Image, Modal } from 'react-bootstrap';
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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get('http://localhost:5000/admin/productsList'); // 
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
        (p.translations.en.name && p.translations.en.name.toLowerCase().includes(lowercasedSearchTerm)) ||
        (p.translations.tr.name && p.translations.tr.name.toLowerCase().includes(lowercasedSearchTerm))
      );
    }
    setFilteredProducts(filtered);
  }, [categoryFilter, searchTerm, products]);

  // Edit Modal açma
  const handleEditClick = (product) => {
    setEditProduct(JSON.parse(JSON.stringify(product))); // Deep copy
    setUpdateError(null);
    setShowEditModal(true);
  };

  // Edit Modal kapatma
  const handleEditClose = () => {
    setShowEditModal(false);
    setEditProduct(null);
    setUpdateError(null);
  };
  
  // Delete Modal açma
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Delete Modal kapatma
  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Form input değişimlerini handle etme
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
      // Sayısal alanları doğru şekilde işle
      const numericFields = ['price', 'rating'];
      const finalValue = numericFields.includes(field) && value !== '' ? parseFloat(value) : value;
      setEditProduct(prev => ({
        ...prev,
        [field]: finalValue
      }));
    }
  };

  // Güncelleme işlemi
  const handleUpdate = async () => {
    if (!editProduct) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      // Backend update isteği (PUT)
      await axios.put(`http://localhost:5000/admin/products/${editProduct._id}`, editProduct);

      // Frontend state'ini güncelle
      const updateFunction = p => p._id === editProduct._id ? editProduct : p;
      setProducts(prev => prev.map(updateFunction));
      setFilteredProducts(prev => prev.map(updateFunction));

      handleEditClose();
    } catch (err) {
      setUpdateError('Ürün güncellenirken bir hata oluştu.');
      console.error("Update Error:", err);
    } finally {
      setUpdating(false);
    }
  };
  
  // Silme işlemini onayla
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/admin/products/${productToDelete._id}`);

      // Frontend state'inden sil
      const filterFunction = p => p._id !== productToDelete._id;
      setProducts(prev => prev.filter(filterFunction));
      setFilteredProducts(prev => prev.filter(filterFunction));
      
      handleDeleteClose();
    } catch (err) {
      console.error("Delete Error:", err);
      // Silme modalında bir hata mesajı gösterebiliriz
      alert('Ürün silinirken bir hata oluştu.');
    } finally {
      setDeleting(false);
    }
  };


  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h3 className="mb-4">Ürün Yönetimi</h3>

      <Form className="d-flex mb-3 gap-2 flex-wrap">
        <Form.Control
          type="text"
          placeholder="Ürün adı ara..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px' }}
        />

        <Form.Select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.label}</option>
          ))}
        </Form.Select>

        <Button variant="primary" className="ms-auto" onClick={() => alert('Yeni ürün ekleme formu açılacak.')}>
          + Yeni Ürün Ekle
        </Button>
      </Form>

      <Table bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Resim</th>
            <th>Ürün Adı (TR)</th>
            <th>Ürün Adı (EN)</th>
            <th>Kategori</th>
            <th>Fiyat ($)</th>
            <th>Puan</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">Arama kriterlerine uygun ürün bulunamadı.</td>
            </tr>
          ) : (
            filteredProducts.map(product => (
              <tr key={product._id}>
                <td style={{ width: '100px' }}>
                  <Image src={product.image} thumbnail alt={product.translations.en.name} />
                </td>
                <td>{product.translations.tr.name}</td>
                <td>{product.translations.en.name}</td>
                <td>{categories.find(c => c.key === product.category_key)?.label || product.category_key}</td>
                <td>{product.price.toFixed(2)}</td>
                <td>{product.rating.toFixed(1)}</td>
                <td>
                  <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditClick(product)}>
                    Düzenle
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteClick(product)}>
                    Sil
                  </Button>
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
              <Form.Group className="mb-3" controlId="categorySelect">
                <Form.Label>Kategori</Form.Label>
                <Form.Select
                  value={editProduct.category_key}
                  onChange={e => handleInputChange('category_key', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="priceInput">
                <Form.Label>Fiyat ($)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={editProduct.price}
                  onChange={e => handleInputChange('price', e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="ratingInput">
                <Form.Label>Puan</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1" min="0" max="5"
                  value={editProduct.rating}
                  onChange={e => handleInputChange('rating', e.target.value)}
                />
              </Form.Group>

              <h5>Türkçe</h5>
              <Form.Group className="mb-3" controlId="trNameInput">
                <Form.Label>Ürün Adı</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.translations.tr.name}
                  onChange={e => handleInputChange('name', e.target.value, 'tr')}
                />
              </Form.Group>

              <h5>English</h5>
              <Form.Group className="mb-3" controlId="enNameInput">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.translations.en.name}
                  onChange={e => handleInputChange('name', e.target.value, 'en')}
                />
              </Form.Group>

              {updateError && <Alert variant="danger">{updateError}</Alert>}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditClose} disabled={updating}>
            Kapat
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={updating}>
            {updating ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Güncelleniyor...</> : 'Değişiklikleri Kaydet'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modalı */}
      <Modal show={showDeleteModal} onHide={handleDeleteClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Silme Onayı</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <strong>{productToDelete?.translations.tr.name}</strong> adlı ürünü kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteClose} disabled={deleting}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Siliniyor...</> : 'Sil'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminProducts;