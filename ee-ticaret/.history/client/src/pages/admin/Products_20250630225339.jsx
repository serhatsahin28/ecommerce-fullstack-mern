// Products.jsx - Ana component
import React, { useEffect, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import ProductsHeader from '../../components/admin/ProductsHeader';
import ProductsTable from '../../components/admin/ProductsTable';
import EditProductModal from '../../components/admin/EditProductModal';
import AddProductModal from '../../components/admin/AddProductModal';
import DeleteProductModal from '../../components/admin/DeleteProductModal'; 
import NotificationAlert from '../../components/admin/notificationAlert';

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleAddProductClick = () => {
    setShowAddModal(true);
    setCreateError(null);
  };

  const handleEditClick = (product) => {
    const deepCopy = JSON.parse(JSON.stringify(product));
    if (!deepCopy.translations.tr.features) deepCopy.translations.tr.features = [];
    if (!deepCopy.translations.en.features) deepCopy.translations.en.features = [];
    setEditProduct(deepCopy);
    setUpdateError(null);
    setShowEditModal(true);
  };

  const handleCreate = async (formData) => {
    try {
      setCreating(true);
      
      const { data } = await axios.post(
        'http://localhost:5000/admin/createProduct',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setProducts(prev => [...prev, data]);
      setShowAddModal(false);
      
      setNotification('Ürün başarıyla oluşturuldu!');
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setCreateError('Ürün oluşturulurken bir hata oluştu.');
      console.error("Create Error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (updatedProduct) => {
    // ... existing update logic ...
  };

  // ... other functions ...

  return (
    <div>
      <NotificationAlert notification={notification} />

      <ProductsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        onAddProductClick={handleAddProductClick}
      />

      <ProductsTable
        products={filteredProducts}
        categories={categories}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <AddProductModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        creating={creating}
        createError={createError}
        onCreate={handleCreate}
        onNotification={showNotification}
        categories={categories}
        brands={brands}
        onAddCategory={() => alert('Yeni kategori ekleme formu açılacak')}
        onAddBrand={() => alert('Yeni marka ekleme formu açılacak')}
      />

      <EditProductModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        editProduct={editProduct}
        setEditProduct={setEditProduct}
        updating={updating}
        updateError={updateError}
        onUpdate={handleUpdate}
        onNotification={showNotification}
        products={products}
      />

      {/* ... other modals ... */}
    </div>
  );
};

export default AdminProducts;