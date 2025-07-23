
// Products.jsx - Ana component
import React, { useEffect, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import ProductsHeader from '../../components/admin/ProductsHeader';
import ProductsTable from '../../components/admin/ProductsTable';
import EditProductModal from '../../components/admin/EditProductModal';
import DeleteProductModal from '../../components/admin/DeleteProductModal'; 
import NotificationAlert from '../../components/admin/notificationAlert';
import AddProductModal from '../../components/admin/AddProductModal';

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

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

 const handleUpdate = async (updatedProduct) => {
  try {
    setUpdating(true);

    const formData = new FormData();

    // Diğer ürün bilgilerini FormData'ya ekle
    for (const key in updatedProduct) {
      if (key !== 'imageFile' && key !== 'newImageFiles') {
        if (key === 'translations') {
          formData.append(key, JSON.stringify(updatedProduct[key]));
        } else {
          formData.append(key, updatedProduct[key]);
        }
      }
    }

    // Ana resim dosyası varsa ekle
    if (updatedProduct.imageFile) {
      formData.append('image', updatedProduct.imageFile);
    }

    // Yeni çoklu resimler varsa ekle
    if (updatedProduct.newImageFiles && updatedProduct.newImageFiles.length > 0) {
      updatedProduct.newImageFiles.forEach(file => {
        formData.append('image', file); // 'image' field name kullanıyoruz çünkü backend upload.array('image') bekliyor
      });
    }

    // Tek bir API çağrısı (PUT)
    await axios.put(
      `http://localhost:5000/admin/updateProduct/${updatedProduct._id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // UI güncelleme
    setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
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


  const handleConfirmDelete = async () => {
    alert('Silme işlemi şimdilik devre dışı.');
    handleDeleteClose();
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
    </div>
  );
};

export default AdminProducts;