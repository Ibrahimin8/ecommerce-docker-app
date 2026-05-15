import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Eye, CheckCircle, Truck, Package, ExternalLink, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    try {
      const res = await API.get('/orders/admin/all');
      setOrders(res.data.orders);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllOrders(); }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.patch(`/orders/admin/status/${id}`, { status: newStatus });
      toast.success(`Order updated to ${newStatus}`);
      fetchAllOrders(); // Refresh list
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Management Console...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-black mb-10 tracking-tight">Order Management</h1>
      
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Order & Customer</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Payment Proof</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Status</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-6">
                  <p className="font-black text-blue-600 text-xs">#{order.id}</p>
                  <p className="font-bold text-gray-900">{order.User?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-400">{order.phone}</p>
                </td>
                <td className="p-6">
                  {order.receiptImage ? (
                    <a 
                      href={order.receiptImage} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl w-fit hover:bg-blue-100"
                    >
                      <Eye size={14}/> View Receipt
                    </a>
                  ) : (
                    <span className="text-xs font-bold text-gray-300 italic">No receipt yet</span>
                  )}
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    order.status === 'awaiting_payment' ? 'bg-amber-100 text-amber-600' :
                    order.status === 'shipment' ? 'bg-purple-100 text-purple-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex justify-end gap-2">
                    {/* Confirm Payment -> Moves to Pending */}
                    {order.status === 'awaiting_payment' && (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'pending')}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
                        title="Confirm Payment"
                      >
                        <CheckCircle size={18}/>
                      </button>
                    )}
                    
                    {/* Move to Shipment */}
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'shipment')}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                        title="Mark as Shipped"
                      >
                        <Truck size={18}/>
                      </button>
                    )}

                    {/* Move to Complete */}
                    {order.status === 'shipment' && (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'complete')}
                        className="bg-gray-900 text-white p-2 rounded-lg hover:bg-black"
                        title="Mark as Complete"
                      >
                        <Package size={18}/>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;