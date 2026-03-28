import React, { useState, useEffect } from 'react';
import {
  Container, Card, Form, Button, Row, Col,
  Modal, Badge, ListGroup, Tab, Tabs, Alert
} from 'react-bootstrap';
import axios from 'axios';

const ProfileEN = () => {
  const [user, setUser] = useState({
    ad: '',
    soyad: '',
    email: '',
    password: '',
    telefon: '',
    adresler: [],
    odeme_yontemleri: [],
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newAddress, setNewAddress] = useState({
    adres_ismi: '', adres_detay: '', sehir: '',
    ilce: '', posta_kodu: '', varsayilan: false
  });

  const [newPayment, setNewPayment] = useState({
    kart_tipi: 'Visa', kart_numarasi: '', kart_ismi: '',
    son_kullanma: '', cvv: '', varsayilan: false
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login first.');
          return;
        }
        const response = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser({
          ...response.data,
          password: '' // Keep password field empty for security
        });
      } catch (err) {
        console.error('Failed to fetch profile data:', err.response || err);
        setError('An error occurred while loading profile information.');
      }
    };
    fetchUserData();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPayment(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // 1. Update basic profile information
  const updateProfile = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        ad: user.ad, soyad: user.soyad,
        email: user.email, telefon: user.telefon,
      };

      if (user.password && user.password.trim() !== '') {
        updateData.password = user.password;
      }

      await axios.put('http://localhost:5000/profile/update', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(prev => ({ ...prev, password: '' }));
      setSuccess('Profile information updated successfully.');
    } catch (err) {
      console.error('Profile update error:', err.response || err);
      setError(err.response?.data?.message || 'An error occurred during update.');
    }
  };

  // 2. Add new address
  const addAddress = async () => {
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/address/add', newAddress, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state
      setUser(prev => ({
        ...prev,
        adresler: newAddress.varsayilan
          ? prev.adresler.map(addr => ({ ...addr, varsayilan: false })).concat(response.data.address)
          : [...prev.adresler, response.data.address]
      }));

      setShowAddressModal(false);
      setNewAddress({ adres_ismi: '', adres_detay: '', sehir: '', ilce: '', posta_kodu: '', varsayilan: false });
      setSuccess('Address added successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add address.');
    }
  };

  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    setNewAddress({ ...address });
    setShowEditAddressModal(true);
  };

  // 3. Update existing address
  const updateAddress = async () => {
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const addressId = selectedAddress.id || selectedAddress._id;
      const response = await axios.put(
        `http://localhost:5000/address/update/${addressId}`,
        newAddress,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(prev => {
        // If updated address is default, make others false
        const updatedAdresler = newAddress.varsayilan
          ? prev.adresler.map(addr => ({ ...addr, varsayilan: addr.id === addressId }))
          : prev.adresler;

        return {
          ...prev,
          adresler: updatedAdresler.map(addr =>
            (addr.id === addressId || addr._id === addressId) ? response.data.address : addr
          )
        }
      });

      setShowEditAddressModal(false);
      setSuccess('Address updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while updating address');
    }
  };

  // 4. Delete address
  const deleteAddress = async (addressToDelete) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const addressId = addressToDelete.id || addressToDelete._id;
      await axios.delete(`http://localhost:5000/address/delete/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({
        ...prev,
        adresler: prev.adresler.filter(a => (a.id || a._id) !== addressId)
      }));
      setSuccess('Address deleted successfully');
    } catch (err) {
      setError('Error occurred while deleting address');
    }
  };

  // 5. Add payment method
  const addPaymentMethod = async () => {
    clearMessages();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/payment/add', newPayment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({
        ...prev,
        odeme_yontemleri: [...prev.odeme_yontemleri, response.data.payment]
      }));
      setShowPaymentModal(false);
      setNewPayment({ kart_tipi: 'Visa', kart_numarasi: '', kart_ismi: '', son_kullanma: '', cvv: '', varsayilan: false });
      setSuccess('Payment method added successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment method.');
    }
  };

  // 6. Delete payment method
  const deletePaymentMethod = async (paymentToDelete) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    clearMessages();

    try {
      const token = localStorage.getItem('token');

      // Safely get the ID
      const paymentId = paymentToDelete.id ||
        paymentToDelete._id ||
        (paymentToDelete._id ? paymentToDelete._id.toString() : null);

      if (!paymentId) {
        throw new Error('Payment method ID not found');
      }

      await axios.delete(`http://localhost:5000/payment/delete/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(prev => ({
        ...prev,
        odeme_yontemleri: prev.odeme_yontemleri.filter(p => {
          const pId = p.id || p._id || (p._id ? p._id.toString() : null);
          return pId !== paymentId;
        })
      }));

      setSuccess('Payment method deleted successfully.');
    } catch (err) {
      console.error('Card deletion error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete payment method.');
    }
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-gradient">My Profile</h1>
        <p className="text-muted">Manage your personal information and preferences</p>
      </div>

      {error && <Alert variant="danger" onClose={clearMessages} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={clearMessages} dismissible>{success}</Alert>}

      <Tabs defaultActiveKey="profile" id="profile-tabs" className="mb-4 custom-tabs">

        {/* === Profile Information Tab === */}
        <Tab eventKey="profile" title="Profile Information">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h4 className="mb-4 text-danger">Personal Information</h4>
              <Form onSubmit={updateProfile}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control type="text" name="ad" value={user.ad} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control type="text" name="soyad" value={user.soyad} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" name="email" value={user.email} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control type="tel" name="telefon" value={user.telefon} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control type="password" name="password" value={user.password} onChange={handleChange} placeholder="Leave blank if you don't want to change" />
                </Form.Group>
                <Button variant="danger" type="submit" className="w-100 py-2 fw-bold">Update Information</Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        {/* === My Addresses Tab === */}
        <Tab eventKey="address" title="My Addresses">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-danger mb-0">My Addresses</h4>
                <Button variant="danger" onClick={() => setShowAddressModal(true)}>
                  <i className="fas fa-plus me-2"></i> Add New Address
                </Button>
              </div>
              {user.adresler.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                  <h5>No saved addresses found</h5>
                  <p className="text-muted">Click the button to add a new address</p>
                </div>
              ) : (
                <Row>
                  {user.adresler.map((address) => (
                    <Col md={6} className="mb-4" key={address.id || address._id}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
                          <span>{address.adres_ismi}</span>
                          {address.varsayilan && <Badge bg="light" text="dark">Default</Badge>}
                        </Card.Header>
                        <Card.Body>
                          <ListGroup variant="flush">
                            <ListGroup.Item><b>Address:</b> {address.adres_detay}</ListGroup.Item>
                            <ListGroup.Item><b>District/City:</b> {address.ilce} / {address.sehir}</ListGroup.Item>
                            <ListGroup.Item><b>Postal Code:</b> {address.posta_kodu}</ListGroup.Item>
                          </ListGroup>
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-end bg-light">
                          <Button variant="outline-danger" size="sm" className="me-2" onClick={() => handleEditAddress(address)}>
                            <i className="fas fa-edit me-1"></i> Edit
                          </Button>
                          <Button variant="outline-secondary" size="sm" onClick={() => deleteAddress(address)}>
                            <i className="fas fa-trash me-1"></i> Delete
                          </Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* === Payment Methods Tab === */}
        <Tab eventKey="payment" title="Payment Methods">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-danger mb-0">My Saved Cards</h4>
                <Button variant="danger" onClick={() => setShowPaymentModal(true)}>
                  <i className="fas fa-plus me-2"></i> Add New Card
                </Button>
              </div>

              {user.odeme_yontemleri.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-credit-card fa-3x text-muted mb-3"></i>
                  <h5>No saved payment methods found</h5>
                  <p className="text-muted">Click the button to add a new card</p>
                </div>
              ) : (
                <Row>
                  {user.odeme_yontemleri.map((card, index) => {
                    const cardId = card.id || card._id || `card-${index}`;
                    return (
                      <Col md={6} key={cardId} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm">
                          <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
                            <div>
                              <i className={`fab fa-cc-${(card.kart_tipi || '').toLowerCase()} fa-2x me-2`}></i>
                              <span className="fw-bold">{card.kart_ismi || 'Unnamed Card'}</span>
                            </div>
                            {card.varsayilan && <Badge bg="light" text="dark">Default</Badge>}
                            {!cardId && <Badge bg="warning" text="dark">Invalid ID</Badge>}
                          </Card.Header>

                          <Card.Body>
                            <ListGroup variant="flush">
                              <ListGroup.Item>
                                <b>Card Number:</b> {card.masked_number || 'No information'}
                              </ListGroup.Item>
                            </ListGroup>
                          </Card.Body>

                          <Card.Footer className="d-flex justify-content-end bg-light">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => deletePaymentMethod(card)}
                              disabled={!cardId || cardId.includes('invalid')}
                            >
                              <i className="fas fa-trash me-1"></i> Delete
                            </Button>
                          </Card.Footer>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* === Address Modals === */}
      {/* Add New Address Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} size="lg">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Add New Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Address Name</Form.Label>
              <Form.Control type="text" name="adres_ismi" value={newAddress.adres_ismi} onChange={handleAddressChange} required placeholder="e.g., Home Address" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address Details</Form.Label>
              <Form.Control as="textarea" rows={3} name="adres_detay" value={newAddress.adres_detay} onChange={handleAddressChange} required placeholder="Street, avenue, number, apartment..." />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control type="text" name="sehir" value={newAddress.sehir} onChange={handleAddressChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>District</Form.Label>
                  <Form.Control type="text" name="ilce" value={newAddress.ilce} onChange={handleAddressChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control type="text" name="posta_kodu" value={newAddress.posta_kodu} onChange={handleAddressChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mt-4">
                  <Form.Check type="checkbox" name="varsayilan" checked={newAddress.varsayilan} onChange={handleAddressChange} label="Set as default address" />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={addAddress}>Save Address</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Address Modal */}
      <Modal show={showEditAddressModal} onHide={() => setShowEditAddressModal(false)} size="lg">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Edit Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Address Name</Form.Label>
              <Form.Control type="text" name="adres_ismi" value={newAddress.adres_ismi} onChange={handleAddressChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address Details</Form.Label>
              <Form.Control as="textarea" rows={3} name="adres_detay" value={newAddress.adres_detay} onChange={handleAddressChange} required />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control type="text" name="sehir" value={newAddress.sehir} onChange={handleAddressChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>District</Form.Label>
                  <Form.Control type="text" name="ilce" value={newAddress.ilce} onChange={handleAddressChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control type="text" name="posta_kodu" value={newAddress.posta_kodu} onChange={handleAddressChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mt-4">
                  <Form.Check type="checkbox" name="varsayilan" checked={newAddress.varsayilan} onChange={handleAddressChange} label="Set as default address" />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditAddressModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={updateAddress}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* === NEW PAYMENT METHOD MODAL === */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} size="lg">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Add New Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Cardholder Name</Form.Label>
              <Form.Control type="text" name="kart_ismi" value={newPayment.kart_ismi} onChange={handlePaymentChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Card Number</Form.Label>
              <Form.Control type="text" name="kart_numarasi" value={newPayment.kart_numarasi} onChange={handlePaymentChange} required placeholder="**** **** **** ****" />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiration Date</Form.Label>
                  <Form.Control
                    type="text"
                    name="son_kullanma"
                    value={newPayment.son_kullanma}
                    onChange={(e) => {
                      // Auto formatting: MM/YY
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                      }
                      setNewPayment({ ...newPayment, son_kullanma: value });
                    }}
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>CVV</Form.Label>
                  <Form.Control type="text" name="cvv" value={newPayment.cvv} onChange={handlePaymentChange} required />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select name="kart_tipi" value={newPayment.kart_tipi} onChange={handlePaymentChange}>
                    <option>Visa</option>
                    <option>Mastercard</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mt-2">
              <Form.Check type="checkbox" name="varsayilan" checked={newPayment.varsayilan} onChange={handlePaymentChange} label="Set as default payment method" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={addPaymentMethod}>Save Card</Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .text-gradient {
          background: linear-gradient(to right, #dc3545, #6c757d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

    </Container>
  );
};

export default ProfileEN;