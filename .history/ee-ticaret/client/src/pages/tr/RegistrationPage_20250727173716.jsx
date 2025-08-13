import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import axios from 'axios';

const RegistrationPage = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPreFilled, setIsPreFilled] = useState(false);

    useEffect(() => {
        // localStorage'dan kayıt bilgilerini oku ve formu doldur
        const storedRegistrationInfo = localStorage.getItem('registrationInfo');

        if (storedRegistrationInfo) {
            const guestInfo = JSON.parse(storedRegistrationInfo);

            setFormData(prev => ({
                ...prev,
                first_name: guestInfo.ad || guestInfo.name || '',
                last_name: guestInfo.soyad || guestInfo.surname || '',
                email: guestInfo.email || '',
                phone: guestInfo.telefon || guestInfo.phone || ''
            }));

            setIsPreFilled(true);
            console.log('🔍 Registration Info loaded:', guestInfo);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Telefon numarası formatı (sadece rakam)
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        // İsim kontrolü
        if (!formData.first_name.trim()) {
            setError('Ad alanı zorunludur.');
            return false;
        }

        // Soyisim kontrolü
        if (!formData.last_name.trim()) {
            setError('Soyad alanı zorunludur.');
            return false;
        }

        // Email kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            setError('E-mail alanı zorunludur.');
            return false;
        }
        if (!emailRegex.test(formData.email)) {
            setError('Geçerli bir e-mail adresi giriniz.');
            return false;
        }

        // Telefon kontrolü
        if (!formData.phone.trim()) {
            setError('Telefon numarası zorunludur.');
            return false;
        }
        // if (formData.phone.length < 10) {
        //     setError('Telefon numarası en az 10 haneli olmalıdır.');
        //     return false;
        // }

        // Şifre kontrolü
        if (!formData.password) {
            setError('Şifre alanı zorunludur.');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return false;
        }

        // Şifre onayı kontrolü
        if (formData.password !== formData.confirm_password) {
            setError('Şifreler eşleşmiyor.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Form validasyonu
        if (!validateForm()) {
            setLoading(false);
            return;
        }

        // Backend'e gönderilecek veri
        const registrationData = {
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone,
            password: formData.password
        };

        console.log('📤 Registration Data:', registrationData);

        try {
            const response = await axios.post('http://localhost:5000/register', registrationData);

            console.log('📥 Registration Response:', response.data);

            if (response.data.success) {
                setSuccess('Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.');

                // localStorage temizle
                localStorage.removeItem('registrationInfo');
                localStorage.removeItem('cart');
                localStorage.removeItem('guestInfo');

                // Formu temizle
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirm_password: ''
                });

                // 3 saniye sonra giriş sayfasına yönlendir
                setTimeout(() => {
                    // window.location.href = '/login';
                    // veya React Router kullanıyorsanız:
                    // navigate('/login');
                    console.log('Giriş sayfasına yönlendiriliyor...');
                }, 3000);

            } else {
                setError(response.data.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
            }
        } catch (err) {
            console.error('Registration Error:', err);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 409) {
                setError('Bu e-mail adresi zaten kayıtlı. Giriş yapmayı deneyin.');
            } else {
                setError('Kayıt başarısız. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Header className="text-center">
                            <h2 className="mb-0">Hesap Oluştur</h2>
                            {isPreFilled && (
                                <small className="text-muted">
                                    Sipariş bilgileriniz otomatik olarak doldurulmuştur
                                </small>
                            )}
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ad *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                placeholder="Adınız"
                                                required
                                                disabled={isPreFilled} // Sipariş verirken girilen bilgi değiştirilemez
                                                className={isPreFilled ? 'bg-light' : ''}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Soyad *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                placeholder="Soyadınız"
                                                required
                                                disabled={isPreFilled} // Sipariş verirken girilen bilgi değiştirilemez
                                                className={isPreFilled ? 'bg-light' : ''}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>E-mail *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="ornek@email.com"
                                        required
                                        disabled={isPreFilled} // Sipariş verirken girilen bilgi değiştirilemez
                                        className={isPreFilled ? 'bg-light' : ''}
                                    />
                                    {isPreFilled && (
                                        <Form.Text className="text-muted">
                                            Sipariş sırasında girilen e-mail adresi
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Telefon *</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="5xxxxxxxxx"
                                        required
                                        disabled={isPreFilled} // Sipariş verirken girilen bilgi değiştirilemez
                                        className={isPreFilled ? 'bg-light' : ''}
                                    />
                                    {isPreFilled && (
                                        <Form.Text className="text-muted">
                                            Sipariş sırasında girilen telefon numarası
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Şifre *</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="En az 6 karakter"
                                        required
                                        minLength="6"
                                    />
                                    <Form.Text className="text-muted">
                                        Şifreniz en az 6 karakter olmalıdır
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Şifre Tekrar *</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        placeholder="Şifrenizi tekrar giriniz"
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-100"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" animation="border" className="me-2" />
                                            Hesap Oluşturuluyor...
                                        </>
                                    ) : (
                                        'Hesap Oluştur'
                                    )}
                                </Button>
                            </Form>

                            <hr className="my-4" />

                            <div className="text-center">
                                <p className="mb-0">
                                    Zaten hesabınız var mı?{' '}
                                    <Button
                                        variant="link"
                                        className="p-0"
                                        onClick={() => {
                                            // window.location.href = '/login';
                                            // veya React Router:
                                            // navigate('/login');
                                            console.log('Giriş sayfasına yönlendiriliyor...');
                                        }}
                                    >
                                        Giriş Yap
                                    </Button>
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RegistrationPage;