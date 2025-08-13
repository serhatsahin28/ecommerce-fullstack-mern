import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import OrderCard from './OrderCard'; // OrderCard bileşenini import ediyoruz

const ViewOrdersPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // State'ler
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      // Token kontrolü
      if (!token) {
        setError('Geçersiz bağlantı. Lütfen size gönderilen linki kontrol edin.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // API'den verileri çekme
        const response = await axios.get(`http://localhost:5000/api/orders/view-by-token?token=${token}`);
        
        if (response.data.success) {
          setOrders(response.data.orders);
          if (response.data.orders.length > 0) {
              setWelcomeMessage(`Hoş geldiniz! Hesabınıza ait toplam ${response.data.totalOrders} adet sipariş bulundu.`);
          }
        } else {
          // API'den gelen ama başarılı olmayan yanıtlar için
          setError(response.data.message || 'Siparişleriniz getirilirken bir sorun oluştu.');
        }
      } catch (err) {
        // Ağ veya sunucu hataları için
        setError(err.response?.data?.message || 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]); // useEffect'in sadece token değiştiğinde çalışmasını sağlıyoruz

  // Yükleme durumu arayüzü
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="danger" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 fs-5">Siparişleriniz yükleniyor...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: '1000px' }}>
      <h1 className="mb-4 text-center text-danger fw-bold">Siparişlerim</h1>
      
      {/* Hata Mesajı */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Hoş Geldiniz Mesajı */}
      {welcomeMessage && !error && <Alert variant="success">{welcomeMessage}</Alert>}

      {/* Siparişler */}
      {!error && orders.length > 0 ? (
        <div className="d-flex flex-column gap-4 mt-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      ) : (
        // Sipariş bulunamadı durumu
        !loading && !error && (
            <Alert variant="info" className="text-center mt-4">
                Görüntülenecek herhangi bir siparişiniz bulunmuyor.
            </Alert>
        )
      )}
    </Container>
  );
};

export default ViewOrdersPage;