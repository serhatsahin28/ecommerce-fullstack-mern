// src/pages/admin/Home.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, Modal, 
  InputGroup, Tabs, Tab, FormControl, Image
} from 'react-bootstrap';
import { FaStar, FaTrash, FaEdit, FaPlus, FaMinus } from 'react-icons/fa';

const AdminHome = () => {
  // MongoDB'den gelen veri yapısına uygun initial data
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
            images: [
              "/images/laptop.jpg",
              "/images/laptop2.jpg",
              "/images/laptop3.jpg",
              "/images/laptop4.jpg"
            ],
            translations: {
              tr: {
                name: 'Akıllı Telefon A',
                description: 'Güçlü batarya ve yapay zeka destekli kamera',
                features: [
                  "2 yıl garanti",
                  "Hafif tasarım",
                  "Hızlı şarj desteklenir",
                  "Gürültü engelleme"
                ],
                reviews: [
                  "Kalite harika.",
                  "Mükemmel ürün, beklentileri aştı!"
                ]
              },
              en: {
                name: 'Smartphone A',
                description: 'Strong battery and AI-powered camera',
                features: [
                  "2-year warranty",
                  "Lightweight design",
                  "Fast charging supported",
                  "Noise cancellation"
                ],
                reviews: [
                  "The quality is outstanding.",
                  "Excellent product, exceeded expectations!"
                ]
              }
            }
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
            images: [
              "/images/book1.jpg",
              "/images/book1-2.jpg",
              "/images/book1-3.jpg",
              "/images/book1-4.jpg"
            ],
            translations: {
              tr: {
                name: 'Yenilikçi Yazarlık',
                description: 'Modern edebiyatın başyapıtı',
                features: [
                  "Özgün içerik",
                  "Yumuşak kapak",
                  "Genişletilmiş baskı",
                  "İmzalı nüsha"
                ],
                reviews: [
                  "Çok etkileyici.",
                  "Okurken büyülendim!"
                ]
              },
              en: {
                name: 'Innovative Writing',
                description: 'Masterpiece of modern literature',
                features: [
                  "Original content",
                  "Soft cover",
                  "Expanded edition",
                  "Signed copy"
                ],
                reviews: [
                  "Very impressive.",
                  "I was mesmerized while reading!"
                ]
              }
            }
          },
        ],
      },
    ],
  };

  const [data, setData] = useState(initialData);
  const [editSlideIndex, setEditSlideIndex] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editAdvantage, setEditAdvantage] = useState(null);
  const [showAdvantageModal, setShowAdvantageModal] = useState(false);
  const [editStat, setEditStat] = useState(null);
  const [showStatModal, setShowStatModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('tr');

  // MongoDB'den veri çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/home');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      }
    };
    
    fetchData();
  }, []);

  // MongoDB'ye veri güncelleme
  const saveToDatabase = async () => {
    try {
      const response = await fetch('/api/admin/home', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        alert('Başarıyla güncellendi!');
      } else {
        alert('Güncelleme hatası!');
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
    }
  };

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

  // Yeni slider ekle
  const addNewSlide = () => {
    setData((prev) => ({
      ...prev,
      heroSlides: [
        ...prev.heroSlides,
        {
          image: '',
          title: '',
          subtitle: '',
          cta: '',
          cta_link: '',
        },
      ],
    }));
    setEditSlideIndex(data.heroSlides.length);
  };

  // Slider sil
  const deleteSlide = (index) => {
    if (!window.confirm('Bu slaydı silmek istediğinizden emin misiniz?')) return;
    
    setData((prev) => {
      const slides = [...prev.heroSlides];
      slides.splice(index, 1);
      return { ...prev, heroSlides: slides };
    });
    
    if (editSlideIndex === index) {
      closeEditSlide();
    }
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

  // Çeviri güncelleme
  const handleTranslationChange = (lang, field, value) => {
    setEditProduct((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value,
        },
      },
    }));
  };

  // Özellik güncelleme
  const handleFeatureChange = (lang, index, value) => {
    setEditProduct((prev) => {
      const newFeatures = [...prev.translations[lang].features];
      newFeatures[index] = value;
      
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            ...prev.translations[lang],
            features: newFeatures,
          },
        },
      };
    });
  };

  // Yeni özellik ekle
  const addNewFeature = (lang) => {
    setEditProduct((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          features: [...prev.translations[lang].features, ''],
        },
      },
    }));
  };

  // Özellik sil
  const removeFeature = (lang, index) => {
    setEditProduct((prev) => {
      const newFeatures = [...prev.translations[lang].features];
      newFeatures.splice(index, 1);
      
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            ...prev.translations[lang],
            features: newFeatures,
          },
        },
      };
    });
  };

  // Resim ekle
  const addImage = () => {
    setEditProduct((prev) => ({
      ...prev,
      images: [...prev.images, ''],
    }));
  };

  // Resim sil
  const removeImage = (index) => {
    setEditProduct((prev) => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  // Resim URL güncelleme
  const handleImageChange = (index, value) => {
    setEditProduct((prev) => {
      const newImages = [...prev.images];
      newImages[index] = value;
      return { ...prev, images: newImages };
    });
  };

  // Ürünü kaydet
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

  // Kategori düzenleme
  const openEditCategory = (category) => {
    setEditCategory(category);
    setShowCategoryModal(true);
  };
  
  const closeEditCategory = () => {
    setEditCategory(null);
    setShowCategoryModal(false);
  };
  
  const handleCategoryChange = (field, value) => {
    setEditCategory((prev) => ({ ...prev, [field]: value }));
  };
  
  const saveCategory = () => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.category_key === editCategory.category_key ? editCategory : cat
      ),
    }));
    closeEditCategory();
  };

  // Yeni kategori ekle
  const addNewCategory = () => {
    const newCategory = {
      category_key: `new-category-${Date.now()}`,
      title: 'Yeni Kategori',
      products: [],
    };
    
    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    
    setEditCategory(newCategory);
    setShowCategoryModal(true);
  };

  // Kategori sil
  const deleteCategory = (categoryKey) => {
    if (!window.confirm('Kategoriyi ve tüm ürünlerini silmek istediğinizden emin misiniz?')) return;
    
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter(
        (cat) => cat.category_key !== categoryKey
      ),
    }));
  };

  // Avantaj düzenleme
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

  // Yeni avantaj ekle
  const addNewAdvantage = () => {
    const newAdvantage = {
      id: Date.now(),
      icon: '⭐',
      text: 'Yeni Avantaj',
    };
    
    setData((prev) => ({
      ...prev,
      advantages: [...prev.advantages, newAdvantage],
    }));
    
    setEditAdvantage(newAdvantage);
    setShowAdvantageModal(true);
  };

  // Avantaj sil
  const deleteAdvantage = (id) => {
    if (!window.confirm('Bu avantajı silmek istediğinizden emin misiniz?')) return;
    
    setData((prev) => ({
      ...prev,
      advantages: prev.advantages.filter((adv) => adv.id !== id),
    }));
  };

  // İstatistik düzenleme
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

  // Yeni istatistik ekle
  const addNewStat = () => {
    const newStat = {
      id: Date.now(),
      value: 'Yeni Değer',
      desc: 'Yeni Açıklama',
    };
    
    setData((prev) => ({
      ...prev,
      stats: [...prev.stats, newStat],
    }));
    
    setEditStat(newStat);
    setShowStatModal(true);
  };

  // İstatistik sil
  const deleteStat = (id) => {
    if (!window.confirm('Bu istatistiği silmek istediğinizden emin misiniz?')) return;
    
    setData((prev) => ({
      ...prev,
      stats: prev.stats.filter((stat) => stat.id !== id),
    }));
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
      
      <div className="d-flex justify-content-end mb-4">
        <Button variant="success" onClick={saveToDatabase}>
          Tüm Değişiklikleri Kaydet
        </Button>
      </div>

      {/* Sayfa Başlığı */}
      <Form.Group className="mb-3" controlId="pageTitle">
        <Form.Label>Sayfa Başlığı</Form.Label>
        <Form.Control
          type="text"
          value={data.page_title}
          onChange={handlePageTitleChange}
        />
      </Form.Group>

      {/* Sayfa Alt Başlığı */}
      <Form.Group className="mb-3" controlId="pageSubtitle">
        <Form.Label>Sayfa Alt Başlığı</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={data.page_subtitle}
          onChange={handlePageSubtitleChange}
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
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Slider Düzenleme</span>
          <Button variant="primary" size="sm" onClick={addNewSlide}>
            <FaPlus /> Yeni Slayt Ekle
          </Button>
        </Card.Header>
        <Card.Body>
          <Row>
            {data.heroSlides.map((slide, i) => (
              <Col md={4} key={i} className="mb-3">
                <Card>
                  <Card.Img
                    variant="top"
                    src={slide.image}
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>
                      {slide.title}
                      <div className="mt-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => openEditSlide(i)}
                          className="me-2"
                        >
                          <FaEdit /> Düzenle
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteSlide(i)}
                        >
                          <FaTrash /> Sil
                        </Button>
                      </div>
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

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
                {data.heroSlides[editSlideIndex].image && (
                  <Image 
                    src={data.heroSlides[editSlideIndex].image} 
                    fluid 
                    className="mt-2"
                    style={{ maxHeight: '150px' }}
                  />
                )}
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
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Avantajlar</span>
          <Button variant="primary" size="sm" onClick={addNewAdvantage}>
            <FaPlus /> Yeni Avantaj Ekle
          </Button>
        </Card.Header>
        <Card.Body>
          <Row>
            {data.advantages.map((adv) => (
              <Col md={4} key={adv.id} className="mb-3">
                <Card className="text-center py-3 bg-light">
                  <div style={{ fontSize: '2rem' }}>{adv.icon}</div>
                  <Card.Text>{adv.text}</Card.Text>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => openEditAdvantage(adv)}
                      className="me-2"
                    >
                      <FaEdit /> Düzenle
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deleteAdvantage(adv.id)}
                    >
                      <FaTrash /> Sil
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

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
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>İstatistikler</span>
          <Button variant="primary" size="sm" onClick={addNewStat}>
            <FaPlus /> Yeni İstatistik Ekle
          </Button>
        </Card.Header>
        <Card.Body>
          <Row>
            {data.stats.map((stat) => (
              <Col md={4} key={stat.id} className="mb-3">
                <Card className="text-center py-3 bg-light">
                  <h3>{stat.value}</h3>
                  <Card.Text>{stat.desc}</Card.Text>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => openEditStat(stat)}
                      className="me-2"
                    >
                      <FaEdit /> Düzenle
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deleteStat(stat.id)}
                    >
                      <FaTrash /> Sil
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

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
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Kategoriler & Ürünler</span>
          <Button variant="primary" size="sm" onClick={addNewCategory}>
            <FaPlus /> Yeni Kategori Ekle
          </Button>
        </Card.Header>
        <Card.Body>
          {data.categories.map((category) => (
            <div key={category.category_key} className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>{category.title}</h5>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openEditCategory(category)}
                    className="me-2"
                  >
                    <FaEdit /> Kategoriyi Düzenle
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => deleteCategory(category.category_key)}
                  >
                    <FaTrash /> Kategoriyi Sil
                  </Button>
                </div>
              </div>
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
                        <Card.Title>{product.translations.tr.name}</Card.Title>
                        <Card.Subtitle className="mb-2">
                          {product.price} ₺
                        </Card.Subtitle>
                        <Card.Text>{renderStars(product.rating)}</Card.Text>
                        <div>
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
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* Kategori Düzenleme Modal */}
      <Modal show={showCategoryModal} onHide={closeEditCategory}>
        <Modal.Header closeButton>
          <Modal.Title>Kategori Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editCategory && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Kategori Anahtarı</Form.Label>
                <Form.Control
                  type="text"
                  value={editCategory.category_key}
                  onChange={(e) => handleCategoryChange('category_key', e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Kategori Adı</Form.Label>
                <Form.Control
                  type="text"
                  value={editCategory.title}
                  onChange={(e) => handleCategoryChange('title', e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditCategory}>
            İptal
          </Button>
          <Button variant="primary" onClick={saveCategory}>
            Kaydet
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Ürün Düzenleme Modal */}
      <Modal 
        show={showProductModal} 
        onHide={closeEditProduct}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ürün Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editProduct && (
            <Tabs
              defaultActiveKey="common"
              id="product-tabs"
              className="mb-3"
            >
              <Tab eventKey="common" title="Genel Bilgiler">
                <Form.Group className="mb-3">
                  <Form.Label>Fiyat (₺)</Form.Label>
                  <Form.Control
                    type="number"
                    value={editProduct.price}
                    onChange={(e) => handleProductChange('price', e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
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
                
                <Form.Group className="mb-3">
                  <Form.Label>Ana Resim URL</Form.Label>
                  <Form.Control
                    type="text"
                    value={editProduct.image}
                    onChange={(e) => handleProductChange('image', e.target.value)}
                  />
                  {editProduct.image && (
                    <Image 
                      src={editProduct.image} 
                      fluid 
                      className="mt-2"
                      style={{ maxHeight: '200px' }}
                    />
                  )}
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label>Diğer Resimler</Form.Label>
                    <Button variant="outline-primary" size="sm" onClick={addImage}>
                      <FaPlus /> Resim Ekle
                    </Button>
                  </div>
                  {editProduct.images.map((img, index) => (
                    <InputGroup key={index} className="mb-2">
                      <Form.Control
                        type="text"
                        value={img}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                      />
                      <Button 
                        variant="outline-danger" 
                        onClick={() => removeImage(index)}
                      >
                        <FaMinus />
                      </Button>
                      {img && (
                        <Image 
                          src={img} 
                          fluid 
                          className="mt-2"
                          style={{ maxHeight: '100px' }}
                        />
                      )}
                    </InputGroup>
                  ))}
                </Form.Group>
              </Tab>
              
              <Tab eventKey="tr" title="Türkçe Çeviri">
                <Form.Group className="mb-3">
                  <Form.Label>Ürün Adı</Form.Label>
                  <Form.Control
                    type="text"
                    value={editProduct.translations.tr.name || ''}
                    onChange={(e) => handleTranslationChange('tr', 'name', e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Açıklama</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editProduct.translations.tr.description || ''}
                    onChange={(e) => handleTranslationChange('tr', 'description', e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label>Özellikler</Form.Label>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => addNewFeature('tr')}
                    >
                      <FaPlus /> Özellik Ekle
                    </Button>
                  </div>
                  {editProduct.translations.tr.features.map((feature, index) => (
                    <InputGroup key={index} className="mb-2">
                      <Form.Control
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange('tr', index, e.target.value)}
                      />
                      <Button 
                        variant="outline-danger" 
                        onClick={() => removeFeature('tr', index)}
                      >
                        <FaMinus />
                      </Button>
                    </InputGroup>
                  ))}
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Yorumlar (Her yorum yeni satırda)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={editProduct.translations.tr.reviews.join('\n') || ''}
                    onChange={(e) => handleTranslationChange('tr', 'reviews', e.target.value.split('\n'))}
                  />
                </Form.Group>
              </Tab>
              
              <Tab eventKey="en" title="English Translation">
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editProduct.translations.en.name || ''}
                    onChange={(e) => handleTranslationChange('en', 'name', e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editProduct.translations.en.description || ''}
                    onChange={(e) => handleTranslationChange('en', 'description', e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label>Features</Form.Label>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => addNewFeature('en')}
                    >
                      <FaPlus /> Add Feature
                    </Button>
                  </div>
                  {editProduct.translations.en.features.map((feature, index) => (
                    <InputGroup key={index} className="mb-2">
                      <Form.Control
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange('en', index, e.target.value)}
                      />
                      <Button 
                        variant="outline-danger" 
                        onClick={() => removeFeature('en', index)}
                      >
                        <FaMinus />
                      </Button>
                    </InputGroup>
                  ))}
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Reviews (One per line)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={editProduct.translations.en.reviews.join('\n') || ''}
                    onChange={(e) => handleTranslationChange('en', 'reviews', e.target.value.split('\n'))}
                  />
                </Form.Group>
              </Tab>
            </Tabs>
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