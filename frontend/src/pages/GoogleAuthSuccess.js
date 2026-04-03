import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { toast } from 'react-toastify';

const GoogleAuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const user  = params.get('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        loginWithToken(token, parsedUser);
        toast.success(`Welcome, ${parsedUser.name}! 🎉`);

        if (parsedUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (parsedUser.role === 'seller') {
          // If seller has not filled shop details yet → go to setup
          const hasShop = parsedUser.sellerInfo?.shopName;
          if (!hasShop) navigate('/seller/setup');
          else          navigate('/seller/dashboard');
        } else {
          navigate('/');
        }
      } catch {
        toast.error('Google login failed. Please try again.');
        navigate('/login');
      }
    } else {
      toast.error('Google login failed');
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fce4ec' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 18, color: '#555' }}>Completing Google Sign In...</div>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;