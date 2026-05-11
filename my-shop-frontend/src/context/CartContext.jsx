import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import API from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to get fresh token from storage
  const getToken = () => localStorage.getItem('token');

  // --- 1. FETCH & CONSOLIDATE CART ---
  const fetchCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setCartItems([]);
      return;
    }
    
    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      
      if (data && data.items) {
        // Use a Map to group identical products and prevent duplicate keys
        const consolidatedMap = new Map();

        data.items.forEach(item => {
          const pId = item.productId;
          if (consolidatedMap.has(pId)) {
            // Update quantity for existing product entry
            const existing = consolidatedMap.get(pId);
            existing.quantity += item.quantity;
          } else {
            // Add new unique product entry
            consolidatedMap.set(pId, {
              ...item.product,
              id: pId,
              quantity: item.quantity,
              cartItemId: item.id // Unique ID for the cart row
            });
          }
        });

        setCartItems(Array.from(consolidatedMap.values()));
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // --- 2. CLEAR CART ---
  const clearCart = () => {
    setCartItems([]);
  };

  // --- 3. UPDATE QUANTITY (Optimistic UI) ---
  const updateQuantity = async (productId, amount) => {
    const token = getToken();
    if (!token) return toast.error("Please login first");

    // Update locally first for a snappy feel
    setCartItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
    ));

    try {
      await API.post('/cart/add', { productId, quantity: amount });
    } catch (err) {
      fetchCart(); // Rollback on error
      toast.error("Could not update quantity");
    }
  };

  // --- 4. ADD TO CART ---
  const addToCart = async (product) => {
    const token = getToken();
    if (!token) {
      toast.error("Please login to add items");
      return;
    }

    try {
      const loadingToast = toast.loading("Updating bag...");
      await API.post('/cart/add', { productId: product.id, quantity: 1 });
      await fetchCart(); // Get consolidated state from server
      toast.dismiss(loadingToast);
      toast.success(`${product.name} added!`);
    } catch (err) {
      toast.error("Failed to add item");
    }
  };

  // --- 5. REMOVE FROM CART ---
  const removeFromCart = async (productId) => {
    const token = getToken();
    if (!token) return;

    try {
      await API.delete(`/cart/item/${productId}`);
      setCartItems(prev => prev.filter(item => item.id !== productId));
      toast.success("Removed from bag");
    } catch (err) {
      fetchCart();
      toast.error("Failed to remove item");
    }
  };

  // --- 6. CHECKOUT ---
// --- 6. CHECKOUT (Enhanced for Navigation) ---
const checkout = async () => {
  const token = getToken();
  if (!token) {
    toast.error("Login required");
    return null; // Return null instead of false
  }

  try {
    setLoading(true);
    // 1. Send checkout request to backend
    const { data } = await API.post('/orders/checkout'); 
    
    // 2. Clear local cart state
    clearCart();
    
    toast.success("Order Placed Successfully! 🛍️");

    // 3. Return the new order ID so the page can navigate to /order-details/:id
    return data.orderId || data.id; 
  } catch (err) {
    toast.error(err.response?.data?.message || "Checkout failed. Check stock levels.");
    return null;
  } finally {
    setLoading(false);
  }
};

  // --- 7. CALCULATE TOTAL ---
  const getCartTotal = () => {
    return cartItems.reduce((acc, i) => acc + (parseFloat(i.price) * i.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      setCartItems,
      loading,
      clearCart,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      checkout, 
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};