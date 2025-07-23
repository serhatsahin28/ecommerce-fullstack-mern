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

  // Filtreleme ve arama işlemi (Mevcut haliyle kalıyor)
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

  // Edit/Delete Modal açma/kapatma fonksiyonları (Mevcut haliyle kalıyor)
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

  // --- YENİ FONKSİYONLAR EKLENDİ ---

  // Dizi içindeki bir input'un değerini güncellemek için
  const handleArrayInputChange = (arrayName, lang, index, value) => {
    setEditProduct(prev => {
      const newTranslations = { ...prev.translations };
      // Dizi kopyası oluşturulur
      const newArray = [...newTranslations[lang][arrayName]];
      newArray[index] = value;
      newTranslations[lang][arrayName] = newArray;
      return { ...prev, translations: newTranslations };
    });
  };

  // Diziye yeni bir eleman eklemek için
  const addArrayItem = (arrayName, lang) => {
    setEditProduct(prev => {
      const newTranslations = { ...prev.translations };
      // Eğer dizi yoksa boş dizi oluştur, varsa sonuna boş eleman ekle
      const newArray = [...(newTranslations[lang][arrayName] || []), ''];
      newTranslations[lang][arrayName] = newArray;
      return { ...prev, translations: newTranslations };
    });
  };

  // Diziden bir elemanı silmek için
  const removeArrayItem = (arrayName, lang, index) => {
    setEditProduct(prev => {
      const newTranslations = { ...prev.translations };
      const newArray = newTranslations[lang][arrayName].filter((_, i) => i !== index);
      newTranslations[lang][arrayName] = newArray;
      return { ...prev, translations: newTranslations };
    });
  };

  // --- MEVCUT FONKSİYONLAR ---
  
  // Basit form inputlarını yöneten fonksiyon (Mevcut haliyle kalıyor, description için de çalışacak)
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

  // Güncelleme ve Silme işlemleri (Mevcut haliyle kalıyor)
  const handleUpdate = async () => {
    if (!editProduct) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      await axios.put(`http://localhost:5000/admin/updateProduct/${editProduct._id}`, editProduct);
      setProducts(prev => prev.map(p => p._id === editProduct._id ? editProduct : p));
      console.log("editProduct",editProduct);
      handleEditClose();
    } catch (err) {
      setUpdateError('Ürün güncellenirken bir hata oluştu.');
      console.error("Update Error:", err);
    } finally {
      setUpdating(false);
    }
  };    
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/admin/products/${productToDelete._id}`);
      setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
      handleDeleteClose();
    } catch (err) {
      console.error("Delete Error:", err);
      alert('Ürün silinirken bir hata oluştu.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      {/* Sayfanın üst kısmı (Filtreler ve Tablo Başlığı) aynı kalıyor */}
      <h3 className="mb-4">Ürün Yönetimi</h3>
      <Form className="d-flex mb-3 gap-2 flex-wrap">
        <Form.Control type="text" placeholder="Ürün adı ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ maxWidth: '300px' }}/>
        <Form.Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ maxWidth: '200px' }}>
          <option value="">Tüm Kategoriler</option>
          {categories.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
        </Form.Select>
        <Button variant="primary" className="ms-auto" onClick={() => alert('Yeni ürün ekleme formu açılacak.')}>+ Yeni Ürün Ekle</Button>
      </Form>
      <Table bordered hover responsive>
        {/* Tablo içeriği (thead, tbody) aynı kalıyor */}
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

      {/* --- DÜZENLEME MODALI GÜNCELLENDİ --- */}
      <Modal show={showEditModal} onHide={handleEditClose} backdrop="static" size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Ürün Güncelle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editProduct && (
            <Form>
              {/* Genel Alanlar */}
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

              {/* Türkçe İçerikler */}
              <h4>Türkçe İçerik</h4>
              <Form.Group className="mb-3">
                <Form.Label>Ürün Adı (TR)</Form.Label>
                <Form.Control type="text" value={editProduct.translations.tr.name} onChange={e => handleInputChange('name', e.target.value, 'tr')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Açıklama (TR)</Form.Label>
                <Form.Control as="textarea" rows={3} value={editProduct.translations.tr.description} onChange={e => handleInputChange('description', e.target.value, 'tr')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Özellikler (TR)</Form.Label>
                {editProduct.translations.tr.features?.map((feature, index) => (
                  <InputGroup className="mb-2" key={index}>
                    <Form.Control value={feature} onChange={(e) => handleArrayInputChange('features', 'tr', index, e.target.value)} />
                    <Button variant="outline-danger" onClick={() => removeArrayItem('features', 'tr', index)}>Sil</Button>
                  </InputGroup>
                ))}
                <Button variant="outline-success" size="sm" onClick={() => addArrayItem('features', 'tr')}>+ Özellik Ekle</Button>
              </Form.Group>

              <hr />

              {/* İngilizce İçerikler */}
              <h4>English Content</h4>
              <Form.Group className="mb-3">
                <Form.Label>Product Name (EN)</Form.Label>
                <Form.Control type="text" value={editProduct.translations.en.name} onChange={e => handleInputChange('name', e.target.value, 'en')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description (EN)</Form.Label>
                <Form.Control as="textarea" rows={3} value={editProduct.translations.en.description} onChange={e => handleInputChange('description', e.target.value, 'en')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Features (EN)</Form.Label>
                {editProduct.translations.en.features?.map((feature, index) => (
                  <InputGroup className="mb-2" key={index}>
                    <Form.Control value={feature} onChange={(e) => handleArrayInputChange('features', 'en', index, e.target.value)} />
                    <Button variant="outline-danger" onClick={() => removeArrayItem('features', 'en', index)}>Sil</Button>
                  </InputGroup>
                ))}
                <Button variant="outline-success" size="sm" onClick={() => addArrayItem('features', 'en')}>+ Add Feature</Button>
              </Form.Group>

              {updateError && <Alert variant="danger">{updateError}</Alert>}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditClose} disabled={updating}>Kapat</Button>
          <Button variant="primary" onClick={handleUpdate} disabled={updating}>
            {updating ? <><Spinner as="span" animation="border" size="sm" /> Güncelleniyor...</> : 'Değişiklikleri Kaydet'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modalı (Aynı kalıyor) */}
      <Modal show={showDeleteModal} onHide={handleDeleteClose} centered>
        <Modal.Header closeButton><Modal.Title>Silme Onayı</Modal.Title></Modal.Header>
        <Modal.Body>
          <strong>{productToDelete?.translations.tr.name}</strong> adlı ürünü kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteClose} disabled={deleting}>İptal</Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? <><Spinner as="span" animation="border" size="sm" /> Siliniyor...</> : 'Sil'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminProducts;