// src/pages/en/FormCompletion.jsx
import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const FormCompletion = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressDetail: '',
    city: '',
    district: '',
    postalCode: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = await res.json();

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        addressDetail: user.addresses?.[0]?.addressDetail || '',
        city: user.addresses?.[0]?.city || '',
        district: user.addresses?.[0]?.district || '',
        postalCode: user.addresses?.[0]?.postalCode || ''
      });
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check for required fields
    for (const [key, value] of Object.entries(formData)) {
      if (!value || value.trim() === '') {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }
    }

    const token = localStorage.getItem('token');
    const res = await fetch('/update-info', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      navigate('/en/cart'); // Redirect to cart after successful update
    } else {
      setError('Failed to update information.');
    }

    setLoading(false);
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Complete Your Information</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control name="firstName" value={formData.firstName} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control name="lastName" value={formData.lastName} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control name="phone" value={formData.phone} onChange={handleChange} placeholder="+905..." required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control name="addressDetail" value={formData.addressDetail} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>City</Form.Label>
          <Form.Control name="city" value={formData.city} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>District</Form.Label>
          <Form.Control name="district" value={formData.district} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Postal Code</Form.Label>
          <Form.Control name="postalCode" value={formData.postalCode} onChange={handleChange} maxLength="5" required />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </Form>
    </Container>
  );
};

export default FormCompletion;
