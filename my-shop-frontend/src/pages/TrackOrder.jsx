import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TrackOrder = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || id === 'undefined') {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Could not load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-10 text-center font-bold">Loading order details...</div>;

  if (!order) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold">No order found</h2>
      <button onClick={() => navigate('/my-orders')} className="text-blue-600 underline">Back to My Orders</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black">Order #{order.id}</h1>
      </div>
      
      {/* Status Timeline */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Delivery Progress</h3>
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-3 before:h-full before:w-0.5 before:bg-gray-100">
          {order.statusHistories.map((step, index) => (
            <div key={index} className="relative flex items-start gap-6">
              <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-white">
                {step.status === 'completed' ? <CheckCircle className="text-green-500" size={20} /> : 
                 step.status === 'cancelled' ? <XCircle className="text-red-500" size={20} /> : 
                 <Clock className="text-blue-500" size={20} />}
              </div>
              <div>
                <p className="font-black capitalize text-gray-800">{step.status}</p>
                <p className="text-xs text-gray-500 font-medium">
                  {new Date(step.changedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items & Total */}
      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
        <h3 className="font-black text-gray-800 mb-4">Items Summary</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
              <span className="text-sm font-medium">{item.name} <span className="text-gray-400 ml-2">x{item.quantity}</span></span>
              <span className="font-bold text-gray-700">${parseFloat(item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300 flex justify-between items-center">
          <span className="font-black text-xl text-gray-400 uppercase tracking-tighter">Total Paid</span>
          <span className="font-black text-3xl text-blue-600">${parseFloat(order.totalPrice).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;