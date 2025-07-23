// import React, { useEffect, useState } from 'react';
// import { Table, Button, Form, Spinner, Alert, Image, Modal, InputGroup } from 'react-bootstrap';
// import axios from 'axios';

// const categories = [
//   { key: 'electronics', label: 'Electronics' },
//   { key: 'fashion', label: 'Fashion' },
//   { key: 'books', label: 'Books' },
//   { key: 'home_office', label: 'Home & Office' }
// ];

// const AdminProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('');

//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editProduct, setEditProduct] = useState(null);
//   const [updating, setUpdating] = useState(false);
//   const [updateError, setUpdateError] = useState(null);

//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [productToDelete, setProductToDelete] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   const [notification, setNotification] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const { data } = await axios.get('http://localhost:5000/admin/productsList');
//         setProducts(data);
//         setFilteredProducts(data);
//       } catch (err) {
//         setError('Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
//         console.error("Fetch Error:", err);
//       }
//       setLoading(false);
//     };
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     let filtered = products;
//     if (categoryFilter) {
//       filtered = filtered.filter(p => p.category_key === categoryFilter);
//     }
//     if (searchTerm.trim()) {
//       const lower = searchTerm.toLowerCase();
//       filtered = filtered.filter(p =>
//         (p.translations?.en?.name && p.translations.en.name.toLowerCase().includes(lower)) ||
//         (p.translations?.tr?.name && p.translations.tr.name.toLowerCase().includes(lower))
//       );
//     }
//     setFilteredProducts(filtered);
//   }, [categoryFilter, searchTerm, products]);

//   const handleEditClick = (product) => {
//     const deepCopy = JSON.parse(JSON.stringify(product));
//     if (!deepCopy.translations.tr.features) deepCopy.translations.tr.features = [];
//     if (!deepCopy.translations.en.features) deepCopy.translations.en.features = [];
//     setEditProduct(deepCopy);
//     setUpdateError(null);
//     setShowEditModal(true);
//   };
//   const handleEditClose = () => {
//     setShowEditModal(false);
//     setEditProduct(null);
//     setUpdateError(null);
//   };
//   const handleDeleteClick = (product) => {
//     setProductToDelete(product);
//     setShowDeleteModal(true);
//   };
//   const handleDeleteClose = () => {
//     setShowDeleteModal(false);
//     setProductToDelete(null);
//   };

//   const handleInputChange = (field, value, lang = null, index = null) => {
//     if (!editProduct) return;

//     if (lang && index !== null) {
//       const featuresCopy = [...editProduct.translations[lang].features];
//       featuresCopy[index] = value;
//       setEditProduct(prev => ({
//         ...prev,
//         translations: {
//           ...prev.translations,
//           [lang]: {
//             ...prev.translations[lang],
//             features: featuresCopy
//           }
//         }
//       }));
//     } else if (lang) {
//       setEditProduct(prev => ({
//         ...prev,
//         translations: {
//           ...prev.translations,
//           [lang]: {
//             ...prev.translations[lang],
//             [field]: value
//           }
//         }
//       }));
//     } else if (field === 'image') {
//       if (value && value[0]) {
//         const file = value[0];
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setEditProduct(prev => ({ ...prev, image: reader.result, imageFile: file }));
//         };
//         reader.readAsDataURL(file);
//       }
//     } else {
//       const numericFields = ['price', 'rating'];
//       const finalValue = numericFields.includes(field) && value !== '' ? parseFloat(value) : value;
//       setEditProduct(prev => ({ ...prev, [field]: finalValue }));
//     }
//   };

//   const handleAddFeature = () => {
//     setEditProduct(prev => ({
//       ...prev,
//       translations: {
//         ...prev.translations,
//         tr: { ...prev.translations.tr, features: [...prev.translations.tr.features, ''] },
//         en: { ...prev.translations.en, features: [...prev.translations.en.features, ''] }
//       }
//     }));
//   };

