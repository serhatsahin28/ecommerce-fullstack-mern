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
                setMessage('Your one-time link is ready! Check your email to access your order details.');
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
                    setMessage('A server error occurred. Please try again.');
                }
            } else {
                setVariant('danger');
                setMessage('Cannot reach the server. Please check your internet connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5" style={{ maxWidth: '500px' }}>
            <Card className="shadow-sm">
                <Card.Body>
                    <h3 className="mb-4 text-center">Order Query</h3>

                    {message && <Alert variant={variant}>{message}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="example@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        
                        </Form.Group>

                        <Button
                            variant="danger"
                            type="submit"
                            className="w-100"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span 
                                        className="spinner-border spinner-border-sm me-2" 
                                        role="status" 
                                        aria-hidden="true"
                                    ></span>
                                    Processing...
                                </>
                            ) : (
                                'Query Order'
                            )}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            
         
        </Container>
    );
};

export default MailQueryPageEN;