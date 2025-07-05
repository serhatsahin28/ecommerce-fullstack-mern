// src/pages/adminHome.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminHomePage = () => {
  const [homeSections, setHomeSections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Verileri backend'den çek
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/admin/homeList');
      
      // Kategorilere göre gruplandırma
      const groupedSections = response.data.homeData.reduce((acc, section) => {
        acc[section.category_key] = section.products;
        return acc;
      }, {});
      
      setHomeSections(groupedSections);
      setAllProducts(response.data.productData);
      setError('');
    } catch (err) {
      setError('Veri yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ürün ekleme fonksiyonu
  const addProductToSection = (product) => {
    if (homeSections[selectedCategory]?.length >= 4) {
      setError('Bir kategoriye en fazla 4 ürün ekleyebilirsiniz!');
      return;
    }

    const updatedSections = {
      ...homeSections,
      [selectedCategory]: [...(homeSections[selectedCategory] || []), product]
    };

    setHomeSections(updatedSections);
    setSelectedCategory(null);
  };

  // Verileri güncelleme fonksiyonu
  const updateHomeList = async () => {
    try {
      setLoading(true);
      
      // Verileri backend'e uygun formata çevirme
      const formattedData = Object.entries(homeSections).map(([category_key, products]) => ({
        category_key,
        products: products.map(p => p._id) // Sadece ID'leri gönderiyoruz
      }));

      await axios.put('http://localhost:5000/admin/updateHomeList', formattedData);
      
      setSuccessMessage('Veriler başarıyla güncellendi!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Güncelleme sırasında hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ürünü bölümden kaldırma
  const removeProductFromSection = (category, productId) => {
    const updatedSections = {
      ...homeSections,
      [category]: homeSections[category].filter(p => p._id !== productId)
    };
    
    setHomeSections(updatedSections);
  };

  // Kategoriye göre filtreleme
  const filteredProducts = selectedCategory 
    ? allProducts.filter(p => p.category_key === selectedCategory)
    : [];

  // Kategori isimleri
  const categoryNames = {
    electronics: "Elektronik",
    home_office: "Ev Ofis",
    fashion: "Moda",
    // Diğer kategoriler...
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Ana Sayfa Ürün Yönetimi</h1>
        <button 
          className="btn btn-primary"
          onClick={updateHomeList}
          disabled={loading}
        >
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show">
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {loading && (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Kategori Bölümleri */}
          {Object.entries(homeSections).map(([category, items]) => (
            <div key={category} className="card mb-4">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0">{categoryNames[category] || category}</h2>
                <span className="badge bg-primary">
                  {items?.length || 0}/4 Ürün
                </span>
              </div>
              
              <div className="card-body">
                {items?.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">Bu kategoriye henüz ürün eklenmedi</p>
                  </div>
                ) : (
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                    {items.map(product => (
                      <div key={product._id} className="col">
                        <ProductCard 
                          product={product} 
                          onRemove={() => removeProductFromSection(category, product._id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 d-flex justify-content-center">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setSelectedCategory(category)}
                    disabled={items?.length >= 4}
                  >
                    Ürün Ekle
                  </button>
                </div>
                
                {items?.length >= 4 && (
                  <div className="alert alert-warning mt-3 mb-0">
                    Bu kategori için maksimum ürün sayısına ulaşıldı!
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Ürün Seçim Modalı */}
      {selectedCategory && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title h5">
                  {categoryNames[selectedCategory] || selectedCategory} Ürünleri
                </h2>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedCategory(null)}
                ></button>
              </div>
              
              <div className="modal-body">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">Bu kategoriye ait ürün bulunamadı</p>
                  </div>
                ) : (
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                    {filteredProducts.map(product => (
                      <div key={product._id} className="col">
                        <ProductCard 
                          product={product} 
                          onClick={() => addProductToSection(product)}
                          selectable
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedCategory(null)}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ürün Kartı Bileşeni
const ProductCard = ({ product, onClick, onRemove, selectable }) => {
  const translation = product.translations.tr || product.translations.en;
  
  return (
    <div 
      className={`card h-100 ${selectable ? 'cursor-pointer' : ''}`}
      onClick={selectable ? onClick : undefined}
    >
      <div className="position-relative">
        <img 
          src={product.image || '/default-product.jpg'} 
          className="card-img-top p-3 object-fit-contain"
          alt={translation.name}
          style={{ height: '180px' }}
          onError={(e) => e.target.src = '/default-product.jpg'}
        />
        {onRemove && (
          <button 
            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <i className="bi bi-trash"></i>
          </button>
        )}
      </div>
      
      <div className="card-body">
        <h3 className="card-title h6 text-truncate">{translation.name}</h3>
        <p className="card-text fw-bold">{product.price.toFixed(2)} TL</p>
        {selectable && (
          <button className="btn btn-primary w-100">
            <i className="bi bi-plus me-1"></i> Ekle
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminHomePage;