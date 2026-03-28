import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const MailQueryPageEN = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState('info');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:5000/mail/send-order-link',
                { email, lang: 'en' }
            );

            if (response.data.success) {
                setVariant('success');
                setMessage('Order link sent successfully! Please check your email.');
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 404) {
                    setVariant('warning');
                    setMessage('No orders found for this email address.');
                } else if (err.response.status === 400) {
                    setVariant('warning');
                    setMessage('Please enter a valid email address.');
                } else {
                    setVariant('danger');
                    setMessage('Server error. Please try again later.');
                }
            } else {
                setVariant('danger');
                setMessage('Network error. Please check your internet connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5" style={{ maxWidth: '500px' }}>
            <Card className="shadow-sm">
                <Card.Body>
                    <h3 className="mb-4 text-center text-danger">Request Order Link</h3>
                    <p className="text-muted text-center mb-4">
                        Enter your email address to receive a link to your order history
                    </p>

                    {message && <Alert variant={variant}>{message}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <Form.Text className="text-muted">
                                We'll send your order history link to this email
                            </Form.Text>
                        </Form.Group>

                        <Button
                            variant="danger"
                            type="submit"
                            className="w-100 py-2 fw-bold"
                            disabled={loading}
                        >
                            {loading ? (
                                <span>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Sending...
                                </span>
                            ) : (
                                'Send Order Link'
                            )}
                        </Button>
                        
                        <div className="mt-4 text-center">
                            <small className="text-muted">
                                Don't have an account? <a href="/signup" className="text-danger">Sign up</a>
                            </small>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
            
            <div className="mt-4 text-center">
                <Card className="border-0 bg-light">
                    <Card.Body>
                        <h5 className="text-danger">How It Works</h5>
                        <div className="d-flex justify-content-around mt-4">
                            <div className="text-center" style={{ width: '30%' }}>
                                <div className="bg-white rounded-circle p-3 mb-2 mx-auto shadow-sm" style={{ width: '60px', height: '60px' }}>
                                    <span className="fw-bold text-danger">1</span>
                                </div>
                                <p>Enter your email</p>
                            </div>
                            <div className="text-center" style={{ width: '30%' }}>
                                <div className="bg-white rounded-circle p-3 mb-2 mx-auto shadow-sm" style={{ width: '60px', height: '60px' }}>
                                    <span className="fw-bold text-danger">2</span>
                                </div>
                                <p>Receive order link</p>
                            </div>
                            <div className="text-center" style={{ width: '30%' }}>
                                <div className="bg-white rounded-circle p-3 mb-2 mx-auto shadow-sm" style={{ width: '60px', height: '60px' }}>
                                    <span className="fw-bold text-danger">3</span>
                                </div>
                                <p>View your orders</p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
};

export default MailQueryPageEN;