//   const handleRemoveFeature = (index) => {
//     setEditProduct(prev => {
//       const trFeatures = [...prev.translations.tr.features];
//       const enFeatures = [...prev.translations.en.features];
//       trFeatures.splice(index, 1);
//       enFeatures.splice(index, 1);
//       return {
//         ...prev,
//         translations: {
//           ...prev.translations,
//           tr: { ...prev.translations.tr, features: trFeatures },
//           en: { ...prev.translations.en, features: enFeatures }
//         }
//       };
//     });
//   };

//   const handleUpdate = async () => {
//     if (!editProduct) return;

//     setUpdateError(null);

//     const original = products.find(p => p._id === editProduct._id);
//     if (!original) {
//       setUpdateError('Orijinal ürün bulunamadı.');
//       return;
//     }

//     const tr = editProduct.translations.tr;
//     const en = editProduct.translations.en;

//     const isStringArrayEqual = (arr1, arr2) => {
//       if (!arr1 && !arr2) return true;
//       if (!arr1 || !arr2) return false;
//       if (arr1.length !== arr2.length) return false;
//       for (let i = 0; i < arr1.length; i++) {
//         if ((arr1[i] || '').trim() !== (arr2[i] || '').trim()) return false;
//       }
//       return true;
//     };

//     const trNameChanged = tr.name.trim() !== (original.translations.tr.name || '').trim();
//     const trDescChanged = tr.description.trim() !== (original.translations.tr.description || '').trim();
//     const trFeaturesChanged = !isStringArrayEqual(tr.features, original.translations.tr.features);

//     const anyTrChanged = trNameChanged || trDescChanged || trFeaturesChanged;

//     if (anyTrChanged) {
//       if (!en.name || en.name.trim() === '') {
//         setNotification('İngilizce içerik boş bırakılamaz! Lütfen İngilizce ürün adını doldurun.');
//         setTimeout(() => setNotification(null), 4000);
//         return;
//       }
//       if (!en.description || en.description.trim() === '') {
//         setNotification('İngilizce açıklama boş bırakılamaz! Lütfen İngilizce açıklamayı doldurun.');
//         setTimeout(() => setNotification(null), 4000);
//         return;
//       }
//       if (!en.features || en.features.length !== tr.features.length) {
//         setNotification('İngilizce özellikler Türkçe özelliklerle aynı sayıda olmalıdır.');
//         setTimeout(() => setNotification(null), 4000);
//         return;
//       }
//       for (let i = 0; i < tr.features.length; i++) {
//         if (!en.features[i] || en.features[i].trim() === '') {
//           setNotification(`İngilizce özellikler boş bırakılamaz! Lütfen ${i + 1}. özelliği doldurun.`);
//           setTimeout(() => setNotification(null), 4000);
//           return;
//         }
//       }
//       if (
//         en.name.trim() === (original.translations.en.name || '').trim() &&
//         en.description.trim() === (original.translations.en.description || '').trim() &&
//         isStringArrayEqual(en.features, original.translations.en.features)
//       ) {
//         setNotification('Türkçe içerikte değişiklik var, ancak İngilizce içerik güncellenmemiş. Lütfen İngilizce içerikte de değişiklik yapın.');
//         setTimeout(() => setNotification(null), 4000);
//         return;
//       }
//     }

//     try {
//       setUpdating(true);

//       if (editProduct.imageFile) {
//         const formData = new FormData();
//         formData.append('image', editProduct.imageFile);
//         const uploadRes = await axios.post('http://localhost:5000/admin/uploadImage', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' }
//         });
//         editProduct.image = uploadRes.data.imageUrl;
//         delete editProduct.imageFile;
//       }

//       await axios.put(`http://localhost:5000/admin/updateProduct/${editProduct._id}`, editProduct);
//       setProducts(prev => prev.map(p => p._id === editProduct._id ? editProduct : p));
//       handleEditClose();

