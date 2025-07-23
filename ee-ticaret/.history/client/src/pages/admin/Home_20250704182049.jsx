// src/pages/admin/Home.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import { FaStar, FaTrash, FaEdit } from 'react-icons/fa';

// Admin Home Page editable version
const AdminHome = () => {
  // Başlangıç veri yapısı (genellikle API'den gelir)
  const initialData = {
    page_language: 'tr',
    page_title: 'Öne Çıkan Koleksiyonumuzu Keşfedin',
    page_subtitle: 'Kaliteli ürünlerden oluşan seçkimize göz atın. En yeni trendleri ve zamansız klasiklerini sizler için bir araya getirdik.',
    view_all: 'Tümünü Gör',
    featured_products: 'Öne Çıkan Ürünler',
    best_sellers: 'Çok Satanlar',
    loading: 'Yükleniyor...',
    heroSlides: [
      {
        image: '/images/smart-technology.jpg',
        title: 'Akıllı Ev Teknolojileri',
        subtitle: 'Ev sistemlerinin geleceğini yaşayın',
        cta: 'Keşfet',
        cta_link: '/tr/products?category=smart_home',
      },
      {
        image: '/images/summer-sale.jpg',
        title: 'Yaz İndirimi Başladı',
        subtitle: 'Seçili ürünlerde %70’e varan indirim',
        cta: 'Alışverişe Başla',
        cta_link: '/tr/products?campaign=summer',
      },
      {
        image: '/images/fashion.png',
        title: 'Yeni Sezon Ürünleri',
        subtitle: '2025 koleksiyonunu keşfedin',
        cta: 'İncele',
        cta_link: '/tr/products?sort=new',
      },
    ],
    banner: {
      title: 'Yaza Özel %20 İndirim!',
      desc: 'Seçili ürünlerde geçerli, fırsatı kaçırma.',
      cta: 'Şimdi İncele',
      cta_link: '/tr/products?campaign=summer',
    },
    advantages: [
      { icon: '🚚', text: 'Hızlı Kargo' },
      { icon: '🔄', text: 'Kolay İade' },
      { icon: '🔒', text: 'Güvenli Alışveriş' },
    ],
    stats: [
      { value: '10.000+', desc: 'Mutlu Müşteri' },
      { value: '4.9/5', desc: 'Müşteri Puanı' },
      { value: '7/24', desc: 'Destek' },
    ],
    categories: [
      {
        category_key: 'electronics',
        title: 'Elektronik',
        products: [
          {
            _id: '684cc068d420cd4245fb1800',
            price: 799,
            rating: 4.7,
            image: '/images/laptop.jpg',
          },
          // diğer ürünler...
        ],
      },
      {
        category_key: 'books',
        title: 'Kitaplar',
        products: [
          {
            _id: '684cc068d420cd4245fb1801',
            price: 120,
            rating: 4.8,
            image: '/images/book1.jpg',
          },
        ],
      },
      // Diğer kategoriler...
    ],
  };

  const [data, setData] = useState(initialData);
  const [editSlideIndex, setEditSlideIndex] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Sayfa başlığı değiştir
  const handlePageTitleChange = (e) => {
    setData((prev) => ({ ...prev, page_title: e.target.value }));
  };

  // Banner güncelleme örneği (title)
  const handleBannerChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      banner: { ...prev.banner, [field]: value },
    }));
  };

  // Slider düzenleme modal aç
  const openEditSlide = (index) => {
    setEditSlideIndex(index);
  };

  // Slider düzenle form inputu değişikliği
  const handleSlideChange = (field, value) => {
    setData((prev) => {
      const newSlides = [...prev.heroSlides];
      newSlides[editSlideIndex] = { ...newSlides[editSlideIndex], [field]: value };
      return { ...prev, heroSlides: newSlides };
    });
  };

  const closeEditSlide = () => setEditSlideIndex(null);

  // Ürün düzenleme modal aç
  const openEditProduct = (product, categoryKey) => {
    setEditProduct({ ...product, category_key: categoryKey });
    setShowProductModal(true);
  };

  const closeEditProduct = () => {
    setEditProduct(null);
    setShowProductModal(false);
  };

  // Ürün form değişikliği
  const handleProductChange = (field, value) => {
    setEditProduct((prev) => ({ ...prev, [field]: value }));
  };

  // Ürün kaydet (güncelle)
  const saveProduct = () => {
    setData((prev) => {
      const newCategories = prev.categories.map((cat) => {
        if (cat.category_key === editProduct.category_key) {
          return {
            ...cat,
            products: cat.products.map((p) =>
              p._id === editProduct._id ? editProduct : p
            ),
          };
        }
        return cat;
      });
      return { ...prev, categories: newCategories };
    });
    closeEditProduct();
  };

  // Ürün sil
  const deleteProduct = (productId, categoryKey) => {
    if (!window.confirm('Ürünü silmek istediğinizden emin misiniz?')) return;

    setData((prev) => {
      const newCategories = prev.categories.map((cat) => {
        if (cat.category_key === categoryKey) {
          return {
            ...cat,
            products: cat.products.filter((p) => p._id !== productId),
          };
        }
        return cat;
      });
      return { ...prev, categories: newCategories };
    });
  };

  // Rating yıldız göstergesi
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} color={i <= Math.round(rating) ? '#ffc107' : '#e4e5e9'} />
      );
    }
    return stars;
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-bold text-danger">Admin Home Sayfası</h2>

      {/* Sayfa Başlığı */}
      <Form.Group className="mb-3" controlId="pageTitle">
        <Form.Label>Sayfa Başlığı</Form.Label>
        <Form.Control
          type="text"
          value={data.page_title}
          onChange={handlePageTitleChange}
        />
      </Form.Group>

      {/* Banner Düzenleme */}
      <Card className="mb-4">
        <Card.Header>Banner Düzenle</Card.Header>
        <Card.Body>
          <Form.Group className="mb-2">
            <Form.Label>Başlık</Form.Label>
            <Form.Control
              type="text"
              value={data.banner.title}
              onChange={(e) => handleBannerChange('title', e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Açıklama</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={data.banner.desc}
              onChange={(e) => handleBannerChange('desc', e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Buton Yazısı</Form.Label>
            <Form.Control
              type="text"
              value={data.banner.cta}
              onChange={(e) => handleBannerChange('cta', e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Buton Linki</Form.Label>
            <Form.Control
              type="text"
              value={data.banner.cta_link}
              onChange={(e) => handleBannerChange('cta_link', e.target.value)}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Slider Düzenleme */}
      <h4>Slider Düzenleme</h4>
      <Row className="mb-4">
        {data.heroSlides.map((slide, i) => (
          <Col md={4} key={i}>
            <Card className="mb-3">
              <Card.Img
                variant="top"
                src={slide.image}
                style={{ height: '150px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{slide.title}</Card.Title>
                <Card.Text>{slide.subtitle}</Card.Text>
                <Button variant="outline-primary" size="sm" onClick={() => openEditSlide(i)}>
                  Düzenle
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Slider düzenleme modal */}
      <Modal show={editSlideIndex !== null} onHide={closeEditSlide}>
        <Modal.Header closeButton>
          <Modal.Title>Slider Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editSlideIndex !== null && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Resim URL</Form.Label>
                <Form.Control
                  type="text"
                  value={data.heroSlides[editSlideIndex].image}
                  onChange={(e) => handleSlideChange('image', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Başlık</Form.Label>
                <Form.Control
                  type="text"
                  value={data.heroSlides[editSlideIndex].title}
                  onChange={(e) => handleSlideChange('title', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Alt Başlık</Form.Label>
                <Form.Control
                  type="text"
                  value={data.heroSlides[editSlideIndex].subtitle}
                  onChange={(e) => handleSlideChange('subtitle', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Buton Yazısı</Form.Label>
                <Form.Control
                  type="text"
                  value={data.heroSlides[editSlideIndex].cta}
                  onChange={(e) => handleSlideChange('cta', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Buton Linki</Form.Label>
                <Form.Control
                  type="text"
                  value={data.heroSlides[editSlideIndex].cta_link}
                  onChange={(e) => handleSlideChange('cta_link', e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditSlide}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Avantajlar */}
      <h4>Avantajlar</h4>
      <Row className="mb-4">
        {data.advantages.map((adv, i) => (
          <Col md={4} key={i}>
            <Card className="text-center py-3">
              <div style={{ fontSize: '2rem' }}>{adv.icon}</div>
              <Card.Text>{adv.text}</Card.Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* İstatistikler */}
      <h4>İstatistikler</h4>
      <Row className="mb-4">
        {data.stats.map((stat, i) => (
          <Col md={4} key={i}>
            <Card className="text-center py-3 bg-light">
              <h3>{stat.value}</h3>
              <Card.Text>{stat.desc}</Card.Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Kategoriler ve Ürünler */}
      <h4>Kategoriler & Ürünler</h4>
      {data.categories.map((category) => (
        <div key={category.category_key} className="mb-5">
          <h5>{category.title}</h5>
          <Row>
            {category.products.map((product) => (
              <Col md={3} key={product._id} className="mb-3">
                <Card>
                  <Card.Img
                    variant="top"
                    src={product.image}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>{product.price} ₺</Card.Title>
                    <Card.Text>{renderStars(product.rating)}</Card.Text>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => openEditProduct(product, category.category_key)}
                      className="me-2"
                    >
                      <FaEdit /> Düzenle
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deleteProduct(product._id, category.category_key)}
                    >
                      <FaTrash /> Sil
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}

      {/* Ürün Düzenleme Modal */}
      <Modal show={showProductModal} onHide={closeEditProduct}>
        <Modal.Header closeButton>
          <Modal.Title>Ürün Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editProduct && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Fiyat (₺)</Form.Label>
                <Form.Control
                  type="number"
                  value={editProduct.price}
                  onChange={(e) => handleProductChange('price', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Rating</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={editProduct.rating}
                  onChange={(e) => handleProductChange('rating', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Resim URL</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.image}
                  onChange={(e) => handleProductChange('image', e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditProduct}>
            İptal
          </Button>
          <Button variant="primary" onClick={saveProduct}>
            Kaydet
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminHome;
