import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ERPProvider } from './context/ERPContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ERPProvider>
        <App />
      </ERPProvider>
    </BrowserRouter>
  </React.StrictMode>
);
