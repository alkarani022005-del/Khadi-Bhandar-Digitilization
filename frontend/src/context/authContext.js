import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('token'));
  const [cart, setCart]       = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) { fetchProfile(); fetchCart(); fetchWishlist(); }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/api/auth/profile');
      setUser(data);
    } catch { logout(); }
  };

  const fetchCart = async () => {
    try {
      const { data } = await API.get('/api/products/cart/items');
      setCart(data);
    } catch {}
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get('/api/wishlist');
      setWishlist(data);
    } catch {}
  };

  const register = async (name, email, phone, role = 'customer') => {
    setLoading(true);
    try {
      await API.post('/api/auth/register', { name, email, phone, role });
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message };
    }
  };

  const sendOtp = async (email) => {
    setLoading(true);
    try {
      await API.post('/api/auth/send-otp', { email });
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message };
    }
  };

  const verifyOtp = async (email, otp) => {
    setLoading(true);
    try {
      const { data } = await API.post('/api/auth/verify-otp', { email, otp });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      await fetchCart();
      await fetchWishlist();
      setLoading(false);
      return { success: true, role: data.user.role };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCart([]);
    setWishlist([]);
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await API.post('/api/products/cart/add', { productId, quantity });
      setCart(data);
      return { success: true };
    } catch { return { success: false }; }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const { data } = await API.put(`/api/products/cart/update/${productId}`, { quantity });
      setCart(data);
    } catch {}
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await API.delete(`/api/products/cart/remove/${productId}`);
      setCart(data);
    } catch {}
  };

  const toggleWishlist = async (productId) => {
    try {
      const { data } = await API.post('/api/wishlist/toggle', { productId });
      await fetchWishlist();
      return data;
    } catch { return { success: false }; }
  };

  const isInWishlist = (productId) => wishlist.some(p => p._id === productId);


  const loginWithToken = (token, userData) => {
  localStorage.setItem('token', token);
  setToken(token);
  setUser(userData);
  fetchCart();
  fetchWishlist();
};


  return (
  <AuthContext.Provider value={{
    user, token, cart, wishlist, loading,
    register, sendOtp, verifyOtp, logout,
    addToCart, updateCartItem, removeFromCart, fetchCart,
    toggleWishlist, isInWishlist, fetchWishlist,
    loginWithToken, // ← add this
  }}>
    {children}
  </AuthContext.Provider>
);
};

export const useAuth = () => useContext(AuthContext);