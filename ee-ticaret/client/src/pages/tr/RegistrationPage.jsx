import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


//Ödeme sonrası kayıt sayfası
 
const RegistrationPage = () => {
    const navigate = useNavigate();
    
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
    const [redirectMessage, setRedirectMessage] = useState('');
    const [isPreFilled, setIsPreFilled] = useState(false);

    // Hata mesajları çeviri haritası
    const errorTranslations = {
        // Genel hata mesajları
        'User already exists': 'Bu kullanıcı zaten kayıtlı.',
        'Email already exists': 'Bu e-mail adresi zaten kayıtlı.',
        'Phone already exists': 'Bu telefon numarası zaten kayıtlı.',
        'User with this email already exists': 'Bu e-mail adresi ile kayıtlı kullanıcı zaten mevcut.',
        'Invalid email format': 'Geçersiz e-mail formatı.',
        'Password too short': 'Şifre çok kısa.',
        'Required field missing': 'Zorunlu alan eksik.',
        'Registration failed': 'Kayıt başarısız.',
        'Database error': 'Veritabanı hatası oluştu.',
        'Server error': 'Sunucu hatası oluştu.',
        'Network error': 'Ağ bağlantı hatası.',
        'Validation error': 'Doğrulama hatası.',
        'Invalid phone number': 'Geçersiz telefon numarası.',
        'Password mismatch': 'Şifreler eşleşmiyor.',
        'Duplicate entry': 'Bu bilgiler zaten kayıtlı.',
        'Conflict': 'Bu bilgiler zaten kullanımda.',
        // Daha spesifik hatalar
        'First name is required': 'Ad alanı zorunludur.',
        'Last name is required': 'Soyad alanı zorunludur.',
        'Email is required': 'E-mail alanı zorunludur.',
        'Phone is required': 'Telefon numarası zorunludur.',
        'Password is required': 'Şifre alanı zorunludur.',
        'Invalid credentials': 'Geçersiz giriş bilgileri.',
        'Account not found': 'Hesap bulunamadı.',
        'Internal server error': 'Sunucu iç hatası.',
        'Bad request': 'Hatalı istek.',
        'Unauthorized': 'Yetkisiz erişim.',
        'Forbidden': 'Erişim yasak.',
        'Not found': 'Bulunamadı.',
        'Too many requests': 'Çok fazla istek.',
        'Service unavailable': 'Hizmet kullanılamıyor.',
        // Yaygın backend mesajları
        'already exists': 'zaten kayıtlı',
        'duplicate': 'tekrar eden kayıt',
        'constraint': 'kısıtlama hatası',
        'unique': 'benzersiz olmalı'
    };

    // Hata mesajını Türkçe'ye çevir
    const translateError = (errorMessage) => {
        if (!errorMessage) return '';
        
        // Tam eşleşme ara
        if (errorTranslations[errorMessage]) {
            return errorTranslations[errorMessage];
        }
        
        // Kısmi eşleşme ara (contains kontrolü)
        for (const [englishError, turkishError] of Object.entries(errorTranslations)) {
            if (errorMessage.toLowerCase().includes(englishError.toLowerCase())) {
                return turkishError;
            }
        }
        
        // Eğer çeviri bulunamazsa orijinal mesajı döndür
        return errorMessage;
    };

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
        setRedirectMessage('');

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
            const response = await axios.post('http://${import.meta.env.VITE_API_URL}/register', registrationData);

            console.log('📥 Registration Response:', response.data);

            if (response.data.success) {
                setSuccess('Hesabınız başarıyla oluşturuldu!');

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

                // 2 saniye sonra yönlendirme mesajı göster
                setTimeout(() => {
                    setRedirectMessage('Giriş sayfasına yönlendiriliyorsunuz...');
                }, 2000);

                // 3 saniye sonra giriş sayfasına yönlendir
                setTimeout(() => {
                    navigate('/tr/login');
                    console.log('Giriş sayfasına yönlendiriliyor...');
                }, 3000);

            } else {
                // Backend'den gelen hata mesajını Türkçe'ye çevir
                const translatedError = translateError(response.data.message);
                setError(translatedError || 'Kayıt başarısız. Lütfen tekrar deneyin.');
            }
        } catch (err) {
            console.error('Registration Error:', err);
            
            // Tam error detaylarını logla
            if (err.response) {
                console.log('Response Status:', err.response.status);
                console.log('Response Data:', err.response.data);
                console.log('Response Headers:', err.response.headers);
            }

            let errorMessage = '';

            // 409 hatası - Bu e-mail zaten kayıtlı
            if (err.response?.status === 409) {
                errorMessage = 'Bu e-mail adresi zaten kayıtlı.';
                
                // 2 saniye sonra yönlendirme mesajı göster
                setTimeout(() => {
                    setRedirectMessage('Giriş sayfasına yönlendiriliyorsunuz...');
                }, 2000);
                
                // 3 saniye sonra giriş sayfasına yönlendir
                setTimeout(() => {
                    navigate('/tr/login');
                    console.log('Giriş sayfasına yönlendiriliyor...');
                }, 3000);
            }
            // Backend'den mesaj varsa çevir
            else if (err.response?.data?.message) {
                errorMessage = translateError(err.response.data.message);
            }
            else if (err.response?.data?.error) {
                errorMessage = translateError(err.response.data.error);
            }
            // Diğer status kodları
            else if (err.response?.status === 400) {
                errorMessage = 'Girilen bilgilerde hata var. Lütfen kontrol ediniz.';
            }
            else if (err.response?.status === 422) {
                errorMessage = 'Form verileri geçersiz. Lütfen tüm alanları doğru doldurun.';
            }
            else if (err.response?.status === 500) {
                errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
            }
            // Ağ hatası
            else if (err.code === 'ERR_NETWORK' || !err.response) {
                errorMessage = 'İnternet bağlantınızı kontrol ediniz.';
            }
            // Genel hata
            else {
                errorMessage = 'Kayıt işlemi başarısız. Lütfen tekrar deneyin.';
            }

            console.log('Gösterilecek hata mesajı:', errorMessage);
            setError(errorMessage);
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
                            {redirectMessage && <Alert variant="info">{redirectMessage}</Alert>}
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
                                                disabled={isPreFilled}
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
                                                disabled={isPreFilled}
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
                                        disabled={isPreFilled}
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
                                        disabled={isPreFilled}
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
                                            navigate('/tr/login');
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