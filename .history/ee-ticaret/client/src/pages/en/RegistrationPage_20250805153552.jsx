import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Post-payment registration page

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

    // Error message translation map (Bu kısım aynı kalabilir, backend hatalarını çeviriyor)
    const errorTranslations = {
        'User already exists': 'This user already exists.',
        'Email already exists': 'This email is already registered.',
        // ... (diğer çeviriler)
    };

    const translateError = (errorMessage) => {
        // ... (bu fonksiyon aynı kalabilir)
        if (!errorMessage) return '';
        if (errorTranslations[errorMessage]) {
            return errorTranslations[errorMessage];
        }
        for (const [englishError, turkishError] of Object.entries(errorTranslations)) {
            if (errorMessage.toLowerCase().includes(englishError.toLowerCase())) {
                return turkishError;
            }
        }
        return errorMessage;
    };

    useEffect(() => {
        const storedRegistrationInfo = localStorage.getItem('registrationInfo');
        if (storedRegistrationInfo) {
            const guestInfo = JSON.parse(storedRegistrationInfo);

            // *** BAŞLANGIÇ: ANA DÜZELTME ALANI ***
            // `localStorage`'dan gelen İngilizce anahtarlar kullanılıyor
            setFormData(prev => ({
                ...prev,
                first_name: guestInfo.firstName || '', // 'ad' yerine 'firstName'
                last_name: guestInfo.lastName || '',   // 'soyad' yerine 'lastName'
                email: guestInfo.email || '',
                phone: guestInfo.phone || ''          // 'telefon' yerine 'phone'
            }));
            // *** BİTİŞ: ANA DÜZELTME ALANI ***

            setIsPreFilled(true);
            console.log('🔍 Registration Info loaded:', guestInfo);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.first_name.trim()) {
            setError('First name is required.');
            return false;
        }
        if (!formData.last_name.trim()) {
            setError('Last name is required.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            setError('Email is required.');
            return false;
        }
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return false;
        }
        if (!formData.phone.trim()) {
            setError('Phone number is required.');
            return false;
        }
        if (!formData.password) {
            setError('Password is required.');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return false;
        }
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        // Bu fonksiyonun geri kalanında bir değişiklik yapmaya gerek yok.
        // Kodun tamamını aşağıda sunuyorum.
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        setRedirectMessage('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

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
                setSuccess('Your account has been successfully created!');

                localStorage.removeItem('registrationInfo');
                localStorage.removeItem('cart');
                localStorage.removeItem('guestInfo');

                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirm_password: ''
                });

                setTimeout(() => {
                    setRedirectMessage('Redirecting to the login page...');
                }, 2000);

                setTimeout(() => {
                    navigate('/en/login');
                    console.log('Redirecting to login page...');
                }, 3000);

            } else {
                const translatedError = translateError(response.data.message);
                setError(translatedError || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration Error:', err);
            
            let errorMessage = '';

            if (err.response?.status === 409) {
                errorMessage = 'This email is already registered.';
                setTimeout(() => {
                    setRedirectMessage('Redirecting to the login page...');
                }, 2000);
                setTimeout(() => {
                    navigate('/en/login');
                    console.log('Redirecting to login page...');
                }, 3000);
            }
            else if (err.response?.data?.message) {
                errorMessage = translateError(err.response.data.message);
            }
            else if (err.response?.data?.error) {
                errorMessage = translateError(err.response.data.error);
            }
            else {
                errorMessage = 'Registration failed. Please try again.';
            }

            console.log('Displayed error message:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // JSX kısmı (değişiklik yok)
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Header className="text-center">
                            <h2 className="mb-0">Create Account</h2>
                            {isPreFilled && (
                                <small className="text-muted">
                                    Your order information has been pre-filled
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
                                            <Form.Label>First Name *</Form.Label>
                                            <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Your first name" required disabled={isPreFilled} className={isPreFilled ? 'bg-light' : ''}/>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Last Name *</Form.Label>
                                            <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Your last name" required disabled={isPreFilled} className={isPreFilled ? 'bg-light' : ''}/>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" required disabled={isPreFilled} className={isPreFilled ? 'bg-light' : ''}/>
                                    {isPreFilled && (<Form.Text className="text-muted">Email address entered during the order</Form.Text>)}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Phone *</Form.Label>
                                    <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="5xxxxxxxxx" required disabled={isPreFilled} className={isPreFilled ? 'bg-light' : ''}/>
                                    {isPreFilled && (<Form.Text className="text-muted">Phone number entered during the order</Form.Text>)}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password *</Form.Label>
                                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" required minLength="6"/>
                                    <Form.Text className="text-muted">Your password must be at least 6 characters</Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Confirm Password *</Form.Label>
                                    <Form.Control type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Re-enter your password" required/>
                                </Form.Group>

                                <Button type="submit" variant="primary" size="lg" className="w-100" disabled={loading}>
                                    {loading ? (<><Spinner size="sm" animation="border" className="me-2" />Creating Account...</>) : ('Create Account')}
                                </Button>
                            </Form>

                            <hr className="my-4" />

                            <div className="text-center">
                                <p className="mb-0">Already have an account?{' '}<Button variant="link" className="p-0" onClick={() => {navigate('/en/login');}}>Login</Button></p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RegistrationPage;