//       setNotification('Ürün başarıyla güncellendi!');
//       setTimeout(() => setNotification(null), 4000);
//     } catch (err) {
//       setUpdateError('Ürün güncellenirken bir hata oluştu.');
//       console.error("Update Error:", err);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleConfirmDelete = async () => {
//     alert('Silme işlemi şimdilik devre dışı.');
//     handleDeleteClose();
//   };

//   if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
//   if (error) return <Alert variant="danger">{error}</Alert>;

//   return (
//     <div>
//       {notification && (
//         <Alert variant="warning" style={{ position: 'fixed', top: 20, right: 20, zIndex: 1050 }}>
//           {notification}
//         </Alert>
//       )}

//       <h3 className="mb-4">Ürün Yönetimi</h3>
//       <Form className="d-flex mb-3 gap-2 flex-wrap">
//         <Form.Control
//           type="text"
//           placeholder="Ürün adı ara..."
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//           style={{ maxWidth: '300px' }}
//         />
//         <Form.Select
//           value={categoryFilter}
//           onChange={e => setCategoryFilter(e.target.value)}
//           style={{ maxWidth: '200px' }}
//         >
//           <option value="">Tüm Kategoriler</option>
//           {categories.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
//         </Form.Select>
//         <Button variant="primary" className="ms-auto" onClick={() => alert('Yeni ürün ekleme formu açılacak.')}>+ Yeni Ürün Ekle</Button>
//       </Form>
//       <Table bordered hover responsive>
//         <thead className="table-dark">
//           <tr>
//             <th>Resim</th>
//             <th>Ürün Adı (TR)</th>
//             <th>Ürün Adı (EN)</th>
//             <th>Kategori</th>
//             <th>Fiyat ($)</th>
//             <th>Puan</th>
//             <th>İşlemler</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredProducts.length === 0 ? (
//             <tr><td colSpan="7" className="text-center">Arama kriterlerine uygun ürün bulunamadı.</td></tr>
//           ) : (
//             filteredProducts.map(product => (
//               <tr key={product._id}>
//                 <td style={{ width: '100px' }}>
//                   <Image src={product.image} thumbnail alt={product.translations.en.name} />
//                 </td>
//                 <td>{product.translations.tr.name}</td>
//                 <td>{product.translations.en.name}</td>
//                 <td>{categories.find(c => c.key === product.category_key)?.label || product.category_key}</td>
//                 <td>{product.price.toFixed(2)}</td>
//                 <td>{product.rating.toFixed(1)}</td>
//                 <td>
//                   <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditClick(product)}>Düzenle</Button>
//                   <Button size="sm" variant="danger" onClick={() => handleDeleteClick(product)}>Sil</Button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </Table>

//       {/* Edit Modal */}
//       <Modal show={showEditModal} onHide={handleEditClose} size="lg" backdrop="static" keyboard={false}>
//         <Modal.Header closeButton>
//           <Modal.Title>Ürün Düzenle</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {updateError && <Alert variant="danger">{updateError}</Alert>}
//           {editProduct && (
//             <Form>
//               <Form.Group className="mb-3" controlId="editProductImage">
//                 <Form.Label>Ürün Resmi</Form.Label>
//                 <div className="mb-2">
//                   <Image src={editProduct.image} thumbnail style={{ maxHeight: '150px' }} />
//                 </div>
//                 <Form.Control
//                   type="file"
//                   accept="image/*"
//                   onChange={e => handleInputChange('image', e.target.files)}
//                 />
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="editProductPrice">
//                 <Form.Label>Fiyat ($)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={editProduct.price}
//                   onChange={e => handleInputChange('price', e.target.value)}
//                 />
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="editProductRating">
//                 <Form.Label>Puan (0-5)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   min="0"
//                   max="5"
//                   step="0.1"
//                   value={editProduct.rating}
//                   onChange={e => handleInputChange('rating', e.target.value)}
//                 />
//               </Form.Group>

