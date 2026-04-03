import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your_google_client_id'}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
