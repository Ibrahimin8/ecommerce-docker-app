import React, { useEffect, useContext, useState, useCallback } from 'react';
import { OrderContext } from '../context/OrderContext';
import { TrendingUp, Award, ListFilter, Eye, Loader2, Package, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const AdminOrders = () => {
  // Pulling logic from OrderContext
  const { adminStats, topSellers, fetchAdminData, updateOrderStatus } = useContext(OrderContext);
  
  const [allOrders, setAllOrders] = useState([]);
  const [fetchingList, setFetchingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Updated to use the correct backend path: /orders/admin/all
  const fetchGlobalOrders = useCallback(async () => {
    setFetchingList(true);
    try {
      const res = await API.get('/orders/admin/all');
      // Ensure we extract the orders array correctly regardless of wrapper
      const ordersData = res.data.orders || res.data;
      setAllOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("Failed to fetch all orders:", err.response?.data || err.message);
    } finally {
      setFetchingList(false);
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    fetchAdminData(); // Fetches stats and top sellers via Context
    fetchGlobalOrders(); // Fetches the main list locally
  }, [fetchAdminData, fetchGlobalOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      // Optimistic UI update: change the status in the local list immediately
      setAllOrders(prev => 
        prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order)
      );
    }
  };

  // Filter orders for the search bar
  const filteredOrders = allOrders.filter(order => 
    String(order.id).includes(searchTerm) || 
    order.User?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      
      {/* ✅ ADMIN SALES STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <TrendingUp className="absolute right-[-20px] bottom-[-20px] opacity-10 w-40 h-40" />
          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest text-blue-400">Total Revenue</p>
          <h2 className="text-5xl font-black mt-2">
            ${adminStats?.totalRevenue?.toLocaleString() || '0.00'}
          </h2>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-gray-50 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Orders Handled</p>
          <h2 className="text-5xl font-black text-gray-900 mt-2">
            {adminStats?.totalOrders || 0}
          </h2>
        </div>
      </div>

      {/* ✅ TOP SELLERS SECTION */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
          <Award className="text-yellow-500" /> Top Sellers
        </h3>
        {topSellers && topSellers.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {topSellers.map((item, i) => (
              <div key={i} className="bg-gray-50 p-5 rounded-3xl flex flex-col items-center text-center hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-blue-500">
                  <Package size={18} />
                </div>
                <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.product?.name || 'Unknown Product'}</p>
                <p className="text-blue-600 font-black text-xs mt-1">{item.totalSold} Units Sold</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm italic bg-gray-50 rounded-2xl">
            No sales data available yet.
          </div>
        )}
      </div>

      {/* ✅ ADMIN ORDERS LIST TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-black flex items-center gap-2 text-gray-800">
            <ListFilter size={20} className="text-blue-600"/> Global Orders
          </h3>
          
          {/* Search bar for easier management */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {fetchingList && <Loader2 className="animate-spin text-blue-600" size={20} />}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] font-black uppercase text-gray-400 bg-gray-50/30">
              <tr>
                <th className="p-6">Order ID</th>
                <th className="p-6">Customer Info</th>
                <th className="p-6">Total Amount</th>
                <th className="p-6">Current Status</th>
                <th className="p-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-6 font-mono font-black text-blue-600 text-sm">#{order.id}</td>
                  <td className="p-6">
                    <p className="font-bold text-sm text-gray-900">{order.User?.name || 'Guest Customer'}</p>
                    <p className="text-xs text-gray-400 font-medium">{order.phone || 'No phone'}</p>
                  </td>
                  <td className="p-6 font-black text-gray-700">
                    ${parseFloat(order.totalPrice || 0).toFixed(2)}
                  </td>
                  <td className="p-6">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-[10px] font-black p-2 rounded-xl border-none outline-none ring-2 ring-transparent focus:ring-blue-200 transition-all cursor-pointer ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <option value="pending">PENDING</option>
                      <option value="shipped">SHIPPED</option>
                      <option value="completed">COMPLETED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </td>
                  <td className="p-6 text-center">
                    <Link 
                      to={`/order-details/${order.id}`} 
                      className="p-3 bg-gray-900 text-white rounded-2xl inline-block hover:bg-black hover:scale-105 transition-all shadow-md"
                    >
                      <Eye size={16}/>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && !fetchingList && (
            <div className="p-20 text-center text-gray-300 font-bold">
              {searchTerm ? "No orders match your search." : "No orders found in the system."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;