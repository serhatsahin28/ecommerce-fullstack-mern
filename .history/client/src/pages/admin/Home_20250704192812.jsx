import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';

const AdminHome = () => {
  // State'lerimizi tanımlıyoruz
  const [homeData, setHomeData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true); // Sayfa ilk açıldığında yükleme durumu
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Veri çekme fonksiyonunu useCallback ile sarmalıyoruz.
  // Bu, gereksiz yeniden render'ların önüne geçer.
  const fetchAndUpdateData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend'e PUT isteği atıyoruz.
      const response = await axios.put('http://localhost:5000/admin/updateHomeList');
      
      // Gelen verileri state'e kaydediyoruz.
      setHomeData(response.data.homeData || []);
      setProductData(response.data.productData || []);
      setLastUpdated(new Date()); // Güncelleme zamanını kaydediyoruz.

    } catch (err) {
      console.error("Veri güncelleme hatası:", err);
      // Kullanıcıya gösterilecek hata mesajını state'e kaydediyoruz.
      const errorMessage = err.response?.data?.message || 'Veriler yüklenemedi. Sunucuya ulaşılamıyor olabilir.';
      setError(errorMessage);
    } finally {
      // Hata olsa da olmasa da yükleme durumunu kapatıyoruz.
      setLoading(false);
    }
  }, []); // Bağımlılık dizisi boş, çünkü dışarıdan bir şeye bağlı değil.

  // Component ilk yüklendiğinde verileri çekmek için useEffect kullanıyoruz.
  useEffect(() => {
    fetchAndUpdateData();
  }, [fetchAndUpdateData]); // fetchAndUpdateData fonksiyonu değiştiğinde tekrar çalışır.

  // Render edilecek JSX
  return (
    <Container fluid className="p-3 p-md-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="h3">Anasayfa Yönetimi</h1>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          {/* Yükleme sırasında butonu devre dışı bırakıyoruz */}
          <Button 
            variant="primary" 
            onClick={fetchAndUpdateData} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Güncelleniyor...</span>
              </>
            ) : (
              'Verileri Yenile'
            )}
          </Button>
        </Col>
      </Row>

      {/* Hata Mesajı Alanı */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Son Güncelleme Bilgisi */}
      {lastUpdated && !error && (
        <Alert variant="info" className="mb-4">
          Son Güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
        </Alert>
      )}

      {/* Veri Listeleme Alanı */}
      <Row>
        {/* Anasayfa Verileri Kartı */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header as="h5">Anasayfa İçerikleri</Card.Header>
            <ListGroup variant="flush">
              {loading ? (
                <ListGroup.Item className="text-center p-3">
                  <Spinner animation="border" variant="secondary" />
                </ListGroup.Item>
              ) : homeData.length > 0 ? (
                homeData.map(item => (
                  <ListGroup.Item key={item._id} className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">{item.title || 'Başlık Yok'}</div>
                      {item.description || 'Açıklama yok.'}
                    </div>
                    <Badge bg="primary" pill>
                      ID: {item._id.slice(-6)}
                    </Badge>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>Gösterilecek anasayfa verisi bulunamadı.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Ürün Verileri Kartı */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header as="h5">Ürün Listesi</Card.Header>
            <ListGroup variant="flush">
              {loading ? (
                <ListGroup.Item className="text-center p-3">
                  <Spinner animation="border" variant="secondary" />
                </ListGroup.Item>
              ) : productData.length > 0 ? (
                productData.map(product => (
                  <ListGroup.Item key={product._id} className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">{product.name || 'İsim Yok'}</div>
                      Fiyat: {product.price ? `${product.price} TL` : 'Belirtilmemiş'}
                    </div>
                    <Badge bg="success" pill>
                      Stok: {product.stock ?? 'N/A'}
                    </Badge>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>Gösterilecek ürün verisi bulunamadı.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminHome;