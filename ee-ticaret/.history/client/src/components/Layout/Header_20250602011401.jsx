// src/components/layout/Header.jsx
import React, { useEffect, useState } from 'react';
import {
  Navbar, Nav, Container, Form, InputGroup, Button,
  Badge, Dropdown, Row, Col
} from 'react-bootstrap';
import {
  FaSearch, FaUser, FaShoppingCart, FaBoxOpen,
  FaTshirt, FaLaptop, FaHome, FaBook, FaBaby, FaChevronDown, FaTags
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LanguageSelector from '../common/LanguageSelector';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lng = location.pathname.split('/')[1] || 'tr';
  const { t, i18n } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    if (lng && i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n]);

  const [hoveringDropdown, setHoveringDropdown] = useState(false);

  useEffect(() => {
    if (!showCategories && hoveringDropdown) {
      setShowCategories(true);
    }
  }, [hoveringDropdown]);

  const categoryIcon = (iconName) => {
    const icons = {
      fashion: <FaTshirt className="text-primary category-icon-img" />,
      electronics: <FaLaptop className="text-success category-icon-img" />,
      home: <FaHome className="text-warning category-icon-img" />,
      books: <FaBook className="text-info category-icon-img" />,
      baby: <FaBaby className="text-danger category-icon-img" />,
      default: <FaTags className="text-secondary category-icon-img" />
    };
    return icons[iconName] || icons.default;
  };

  const categoriesData = t('categories', { returnObjects: true, ns: 'common' });
  const categories = Array.isArray(categoriesData?.items) ? categoriesData.items : [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${lng}/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleCategoryClick = () => {
    setShowCategories(false);
  };

  return (
    <Navbar expand="lg" sticky="top" bg="light" variant="light" className="header-navbar shadow-sm">
      <Container fluid="lg">
        <Navbar.Brand as={Link} to={`/${lng}`} className="fw-bold text-danger">
          <FaBoxOpen className="me-2" /> Shoppy
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto align-items-center">
            <Dropdown
              show={showCategories}
              onToggle={(isOpen, event, metadata) => {
                if (metadata.source === 'click' && !event.target.closest('.static-dropdown')) {
                  setShowCategories(isOpen);
                } else if (metadata.source === 'rootClose') {
                  setShowCategories(false);
                }
              }}
              className="position-static"
            >
              <Dropdown.Toggle
                as={Nav.Link}
                id="categories-dropdown-button"
                className="text-dark fw-medium d-flex align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  setShowCategories(!showCategories);
                }}
              >
                {categoriesData?.title || 'Categories'} <FaChevronDown className="ms-2 opacity-75" size="0.8em" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="category-dropdown w-100 p-3 border-0 shadow-lg mt-0">
                <Container fluid>
                  <h5 className="mb-3 text-danger border-bottom pb-2">{categoriesData?.title || 'Explore Categories'}</h5>
                  <Row className="g-3">
                    {categories.length > 0 ? categories.map((category) => (
                      <Col xs={12} sm={6} md={4} lg={3} xl={2} key={category.id}>
                        <Link
                          to={`/${lng}/${category.title.toLowerCase()}`}
                          className="text-decoration-none category-item d-block"
                          onClick={handleCategoryClick}
                        >
                          <div className="d-flex align-items-center p-2 rounded category-block-hover">
                            <div className="category-icon-wrapper me-2">
                              {categoryIcon(category.icon)}
                            </div>
                            <div className="category-text">
                              <h6 className="mb-0 fs-6 fw-medium text-dark">{category.title}</h6>
                              {category.subtitle && (
                                <small className="text-muted d-none d-md-block">{category.subtitle}</small>
                              )}
                            </div>
                          </div>
                        </Link>

                      </Col>
                    )) : (
                      <Col><p className="text-muted">{t('categories.no_categories', 'No categories available.')}</p></Col>
                    )}
                  </Row>
                </Container>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>

          <Form className="d-flex my-2 my-lg-0 me-lg-3 flex-grow-1 search-form-header" onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder={t('search_placeholder_simple', 'Search products...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t('search_placeholder_simple')}
              />
              <Button variant="danger" type="submit" id="search-button">
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>

          <Nav className="user-nav align-items-center">
            <Nav.Link as={Link} to={`/${lng}/account`} className="px-2 text-dark" aria-label="Account">
              <FaUser size={20} />
            </Nav.Link>
            <Nav.Link as={Link} to={`/${lng}/cart`} className="px-2 position-relative text-dark" aria-label="Shopping Cart">
              <FaShoppingCart size={20} />
              <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle-y badge-sm">
                3
                <span className="visually-hidden">items in cart</span>
              </Badge>
            </Nav.Link>
            <div className="ms-2 language-selector-wrapper">
              <LanguageSelector variant="light" />
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
