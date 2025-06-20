import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation('common');

  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto">
      <Container>
        <Row className="mb-4">
          <Col md={4} sm={12}>
            <h5 className="mb-3">{t('footer.aboutTitle')}</h5>
            <p className="text-muted">{t('footer.aboutText')}</p>
          </Col>

          <Col md={4} sm={6}>
            <h5 className="mb-3">{t('footer.categories.title')}</h5>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <a href="/electronics" className="text-reset text-decoration-none">
                  {t('footer.categories.electronics')}
                </a>
              </li>
              <li className="mb-2">
                <a href="/fashion" className="text-reset text-decoration-none">
                  {t('footer.categories.fashion')}
                </a>
              </li>
              <li className="mb-2">
                <a href="/home_office" className="text-reset text-decoration-none">
                  {t('footer.categories.home')}
                </a>
              </li>
            </ul>
          </Col>

          <Col md={4} sm={6}>
            <h5 className="mb-3">{t('footer.contactTitle')}</h5>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                İstanbul, Türkiye
              </li>
              <li className="mb-2">
                <FaPhoneAlt className="me-2" />
                +90 212 000 0000
              </li>
              <li className="mb-2">
                <FaEnvelope className="me-2" />
                destek@ornek.com
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="border-secondary" />

        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
            <small className="text-muted">
              &copy; {new Date().getFullYear()} MyShop. {t('footer.rights')}
            </small>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <a href="https://facebook.com" className="text-light me-3">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" className="text-light me-3">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" className="text-light">
              <FaInstagram />
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
