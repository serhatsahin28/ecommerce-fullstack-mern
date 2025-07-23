// components/admin/NotificationAlert.jsx
import React from 'react';
import { Alert } from 'react-bootstrap';

const NotificationAlert = ({ notification }) => {
  if (!notification) return null;

  return (
    <Alert 
      variant={notification.type || 'warning'} 
      style={{ position: 'fixed', top: 20, right: 20, zIndex: 1050 }}
    >
      {typeof notification === 'string' ? notification : notification.message}
    </Alert>
  );
};

export default NotificationAlert;