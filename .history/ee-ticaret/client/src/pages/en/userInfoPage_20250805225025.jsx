import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Modal, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const UserInfoPageEn = () => {
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    adres_ismi: '',
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Get token from localStorage.
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserAddress = async () => {
      // If there is no token, no need to fetch.
      if (!token) {
        setLoading(false);
        console.log("User not logged in.");
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch address information');
        
        const user = await res.json();
        
        // Get user's addresses
        if (user.adresler && user.adresler.length > 0) {
          setAddresses(user.adresler);
          setSelectedAddress(user.adresler[0]); // Select the first address by default
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAddress();
  }, [token]);

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error message
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // New address validation
  const validateNewAddress = () => {
    const errors = {};
    
    if (!newAddress.adres_ismi.trim()) {
      errors.adres_ismi = 'Address nickname cannot be empty';
    }
    if (!newAddress.adres_detay.trim()) {
      errors.adres_detay = 'Address details cannot be empty';
    }
    if (!newAddress.sehir.trim()) {
      errors.sehir = 'City cannot be empty';
    }
    if (!newAddress.ilce.trim()) {
      errors.ilce = 'District / Town cannot be empty';
    }
    if (!newAddress.posta_kodu.trim()) {
      errors.posta_kodu = 'Postal code cannot be empty';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save new address
  const saveNewAddress = async () => {
    if (!validateNewAddress()) {
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/profile/add-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add address');
      }

      const result = await res.json();
      
      // Add the new address to the list
      setAddresses(prev => [...prev, result.address]);
      
      // Close the modal and clear the form
      setShowAddModal(false);
      setNewAddress({
        adres_ismi: '',
        adres_detay: '',
        sehir: '',
        ilce: '',
        posta_kodu: ''
      });
      setValidationErrors({});
      
      alert('New address added successfully!');
    } catch (err) {
      console.error(err);
      alert(`An error occurred: ${err.message}`);
    }
  };

  // Select an address
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  // When continue button is clicked
  const handleContinue = () => {
    if (selectedAddress) {
      // Save selected address to localStorage
      localStorage.setItem('userAddress', JSON.stringify(selectedAddress));
      navigate('/en/pay');
    } else {
      alert('Please select an address or add a new one.');
    }
  };

  // Open the add new address modal
  const handleAddNewAddress = () => {
    setShowAddModal(true);
  };

  // Close the new address modal
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewAddress({
      adres_ismi: '',
      adres_detay: '',
      sehir: '',
      ilce: '',
      posta_kodu: ''
    });
    setValidationErrors({});
  };

  // Continue without saving
  const handleContinueWithoutSaving = () => {
    if (!validateNewAddress()) {
      alert('Please fill in all fields.');
      return;
    }
    
    setShowAddModal(false);
    localStorage.setItem('userAddress', JSON.stringify(newAddress));
    navigate('/en/pay');
  };

  // Show spinner while data is loading
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Your Address Information</h1>
      
      {/* Existing Addresses */}
      {addresses.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-3">Your Saved Addresses</h5>
          <Row>
            {addresses.map((address, index) => (
              <Col md={6} key={index} className="mb-3">
                <Card 
                  className={`cursor-pointer ${selectedAddress === address ? 'border-primary' : ''}`}
                  onClick={() => handleAddressSelect(address)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body>
                    <Card.Title>{address.adres_ismi || `Address ${index + 1}`}</Card.Title>
                    <Card.Text>
                      <strong>Address:</strong> {address.adres_detay}<br />
                      <strong>City:</strong> {address.sehir}<br />
                      <strong>District / Town:</strong> {address.ilce}<br />
                      <strong>Postal Code:</strong> {address.posta_kodu}
                    </Card.Text>
                    {selectedAddress === address && (
                      <div className="text-primary">
                        <small>✓ Selected</small>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Add Address Button */}
      <div className="mb-4">
        <Button variant="outline-primary" onClick={handleAddNewAddress}>
          + Add New Address
        </Button>
      </div>

      {/* Continue Button */}
      {addresses.length === 0 ? (
        <div className="text-center">
          <p className="text-muted mb-3">You don't have any saved addresses yet.</p>
          <p className="text-muted">Please add a new address to continue.</p>
        </div>
      ) : (
        <Button 
          variant="primary" 
          onClick={handleContinue}
          disabled={!selectedAddress}
          size="lg"
        >
          Continue
        </Button>
      )}

      {/* Add New Address Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Address Nickname *</Form.Label>
                  <Form.Control
                    type="text"
                    name="adres_ismi"
                    value={newAddress.adres_ismi}
                    onChange={handleNewAddressChange}
                    placeholder="E.g., Home Address, Work Address"
                    isInvalid={!!validationErrors.adres_ismi}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.adres_ismi}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Address Details *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="adres_detay"
                    value={newAddress.adres_detay}
                    onChange={handleNewAddressChange}
                    placeholder="Street, apartment, door number, etc."
                    isInvalid={!!validationErrors.adres_detay}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.adres_detay}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>City *</Form.Label>
                  <Form.Control
                    type="text"
                    name="sehir"
                    value={newAddress.sehir}
                    onChange={handleNewAddressChange}
                    placeholder="E.g., New York"
                    isInvalid={!!validationErrors.sehir}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.sehir}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>District / Town *</Form.Label>
                  <Form.Control
                    type="text"
                    name="ilce"
                    value={newAddress.ilce}
                    onChange={handleNewAddressChange}
                    placeholder="E.g., Manhattan"
                    isInvalid={!!validationErrors.ilce}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.ilce}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Postal Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="posta_kodu"
                    value={newAddress.posta_kodu}
                    onChange={handleNewAddressChange}
                    placeholder="E.g., 10001"
                    isInvalid={!!validationErrors.posta_kodu}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.posta_kodu}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleContinueWithoutSaving}>
            Continue Without Saving
          </Button>
          <Button variant="primary" onClick={saveNewAddress}>
            Save and Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserInfoPageEn;