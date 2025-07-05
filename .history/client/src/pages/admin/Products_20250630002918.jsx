import React, { useState, useEffect } from 'react';
import { Button, Spinner, Alert, Table, Pagination, InputGroup, FormControl } from 'react-bootstrap';
import EditProductModal from './EditProductModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Ürünler yüklenirken hata oluştu.');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    // Derin kopya yapıyoruz, böylece modalda düzenlerken orijinal bozulmaz
    const productCopy = JSON.parse(JSON.stringify(product));

    // Özellikler arrayleri yoksa en ve tr için boş array yapalım
    if (!productCopy.translations.tr.features) productCopy.translations.tr.features = [];
    if (!productCopy.translations.en.features) productCopy.translations.en.features = [];

    setEditProduct(productCopy);
    setModalShow(true);
    setUpdateError(null);
  };

  const handleUpdateProduct = async (updatedProduct) => {
    setUpdating(true);
    setUpdateError(null);
    try {
      // imageFile veya newImageFiles varsa onları backend'e uygun şekilde gönderme ihtiyacı var.
      // Burada base64 image direkt gönderme yapıyoruz ama gerçek projede FormData ile göndermek daha sağlıklı.
      // Sadece örnek amaçlıdır.
      const res = await fetch(`/api/products/${updatedProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Güncelleme başarısız oldu.');
      }
      const data = await res.json();

      // Ürün listesinde güncelle
      setProducts(prev => prev.map(p => (p._id === data._id ? data : p)));

      setNotification('Ürün başarıyla güncellendi.');
      setModalShow(false);
      setEditProduct(null);
    } catch (err) {
      setUpdateError(err.message || 'Güncelleme sırasında hata oluştu.');
    } finally {
      setUpdating(false);
    }
  };

  const handleNotification = (msg, variant = 'warning') => {
    setNotification({ message: msg, variant });
    setTimeout(() => setNotification(null), 5000);
  };

  // Pagination
  const filteredProducts = products.filter(p =>
    p.translations.tr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.translations.en.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mt-4">
      <h2>Ürünler</h2>
      {notification && (
        <Alert variant={notification.variant || 'info'} onClose={() => setNotification(null)} dismissible>
          {notification.message}
        </Alert>
      )}
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Ürün ara..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </InputGroup>

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Resim</th>
                <th>Türkçe Ad</th>
                <th>İngilizce Ad</th>
                <th>Fiyat ($)</th>
                <th>Puan</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">Ürün bulunamadı.</td>
                </tr>
              )}
              {paginatedProducts.map(product => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={product.image}
                      alt={product.translations.tr.name}
                      style={{ maxHeight: '60px' }}
                    />
                  </td>
                  <td>{product.translations.tr.name}</td>
                  <td>{product.translations.en.name}</td>
                  <td>{product.price?.toFixed(2)}</td>
                  <td>{product.rating?.toFixed(1)}</td>
                  <td>
                    <Button size="sm" onClick={() => handleEditClick(product)}>
                      Düzenle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination>
            <Pagination.First disabled={currentPage === 1} onClick={() => setCurrentPage(1)} />
            <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
            {[...Array(totalPages).keys()].map(num => (
              <Pagination.Item
                key={num + 1}
                active={num + 1 === currentPage}
                onClick={() => setCurrentPage(num + 1)}
              >
                {num + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} />
            <Pagination.Last disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} />
          </Pagination>
        </>
      )}

      <EditProductModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setEditProduct(null);
          setUpdateError(null);
        }}
        editProduct={editProduct}
        setEditProduct={setEditProduct}
        updating={updating}
        updateError={updateError}
        onUpdate={handleUpdateProduct}
        onNotification={handleNotification}
        products={products}
      />
    </div>
  );
};

export default Products;
