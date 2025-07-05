// src/pages/admin/Home.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, InputGroup } from 'react-bootstrap';
import { FaStar, FaTrash, FaEdit } from 'react-icons/fa';

const AdminHome = () => {
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
      { id: 1, icon: '🚚', text: 'Hızlı Kargo' },
      { id: 2, icon: '🔄', text: 'Kolay İade' },
      { id: 3, icon: '🔒', text: 'Güvenli Alışveriş' },
    ],
    stats: [
      { id: 1, value: '10.000+', desc: 'Mutlu Müşteri' },
      { id: 2, value: '4.9/5', desc: 'Müşteri Puanı' },
      { id: 3, value: '7/24', desc: 'Destek' },
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
    ],
  };

  const [data, setData] = useState(initialData);

  // Düzenleme modalları state'leri
  const [editSlideIndex, setEditSlideIndex] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editAdvantage, setEditAdvantage] = useState(null);
  const [showAdvantageModal, setShowAdvantageModal] = useState(false);
  const [editStat, setEditStat] = useState(null);
  const [showStatModal, setShowStatModal] = useState(false);

  // Sayfa başlığı değişikliği
  const handlePageTitleChange = (e) => {
    setData((prev) => ({ ...prev, page_title: e.target.value }));
  };

  // Sayfa alt başlık değişikliği
  const handlePageSubtitleChange = (e) => {
    setData((prev) => ({ ...prev, page_subtitle: e.target.value }));
  };

  // Banner güncelleme
  const handleBannerChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      banner: { ...prev.banner, [field]: value },
    }));
  };

  // Slider aç-kapat
  const openEditSlide = (index) => setEditSlideIndex(index);
  const closeEditSlide = () => setEditSlideIndex(null);

  // Slider güncelleme
  const handleSlideChange = (field, value) => {
    setData((prev) => {
      const slides = [...prev.heroSlides];
      slides[editSlideIndex] = { ...slides[editSlideIndex], [field]: value };
      return { ...prev, heroSlides: slides };
    });
  };

  // Ürün düzenleme aç/kapat
  const openEditProduct = (product, categoryKey) => {
    setEditProduct({ ...product, category_key: categoryKey });
    setShowProductModal(true);
  };
  const closeEditProduct = () => {
    setEditProduct(null);
    setShowProductModal(false);
  };

  // Ürün güncelleme
  const handleProductChange = (field, value) => {
    setEditProduct((prev) => ({ ...prev, [field]: value }));
  };
  const saveProduct = () => {
    setData((prev) => {
      const categories = prev.categories.map((cat) => {
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
      return { ...prev, categories };
    });
    closeEditProduct();
  };

  // Ürün sil
  const deleteProduct = (id, categoryKey) => {
    if (!window.confirm('Ürünü silmek istediğinizden emin misiniz?')) return;
    setData((prev) => {
      const categories = prev.categories.map((cat) => {
        if (cat.category_key === categoryKey) {
          return {
            ...cat,
            products: cat.products.filter((p) => p._id !== id),
          };
        }
        return cat;
      });
      return { ...prev, categories };
    });
  };

  // Avantaj düzenleme modal aç/kapat
  const openEditAdvantage = (adv) => {
    setEditAdvantage(adv);
    setShowAdvantageModal(true);
  };
  const closeEditAdvantage = () => {
    setEditAdvantage(null);
    setShowAdvantageModal(false);
  };
  const handleAdvantageChange = (field, value) => {
    setEditAdvantage((prev) => ({ ...prev, [field]: value }));
  };
  const saveAdvantage = () => {
    setData((prev) => {
      const advantages = prev.advantages.map((adv) =>
        adv.id === editAdvantage.id ? editAdvantage : adv
      );
      return { ...prev, advantages };
    });
    closeEditAdvantage();
  };

  // İstatistik düzenleme modal aç/kapat
  const openEditStat = (stat) => {
    setEditStat(stat);
    setShowStatModal(true);
  };
  const closeEditStat = () => {
    setEditStat(null);
    setShowStatModal(false);
  };
  const handleStatChange = (field, value) => {
    setEditStat((prev) => ({ ...prev, [field]: value }));
  };
  const saveStat = () => {
    setData((prev) => {
      const stats = prev.stats.map((stat) =>
        stat.id === editStat.id ? editStat : stat
      );
      return { ...prev, stats };
    });
    closeEditStat();
  };

  // Yıldızları renderla
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          color={i <= Math.round(rating) ? '#ffc107' : '#e4e5e9'}
        />
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
        <InputGroup>
          <Form.Control
            type="text"
            value={data.page_title}
            onChange={handlePageTitleChange}
          />
          <Button variant="outline-secondary" disabled>
            Düzenle
          </Button>
        </InputGroup>
      </Form.Group>

      {/* Sayfa Alt Başlığı */}
      <Form.Group className="mb-3" controlId="pageSubtitle">
        <Form.Label>Sayfa Alt Başlığı</Form.Label>
        <InputGroup>
          <Form.Control
            as="textarea"
            rows={2}
            value={data.page_subtitle}
            onChange={handlePageSubtitleChange}
          />
          <Button variant="outline-secondary" disabled>
            Düzenle
          </Button>
        </InputGroup>
      </Form.Group>

      {/* Banner Düzenleme */}
      <Card className="mb-4">
        <Card.Header>
          Banner Düzenle{' '}
          {/* Banner için inline değil modal açmak istersen buraya buton koyabilirsin */}
        </Card.Header>
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
                <Card.Title>
                  {slide.title}{' '}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openEditSlide(i)}
                  >
                    <FaEdit /> Düzenle
                  </Button>
                </Card.Title>
                <Card.Text>{slide.subtitle}</Card.Text>
                <div>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => alert('CTA Link: ' + slide.cta_link)}
                    className="me-2"
                  >
                    Buton Linkini Göster
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    disabled
                  >
                    {slide.cta}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Slider Düzenleme Modal */}
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
        {data.advantages.map((adv) => (
          <Col md={4} key={adv.id}>
            <Card className="text-center py-3 bg-light">
              <div style={{ fontSize: '2rem' }}>{adv.icon}</div>
              <Card.Text>{adv.text}</Card.Text>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => openEditAdvantage(adv)}
              >
                <FaEdit /> Düzenle
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Avantaj Düzenleme Modal */}
      <Modal show={showAdvantageModal} onHide={closeEditAdvantage}>
        <Modal.Header closeButton>
          <Modal.Title>Avantaj Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editAdvantage && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>İkon</Form.Label>
                <Form.Control
                  type="text"
                  value={editAdvantage.icon}
                  onChange={(e) => handleAdvantageChange('icon', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Metin</Form.Label>
                <Form.Control
                  type="text"
                  value={editAdvantage.text}
                  onChange={(e) => handleAdvantageChange('text', e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditAdvantage}>
            İptal
          </Button>
          <Button variant="primary" onClick={saveAdvantage}>
            Kaydet
          </Button>
        </Modal.Footer>
      </Modal>

      {/* İstatistikler */}
      <h4>İstatistikler</h4>
      <Row className="mb-4">
        {data.stats.map((stat) => (
          <Col md={4} key={stat.id}>
            <Card className="text-center py-3 bg-light">
              <h3>{stat.value}</h3>
              <Card.Text>{stat.desc}</Card.Text>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => openEditStat(stat)}
              >
                <FaEdit /> Düzenle
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* İstatistik Düzenleme Modal */}
      <Modal show={showStatModal} onHide={closeEditStat}>
        <Modal.Header closeButton>
          <Modal.Title>İstatistik Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editStat && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Değer</Form.Label>
                <Form.Control
                  type="text"
                  value={editStat.value}
                  onChange={(e) => handleStatChange('value', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Açıklama</Form.Label>
                <Form.Control
                  type="text"
                  value={editStat.desc}
                  onChange={(e) => handleStatChange('desc', e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditStat}>
            İptal
          </Button>
          <Button variant="primary" onClick={saveStat}>
            Kaydet
          </Button>
        </Modal.Footer>
      </Modal>

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
