import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { 
  FaTshirt, 
  FaLaptop, 
  FaHome, 
  FaBook, 
  FaArrowRight,
  FaSearch
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './categories.css';

const CategoriesEnhanced = () => {
  const { t } = useTranslation(['common', 'categories']);
  const [categories, setCategories] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping function
  const getIcon = (iconName, size = 48) => {
    switch (iconName) {
      case 'fashion':
        return <FaTshirt size={size} />;
      case 'electronics':
        return <FaLaptop size={size} />;
      case 'home':
        return <FaHome size={size} />;
      case 'books':
        return <FaBook size={size} />;
      default:
        return null;
    }
  };

  // Fetch categories from i18n
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      const categoriesData = t('categories:categories.items', { returnObjects: true });
      
      if (!Array.isArray(categoriesData)) {
        throw new Error(t('common:error.data_format', "Categories data is not in the expected format."));
      }
      
      setCategories(categoriesData);
      setFeaturedCategories(categoriesData.filter(cat => cat.featured));
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError(err.message || t('common:error.loading', 'Error loading categories. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="danger" role="status">
          <span className="visually-hidden">{t('common:loading', 'Yükleniyor...')}</span>
        </Spinner>
        <p className="mt-2">{t('common:loading', 'Yükleniyor...')}</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>{t('common:error.title', 'Bir Hata Oluştu')}</h4>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <div className="categories-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <h1 className="display-4 fw-bold mb-3">{t('categories:categories.title', 'Kategoriler')}</h1>
              <p className="lead mb-4">
                {t('categories:subtitle', 'Tüm ürün kategorilerimizi keşfedin ve ihtiyacınız olan her şeyi bulun')}
              </p>
              <Link to="/products">
                <Button variant="light" size="lg" className="rounded-pill px-4 py-2 me-3">
                  <FaSearch className="me-2" /> {t('products:title', 'Tüm Ürünleri Gör')}
                </Button>
              </Link>
            </Col>
            <Col lg={5} className="d-none d-lg-block">
              <div className="d-flex justify-content-center">
                <div className="category-icon-wrapper bg-white me-2" style={{ transform: 'scale(1.2) translateY(-15px)' }}>
                  {getIcon('fashion', 36)}
                </div>
                <div className="category-icon-wrapper bg-white me-2" style={{ transform: 'scale(1.4)' }}>
                  {getIcon('electronics', 36)}
                </div>
                <div className="category-icon-wrapper bg-white me-2" style={{ transform: 'scale(1.2) translateY(15px)' }}>
                  {getIcon('home', 36)}
                </div>
                <div className="category-icon-wrapper bg-white" style={{ transform: 'scale(1.1)' }}>
                  {getIcon('books', 36)}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="g-4">
          {categories.map((category) => (
            <Col key={category.id} sm={6} lg={3} className="mb-4">
              <Card className="h-100 shadow-sm category-card border-0">
                <div className="category-image-container">
                  <img 
                    src={category.image || `/api/placeholder/400/200`} 
                    alt={category.title}
                    className="category-image"
                  />
                </div>
                <div className="text-center py-4">
                  <div className="category-icon-wrapper mb-3">
                    <div className="category-icon">
                      {getIcon(category.icon, 36)}
                    </div>
                  </div>
                  <Card.Body>
                    <Card.Title className="h4 mb-2">{category.title}</Card.Title>
                    <Card.Text className="text-muted mb-2">{category.subtitle}</Card.Text>
                    <Card.Text className="small d-none d-md-block mb-4">{category.description}</Card.Text>
                    <Link to={`/products/category/${category.id}`}>
                      <Button 
                        variant="outline-danger" 
                        className="rounded-pill px-4"
                      >
                        {t('categories:explore_button', 'Keşfet')} <FaArrowRight className="ms-2" />
                      </Button>
                    </Link>
                    {category.featured && (
                      <Badge 
                        bg="danger" 
                        className="position-absolute top-0 end-0 mt-3 me-3 px-3 py-2"
                      >
                        Popüler
                      </Badge>
                    )}
                  </Card.Body>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="featured-section mt-5 p-5 text-center">
          <h2 className="h2 mb-4">{t('categories:featured_title', 'Öne Çıkan Ürünleri Keşfedin')}</h2>
          <p className="lead text-muted mb-4">
            {t('categories:featured_subtitle', 'En çok tercih edilen ürünlerimizi inceleyin')}
          </p>
          <Row className="justify-content-center">
            {featuredCategories.map((category) => (
              <Col key={category.id} md={4} className="mb-4">
                <Card className="h-100 shadow-sm category-card border-0 hover-effect">
                  <div className="category-image-container">
                    <img 
                      src={category.image || `/api/placeholder/400/200`} 
                      alt={category.title}
                      className="category-image"
                    />
                    <div className="category-overlay">
                      <h5 className="mb-0">{category.title}</h5>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="mt-4">
            <Link to="/products">
              <Button 
                variant="danger" 
                size="lg" 
                className="rounded-pill px-5 py-2 mt-3"
              >
                {t('categories:all_products_button', 'Tüm Ürünleri Gör')} <FaArrowRight className="ms-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
};

export default CategoriesEnhanced;