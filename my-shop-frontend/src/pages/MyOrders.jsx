import React, { useEffect, useContext } from 'react';
import { OrderContext } from '../context/OrderContext';
import { RefreshCw, XCircle, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const { orders, fetchMyOrders, cancelOrder, reorder, loading } = useContext(OrderContext);
  const navigate = useNavigate();

  useEffect(() => { fetchMyOrders(); }, [fetchMyOrders]);

  const handleReorder = async (id) => {
    const newId = await reorder(id);
    if (newId) navigate(`/order-details/${newId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-black mb-10">Purchase History</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-3xl border-2 border-gray-50 flex items-center justify-between group">
            <div className="flex-1">
              <p className="text-[10px] font-black text-gray-300 uppercase">#{order.id}</p>
              <h3 className="text-xl font-black">${parseFloat(order.totalPrice).toFixed(2)}</h3>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>{order.status}</span>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => handleReorder(order.id)} className="p-3 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <RefreshCw size={20}/>
              </button>
              {order.status === 'pending' && (
                <button onClick={() => cancelOrder(order.id)} className="p-3 bg-gray-50 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
                  <XCircle size={20}/>
                </button>
              )}
              <Link to={`/order-details/${order.id}`} className="p-3 bg-gray-900 text-white rounded-xl">
                <ChevronRight size={20}/>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;