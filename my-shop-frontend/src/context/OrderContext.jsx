import React, { createContext, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import API from '../services/api';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]); // Personal orders
  const [allOrders, setAllOrders] = useState([]); // Admin global orders
  const [adminStats, setAdminStats] = useState(null);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ MY ORDERS LIST (User)
  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/orders/my-orders');
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) { 
      toast.error("Error loading your orders"); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  // ✅ CANCEL ORDER (User/Admin - Restores Stock)
  const cancelOrder = async (orderId) => {
    try {
      // Note: If your backend requires /admin for admin cancels, change this path
      await API.patch(`/orders/cancel/${orderId}`);
      toast.success("Order cancelled and stock restored");
      fetchMyOrders();
    } catch (err) { 
      toast.error("Cancellation failed"); 
    }
  };

  // ✅ REORDER LOGIC (User)
  const reorder = async (orderId) => {
    try {
      const { data } = await API.post(`/orders/reorder/${orderId}`);
      toast.success("Items added to new order!");
      return data.orderId;
    } catch (err) { 
      toast.error("Reorder failed"); 
    }
  };

  // ✅ ADMIN: FETCH ALL ORDERS
  const fetchGlobalOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders/admin/all'); 
      // Handle cases where data is wrapped in an 'orders' key or returned directly
      const ordersData = res.data.orders || res.data;
      setAllOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("Failed to fetch all orders", err);
      toast.error("Failed to load global orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ ADMIN: SALES STATS & TOP SELLERS
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, topRes] = await Promise.all([
        API.get('/orders/admin/stats'), 
        API.get('/orders/admin/top-sellers')
      ]);

      // DEBUG: Check these logs in your browser to see the exact structure
      console.log("Admin Stats Raw:", statsRes.data);
      console.log("Top Sellers Raw:", topRes.data);

      // Mapping logic: Fallback to res.data if res.data.stats is undefined
      setAdminStats(statsRes.data.stats || statsRes.data);
      setTopSellers(Array.isArray(topRes.data) ? topRes.data : (topRes.data.topSellers || []));

    } catch (err) { 
      console.error("Admin data fetch failed", err); 
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ ADMIN: UPDATE ORDER STATUS
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    // ADD '/admin' HERE to match your router.patch('/admin/status/:id')
    await API.patch(`/orders/admin/status/${orderId}`, { status: newStatus }); 
    
    toast.success(`Order #${orderId} updated to ${newStatus}`);
    
    // Refresh data to update Revenue from $0
    fetchAdminData(); 
    fetchGlobalOrders(); 
    return true;
  } catch (err) {
    console.error("Status update error:", err.response?.data);
    toast.error("Status update failed. Check console for details.");
    return false;
  }
};

  return (
    <OrderContext.Provider value={{ 
      orders, 
      allOrders, 
      adminStats, 
      topSellers, 
      loading,
      fetchMyOrders, 
      cancelOrder, 
      reorder, 
      fetchAdminData, 
      updateOrderStatus, 
      fetchGlobalOrders 
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;