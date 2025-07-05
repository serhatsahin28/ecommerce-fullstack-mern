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
//     // Deep copy ve eksik propertyleri boş dizi olarak ayarla
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

//   // Input değişiklikleri
//   const handleInputChange = (field, value, lang = null, index = null) => {
//     if (!editProduct) return;

//     if (lang && index !== null) {
//       // Özellik değişikliği (array index)
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
//       // Dil bazında isim, açıklama değişikliği
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
//       // Fotoğraf dosyası seçildiğinde preview için URL oluştur
//       if (value && value[0]) {
//         const file = value[0];
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setEditProduct(prev => ({ ...prev, image: reader.result, imageFile: file }));
//         };
//         reader.readAsDataURL(file);
//       }
//     } else {
//       // Diğer alanlar (price, rating, category_key)
//       const numericFields = ['price', 'rating'];
//       const finalValue = numericFields.includes(field) && value !== '' ? parseFloat(value) : value;
//       setEditProduct(prev => ({ ...prev, [field]: finalValue }));
//     }
//   };

//   // Yeni özellik ekleme (Türkçe/İngilizce birlikte)
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

//   // Özellik silme (Türkçe/İngilizce birlikte)
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

//   // Güncelleme kontrolü ve gönderim
//   const handleUpdate = async () => {
//     if (!editProduct) return;

//     setUpdateError(null);

//     const original = products.find(p => p._id === editProduct._id);
//     if (!original) {
//       setUpdateError('Orijinal ürün bulunamadı.');
//       return;
//     }

//     // Türkçe ve İngilizce içerik alanlarını karşılaştır
//     const tr = editProduct.translations.tr;
//     const en = editProduct.translations.en;

//     // Değişiklik var mı kontrolü için yardımcı fonksiyonlar
//     const isStringArrayEqual = (arr1, arr2) => {
//       if (!arr1 && !arr2) return true;
//       if (!arr1 || !arr2) return false;
//       if (arr1.length !== arr2.length) return false;
//       for (let i = 0; i < arr1.length; i++) {
//         if ((arr1[i] || '').trim() !== (arr2[i] || '').trim()) return false;
//       }
//       return true;
//     };

//     // Türkçe içerikteki alanlarda değişiklik oldu mu?
//     const trNameChanged = tr.name.trim() !== (original.translations.tr.name || '').trim();
//     const trDescChanged = tr.description.trim() !== (original.translations.tr.description || '').trim();
//     const trFeaturesChanged = !isStringArrayEqual(tr.features, original.translations.tr.features);

//     const anyTrChanged = trNameChanged || trDescChanged || trFeaturesChanged;

//     // Eğer Türkçe içerikte değişiklik varsa İngilizce içerikte karşılık gelen alanlar dolu ve eşit olmalı
//     // Yoksa güncelleme iptal edilir
//     if (anyTrChanged) {
//       // Kontrol: İngilizce içerik boş olamaz
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
//       // Ayrıca içerikler eşit olmalı
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

//     // Fotoğraf dosyası varsa, servera form-data ile gönderilmeli
//     try {
//       setUpdating(true);

//       if (editProduct.imageFile) {
//         // Dosya yüklemesi varsa önce dosyayı upload et
//         const formData = new FormData();
//         formData.append('image', editProduct.imageFile);
//         const uploadRes = await axios.post('http://localhost:5000/admin/uploadImage', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' }
//         });
//         // Upload sonrası dönen image URL'si ile güncelle
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
//         <Form.Control type="text" placeholder="Ürün adı ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ maxWidth: '300px' }} />
//         <Form.Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ maxWidth: '200px' }}>
//           <option value="">Tüm Kategoriler</option>
//           {categories.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
//         </Form.Select>
//         <Button variant="primary" className="ms-auto" onClick={() => alert('Yeni ürün ekleme formu açılacak.')}>+ Yeni Ürün Ekle</Button>
//       </Form>
//       <Table bordered hover responsive>
//         <thead className="table-dark">
//           <tr>
//             <th>Resim</th><th>Ürün Adı (TR)</th><th>Ürün Adı (EN)</th><th>Kategori</th><th>Fiyat ($)</th><th>Puan</th><th>İşlemler</th>
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

//       <Modal show={showEditModal} onHide={handleEditClose} backdrop="static" size="lg" centered scrollable>
//         <Modal.Header closeButton>
//           <Modal.Title>Ürün Güncelle</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {editProduct && (
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Label>Resim</Form.Label>
//                 <div className="mb-2">
//                   <Image src={editProduct.image} thumbnail alt="Ürün Resmi" style={{ maxHeight: '150px' }} />
//                 </div>
//                 <Form.Control
//                   type="file"
//                   accept="image/*"
//                   onChange={e => handleInputChange('image', e.target.files)}
//                 />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Kategori</Form.Label>
//                 <Form.Select value={editProduct.category_key} onChange={e => handleInputChange('category_key', e.target.value)}>
//                   {categories.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
//                 </Form.Select>
//               </Form.Group>

