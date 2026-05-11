import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Package, Clock, CheckCircle, ChevronRight } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await API.get('/orders/my-orders'); // Your backend route for user orders
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 flex items-center gap-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-black">
          {user?.name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{user?.name}</h1>
          <p className="text-gray-500">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold uppercase tracking-wider text-gray-600">
            {user?.role} Account
          </span>
        </div>
      </div>

      <h2 className="text-xl font-black mb-6 flex items-center gap-2">
        <Package size={24} /> My Order History
      </h2>

      {loading ? (
        <div className="text-center py-10 italic text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center">
          <p className="text-gray-400">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 transition-colors cursor-pointer group">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-primary/5">
                    <Clock className="text-gray-400 group-hover:text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Order #{order.id.toString().padStart(5, '0')}</p>
                    <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-black text-gray-900">${parseFloat(order.totalAmount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{order.OrderItems?.length} items</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                  <ChevronRight className="text-gray-300" size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;