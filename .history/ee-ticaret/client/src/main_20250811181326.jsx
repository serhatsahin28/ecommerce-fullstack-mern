import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './i18n'; // i18n yapılandırmasını dahil et

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
