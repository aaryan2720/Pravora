'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export const mockUser = {
  id: 'user_demo',
  name: 'Ravi Kumar',
  email: 'ravi@spicegarden.in',
  role: 'owner',
  restaurantId: 'r_spicegardenblr',
  avatar: null,
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(mockUser); // pre-authenticated for frontend demo
  const [activeRestaurant, setActiveRestaurant] = useState({
    id: 'r_spicegardenblr',
    slug: 'spice-garden',
    name: 'Spice Garden',
  });
  const [cart, setCart] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const addToCart = useCallback((item, qty = 1, note = '') => {
    setCart(prev => {
      const existing = prev.find(c => c.itemId === item.id);
      if (existing) {
        return prev.map(c => c.itemId === item.id ? { ...c, qty: c.qty + qty } : c);
      }
      return [...prev, { itemId: item.id, name: item.name, price: item.price, qty, note, isVeg: item.isVeg }];
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
    setUser(null);
    setCart([]);
    setActiveSession(null);
  }, []);

  const signIn = useCallback((userData) => {
    setUser(userData || mockUser);
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser, signIn, signOut,
      activeRestaurant, setActiveRestaurant,
      cart, addToCart, updateCartQty, clearCart, cartCount, cartTotal,
      activeSession, setActiveSession,
      sidebarOpen, setSidebarOpen,
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
