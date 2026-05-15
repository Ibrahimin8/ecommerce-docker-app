import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import API from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      if (data && data.items) {
        // Consolidate items to ensure no duplicate keys in UI
        const consolidated = data.items.map(item => ({
          ...item.product,
          id: item.productId,
          quantity: item.quantity,
          cartItemId: item.id
        }));
        setCartItems(consolidated);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const clearCart = async () => {
    setCartItems([]);
    try {
      await API.delete('/cart/clear');
    } catch (err) { console.error("DB Clear failed", err); }
  };

  const updateQuantity = async (productId, amount) => {
    try {
      await API.post('/cart/add', { productId, quantity: amount });
      await fetchCart();
    } catch (err) { toast.error("Stock update failed"); }
  };

  const addToCart = async (product) => {
    try {
      await API.post('/cart/add', { productId: product.id, quantity: 1 });
      await fetchCart();
      toast.success("Added to bag!");
    } catch (err) { toast.error("Failed to add"); }
  };

  const checkout = async (orderData) => {
  try {
    setLoading(true);
    // 1. Post Order
    const { data } = await API.post('/orders', orderData);
    
    // 2. Clear Cart
    await clearCart(); 
    
    // 3. Return data so the UI can navigate to Payment Instructions
    return data; 
  } catch (err) {
    toast.error(err.response?.data?.message || "Checkout failed");
    return null;
  } finally {
    setLoading(false);
  }
};

  const getCartTotal = () => cartItems.reduce((acc, i) => acc + (parseFloat(i.price) * i.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, loading, clearCart, addToCart, updateQuantity, checkout, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};