//               {/* Türkçe içerik */}
//               <h5>Türkçe İçerik</h5>
//               <Form.Group className="mb-3" controlId="editProductTRName">
//                 <Form.Label>Ürün Adı</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={editProduct.translations.tr.name}
//                   onChange={e => handleInputChange('name', e.target.value, 'tr')}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3" controlId="editProductTRDescription">
//                 <Form.Label>Açıklama</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   value={editProduct.translations.tr.description}
//                   onChange={e => handleInputChange('description', e.target.value, 'tr')}
//                 />
//               </Form.Group>

//               {/* Özellikler */}
//               <h6>Özellikler</h6>
//               {editProduct.translations.tr.features.map((feat, idx) => (
//                 <InputGroup className="mb-2" key={`tr-feature-${idx}`}>
//                   <Form.Control
//                     placeholder={`Özellik ${idx + 1}`}
//                     value={feat}
//                     onChange={e => handleInputChange(null, e.target.value, 'tr', idx)}
//                   />
//                   <Button variant="outline-danger" onClick={() => handleRemoveFeature(idx)}>Sil</Button>
//                 </InputGroup>
//               ))}
//               <Button variant="outline-primary" size="sm" onClick={handleAddFeature}>+ Özellik Ekle</Button>

//               {/* İngilizce içerik */}
//               <h5 className="mt-4">English Content</h5>
//               <Form.Group className="mb-3" controlId="editProductENName">
//                 <Form.Label>Product Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={editProduct.translations.en.name}
//                   onChange={e => handleInputChange('name', e.target.value, 'en')}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3" controlId="editProductENDescription">
//                 <Form.Label>Description</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   value={editProduct.translations.en.description}
//                   onChange={e => handleInputChange('description', e.target.value, 'en')}
//                 />
//               </Form.Group>

//               <h6>Features</h6>
//               {editProduct.translations.en.features.map((feat, idx) => (
//                 <InputGroup className="mb-2" key={`en-feature-${idx}`}>
//                   <Form.Control
//                     placeholder={`Feature ${idx + 1}`}
//                     value={feat}
//                     onChange={e => handleInputChange(null, e.target.value, 'en', idx)}
//                   />
//                 </InputGroup>
//               ))}
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleEditClose} disabled={updating}>İptal</Button>
//           <Button variant="success" onClick={handleUpdate} disabled={updating}>
//             {updating ? <Spinner animation="border" size="sm" /> : 'Güncelle'}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Delete Modal */}
//       <Modal show={showDeleteModal} onHide={handleDeleteClose} backdrop="static" keyboard={false}>
//         <Modal.Header closeButton>
//           <Modal.Title>Ürünü Sil</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {productToDelete && (
//             <p>
//               "{productToDelete.translations.tr.name}" ürününü silmek istediğinizden emin misiniz?
//             </p>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleDeleteClose} disabled={deleting}>İptal</Button>
//           <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
//             {deleting ? <Spinner animation="border" size="sm" /> : 'Sil'}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default AdminProducts;

// Products.jsx - Ana component
import React, { useEffect, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import ProductsHeader from '../../components/admin/ProductsHeader';
import ProductsTable from '../../components/admin/ProductsTable';
import EditProductModal from '../../components/admin/EditProductModal';
import DeleteProductModal from '../../components/admin/DeleteProductModal';
import NotificationAlert from '../../components/admin/NotificationAlert';


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

      if (updatedProduct.imageFile) {
        const formData = new FormData();
        formData.append('image', updatedProduct.imageFile);
        const uploadRes = await axios.post('http://localhost:5000/admin/uploadImage', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updatedProduct.image = uploadRes.data.imageUrl;
        delete updatedProduct.imageFile;
      }

      await axios.put(`http://localhost:5000/admin/updateProduct/${updatedProduct._id}`, updatedProduct);
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