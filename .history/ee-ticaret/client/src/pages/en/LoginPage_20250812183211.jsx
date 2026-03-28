import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate,useLocation } from 'react-router-dom';
import axios from 'axios';

  const location = useLocation();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/tr');
    }
  }, [navigate]);


const LoginPageEn = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { email, password } = formData;

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password
      });

      localStorage.setItem('token', response.data.token);

      setSuccess('Login successful');

      // 1.5 saniye sonra yönlendir
      setTimeout(() => {
        navigate('/en');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">Login</h3>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>

            <Button type="submit" variant="danger" className="w-100" disabled={loading}>
              {loading ? 'Loading...' : 'Log In'}
            </Button>
          </Form>

          <div className="mt-3 text-center">
            <small>
              Don't have an account? <Link to="/en/register">Register here</Link>
            </small>
          </div>

                    <div className="text-center mt-2">
                      <Link to="/en/mailQuery" className="text-decoration-none text-primary">
                        View my orders 
                      </Link>
                    </div>


        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPageEn;
