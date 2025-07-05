import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spinner, Alert, Image } from 'react-bootstrap';
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
                <Button size="sm" variant="warning" className="me-2" onClick={() => alert('Ürün düzenleme gelecek.')}>
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
    </div>
  );
};

export default AdminProducts;
