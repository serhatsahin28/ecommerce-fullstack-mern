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

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('http://localhost:5000/admin/productsList');
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError('Ürünler yüklenirken hata oluştu.');
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
      filtered = filtered.filter(p => 
        p.translations.en.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.translations.tr.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [categoryFilter, searchTerm, products]);

  // Modal açma fonksiyonu
  const handleEditClick = (product) => {
    // Deep copy et, ki state değiştirmeyelim direkt
    setEditProduct(JSON.parse(JSON.stringify(product)));
    setUpdateError(null);
    setShowModal(true);
  };

  // Modal kapatma
  const handleClose = () => {
    setShowModal(false);
    setEditProduct(null);
    setUpdateError(null);
  };

  // Input değişimlerini handle et
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
      setEditProduct(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Güncelleme işlemi
  const handleUpdate = async () => {
    if (!editProduct) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      // Backend update isteği (PUT veya PATCH)
      // Örnek: await axios.put(`http://localhost:5000/admin/products/${editProduct._id}`, editProduct);

      // Şimdilik frontend'de güncelleme simülasyonu:
      setProducts(prevProducts => prevProducts.map(p => p._id === editProduct._id ? editProduct : p));
      setFilteredProducts(prevProducts => prevProducts.map(p => p._id === editProduct._id ? editProduct : p));

      setShowModal(false);
      setEditProduct(null);
    } catch (err) {
      setUpdateError('Güncelleme sırasında hata oluştu.');
    }

    setUpdating(false);
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

        <Button variant="primary" className="ms-auto" onClick={() => alert('Ürün ekleme sayfası gelecek.')}>
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
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center">Ürün bulunamadı.</td>
            </tr>
          )}

          {filteredProducts.map(product => (
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
                <Button size="sm" variant="danger" onClick={() => alert('Ürün silme işlemi gelecek.')}>
                  Sil
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Düzenleme Modalı */}
      <Modal show={showModal} onHide={handleClose} backdrop="static" size="lg" centered>
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
                  onChange={e => handleInputChange('price', parseFloat(e.target.value))}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="ratingInput">
                <Form.Label>Puan</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={editProduct.rating}
                  onChange={e => handleInputChange('rating', parseFloat(e.target.value))}
                />
              </Form.Group>

              {/* TR */}
              <h5>Türkçe</h5>
              <Form.Group className="mb-3" controlId="trNameInput">
                <Form.Label>Ürün Adı</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.translations.tr.name}
                  onChange={e => handleInputChange('name', e.target.value, 'tr')}
                />
              </Form.Group>

              {/* EN */}
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
