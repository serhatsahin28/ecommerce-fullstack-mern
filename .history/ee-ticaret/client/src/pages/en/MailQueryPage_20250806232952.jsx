import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const MailQueryPageEN = () => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language; // örn: 'en'

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState('info');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            console.log("currentLang", currentLang);
            const response = await axios.post(
                'http://localhost:5000/mail/send-order-link',
                { email, lang: currentLang }
            );

            if (response.data.success) {
                setVariant('success');
                setMessage(t('mail.success'));
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 404) {
                    setVariant('warning');
                    setMessage(t('mail.notFound'));
                } else if (err.response.status === 400) {
                    setVariant('warning');
                    setMessage(t('mail.invalidEmail'));
                } else {
                    setVariant('danger');
                    setMessage(t('mail.serverError'));
                }
            } else {
                setVariant('danger');
                setMessage(t('mail.noConnection'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5" style={{ maxWidth: '500px' }}>
            <Card className="shadow-sm">
                <Card.Body>
                    <h3 className="mb-4 text-center">{t('mail.title')}</h3>

                    {message && <Alert variant={variant}>{message}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('mail.emailLabel')}</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder={t('mail.emailPlaceholder')}
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
                            {loading ? t('mail.loading') : t('mail.submit')}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default MailQueryPageEN;
