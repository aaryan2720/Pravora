'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedRestaurant = localStorage.getItem('restaurant');
      
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          if (storedRestaurant) {
            setActiveRestaurant(JSON.parse(storedRestaurant));
          }
        } catch (e) {
          console.error('Error parsing stored auth state:', e);
        }
      }
      
      // Load active guest session if any
      const storedSession = localStorage.getItem('activeSession');
      if (storedSession) {
        try {
          setActiveSession(JSON.parse(storedSession));
        } catch (e) {}
      }
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback((item, qty = 1, note = '') => {
    setCart(prev => {
      const existing = prev.find(c => c.itemId === item.id || c.itemId === item._id);
      const itemId = item.id || item._id;
      if (existing) {
        return prev.map(c => c.itemId === itemId ? { ...c, qty: c.qty + qty } : c);
      }
      return [...prev, { itemId, name: item.name, price: item.price, qty, note, isVeg: item.isVeg }];
    });
  }, []);

  const updateCartQty = useCallback((itemId, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.itemId !== itemId));
    } else {
      setCart(prev => prev.map(c => c.itemId === itemId ? { ...c, qty } : c));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  const signOut = useCallback(() => {
    api.auth.logout();
    setUser(null);
    setActiveRestaurant(null);
    setCart([]);
    setActiveSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('restaurant');
      localStorage.removeItem('activeSession');
    }
  }, []);

  const signIn = useCallback((userData, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      if (userData.restaurantId) {
        // Fetch full restaurant details if they belong to one
        api.restaurant.getById(userData.restaurantId)
          .then(data => {
            if (data.success) {
              localStorage.setItem('restaurant', JSON.stringify(data.restaurant));
              setActiveRestaurant(data.restaurant);
            }
          })
          .catch(console.error);
      }
    }
  }, []);

  const saveActiveSession = useCallback((session) => {
    setActiveSession(session);
    if (typeof window !== 'undefined') {
      if (session) {
        localStorage.setItem('activeSession', JSON.stringify(session));
      } else {
        localStorage.removeItem('activeSession');
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser, signIn, signOut,
      activeRestaurant, setActiveRestaurant,
      cart, addToCart, updateCartQty, clearCart, cartCount, cartTotal,
      activeSession, setActiveSession: saveActiveSession,
      sidebarOpen, setSidebarOpen,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
