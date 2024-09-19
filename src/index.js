import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseProvider } from './context/firebase';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </React.StrictMode>
  </BrowserRouter>
);


