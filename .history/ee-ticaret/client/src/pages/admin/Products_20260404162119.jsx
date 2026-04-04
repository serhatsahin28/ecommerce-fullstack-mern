// AdminProducts.jsx - Ana component (güncellenmiş)
import React, { useEffect, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import ProductsHeader from '../../components/admin/ProductsHeader';
import ProductsTable from '../../components/admin/ProductsTable';
import EditProductModal from '../../components/admin/EditProductModal';
import DeleteProductModal from '../../components/admin/DeleteProductModal';
import NotificationAlert from '../../components/admin/notificationAlert';
import AddProductModal from '../../components/admin/AddProductModal';
import { Toast, ToastContainer } from 'react-bootstrap';
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);


  // Add Product Modal states
  const [showAddModal, setShowAddModal] = useState(false);

  const [notification, setNotification] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ message: '', bg: 'success' });
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/productsList`);
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

  useEffect(() => {
    let filtered = products;
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category_key === categoryFilter);
    }
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.translations?.en?.name && p.translations.en.name.toLowerCase().includes(lower)) ||
        (p.translations?.tr?.name && p.translations.tr.name.toLowerCase().includes(lower))
      );
    }
    setFilteredProducts(filtered);
  }, [categoryFilter, searchTerm, products]);

  const handleEditClick = (product) => {
    const deepCopy = JSON.parse(JSON.stringify(product));
    if (!deepCopy.translations.tr.features) deepCopy.translations.tr.features = [];
    if (!deepCopy.translations.en.features) deepCopy.translations.en.features = [];
    setEditProduct(deepCopy);
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
  const notify = (msg, type = 'success') => {
    setToastData({ message: msg, bg: type });
    setShowToast(true);
  };
  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Add Product Modal handlers
  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleAddClose = () => {
    setShowAddModal(false);
  };

  const handleProductAdded = (addedProduct) => {

    setProducts(prev => [...prev, addedProduct]);
    setShowAddModal(false);
  };

  // Products.jsx içindeki fonksiyon
  const handleUpdate = async (id, formData) => {
    try {
      setUpdating(true);
      const response = await axios.put(
        `http://${import.meta.env.VITE_API_URL}/admin/updateProduct/${id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        // Başarılı bildirimi
        notify("Ürün başarıyla güncellendi!", "success");

        // State güncelleme (Listeyi yenilemeden)
        setProducts(prev => prev.map(p => p._id === id ? response.data.product : p));

        // Modalı kapat
        setShowEditModal(false);
      }
    } catch (err) {
      console.error("Update Error:", err);
      // Başarısız bildirimi
      notify("Hata: Ürün güncellenemedi!", "danger");
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true); // Yükleme durumunu başlat

      // Backend'e silme isteği gönder
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/productsDelete/${productToDelete._id}`);
      // UI'dan silinen ürünü kaldır
      setProducts(prev => prev.filter(p => p._id !== productToDelete._id));

      // Modal'ı kapat
      handleDeleteClose();

      // Bildirim göster
      setNotification({ message: 'Ürün başarıyla silindi!', type: 'success' });
      setTimeout(() => setNotification(null), 4000);

    } catch (err) {
      console.error("Delete Error:", err);
      setNotification({ message: 'Ürün silinirken bir hata oluştu.', type: 'danger' });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setDeleting(false); // Yükleme durumunu bitir
    }
  };



  const showNotification = (message, type = 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <NotificationAlert notification={notification} />

      <ProductsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        onAddProductClick={handleAddClick}
      />

      <ProductsTable
        products={filteredProducts}
        categories={categories}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <EditProductModal
        show={showEditModal}
        onHide={handleEditClose}
        editProduct={editProduct}
        setEditProduct={setEditProduct}
        updating={updating}
        updateError={updateError}
        onUpdate={handleUpdate}
        onNotification={showNotification}
        products={products}
      />

      <DeleteProductModal
        show={showDeleteModal}
        onHide={handleDeleteClose}
        productToDelete={productToDelete}
        deleting={deleting}
        onConfirmDelete={handleConfirmDelete}
      />

      <AddProductModal
        show={showAddModal}
        onHide={handleAddClose}
        onNotification={showNotification}
        onProductAdded={handleProductAdded}
      />

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastData.bg}
        >
          <Toast.Header closeButton={false} className="text-white" style={{ background: 'rgba(0,0,0,0.1)' }}>
            <strong className="me-auto">Sistem Bildirimi</strong>
            <small>şimdi</small>
          </Toast.Header>
          <Toast.Body className="text-white fw-bold">
            {toastData.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default AdminProducts;