//               <hr />
//               <h5>Türkçe İçerik</h5>
//               <Form.Group className="mb-3">
//                 <Form.Label>Ürün Adı (TR)</Form.Label>
//                 <Form.Control type="text" value={editProduct.translations.tr.name} onChange={e => handleInputChange('name', e.target.value, 'tr')} />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Açıklama (TR)</Form.Label>
//                 <Form.Control as="textarea" rows={3} value={editProduct.translations.tr.description} onChange={e => handleInputChange('description', e.target.value, 'tr')} />
//               </Form.Group>

//               <h6>Özellikler (TR)</h6>
//               {editProduct.translations.tr.features.map((feature, idx) => (
//                 <InputGroup className="mb-2" key={`tr-feature-${idx}`}>
//                   <Form.Control
//                     type="text"
//                     value={feature}
//                     onChange={e => handleInputChange('features', e.target.value, 'tr', idx)}
//                     placeholder={`${idx + 1}. özellik`}
//                   />
//                   <Button variant="outline-danger" onClick={() => handleRemoveFeature(idx)}>-</Button>
//                 </InputGroup>
//               ))}
//               <Button variant="outline-primary" size="sm" onClick={handleAddFeature}>+ Özellik Ekle</Button>

//               <hr />
//               <h5>English Content</h5>
//               <Form.Group className="mb-3">
//                 <Form.Label>Product Name (EN)</Form.Label>
//                 <Form.Control type="text" value={editProduct.translations.en.name} onChange={e => handleInputChange('name', e.target.value, 'en')} />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Description (EN)</Form.Label>
//                 <Form.Control as="textarea" rows={3} value={editProduct.translations.en.description} onChange={e => handleInputChange('description', e.target.value, 'en')} />
//               </Form.Group>

//               <h6>Features (EN)</h6>
//               {editProduct.translations.en.features.map((feature, idx) => (
//                 <InputGroup className="mb-2" key={`en-feature-${idx}`}>
//                   <Form.Control
//                     type="text"
//                     value={feature}
//                     onChange={e => handleInputChange('features', e.target.value, 'en', idx)}
//                     placeholder={`${idx + 1}. feature`}
//                   />
//                   <Button variant="outline-danger" onClick={() => handleRemoveFeature(idx)}>-</Button>
//                 </InputGroup>
//               ))}
//               <Button variant="outline-primary" size="sm" onClick={handleAddFeature}>+ Add Feature</Button>
//             </Form>
//           )}
//           {updateError && <Alert variant="danger" className="mt-2">{updateError}</Alert>}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleEditClose} disabled={updating}>İptal</Button>
//           <Button variant="primary" onClick={handleUpdate} disabled={updating}>
//             {updating ? <Spinner animation="border" size="sm" /> : 'Güncelle'}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <Modal show={showDeleteModal} onHide={handleDeleteClose} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Ürün Sil</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {productToDelete && (
//             <p><strong>{productToDelete.translations.tr.name}</strong> isimli ürünü silmek istediğinize emin misiniz?</p>
//           )}
//           <Alert variant="warning">
//             Not: Silme işlemi şimdilik devre dışı bırakılmıştır.
//           </Alert>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleDeleteClose} disabled={deleting}>İptal</Button>
//           <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>Sil</Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default AdminProducts;

import React, { useState, useEffect } from "react";
import axios from "axios";

const Product = ({ productId }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Ürün bilgilerini getirme
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/admin/products/${productId}`);
        setProduct(res.data);
        if (res.data.image) {
          setPreview(res.data.image);
        }
      } catch (err) {
        console.error("Ürün getirme hatası:", err);
      }
    };

    fetchProduct();
  }, [productId]);

  // Input değişikliklerini yönet
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // Görsel seçildiğinde tetiklenir
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(product));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await axios.put(`/admin/products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("✔️ Ürün başarıyla güncellendi.");
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      setMessage("❌ Güncelleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Ürün Güncelle</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label>
          Ürün Adı:
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Açıklama:
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Fiyat:
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Stok:
          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Yeni Görsel Yükle:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        {preview && (
          <img
            src={typeof preview === "string" && !preview.startsWith("blob:") ? `http://localhost:5000/${preview}` : preview}
            alt="Ürün Görseli"
            style={{ width: 200, marginTop: 10 }}
          />
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Güncelleniyor..." : "Güncelle"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default Product;
