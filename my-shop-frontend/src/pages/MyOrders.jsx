import React, { useEffect, useContext } from 'react';
import { OrderContext } from '../context/OrderContext';
import { RefreshCw, XCircle, ChevronRight, Check, Package, truck, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const OrderTracker = ({ status }) => {
  // Logic mapping for the visual tracker
  const steps = [
    { label: 'Payment', key: 'awaiting_payment' },
    { label: 'Pending', key: 'pending' },
    { label: 'Shipment', key: 'shipment' },
    { label: 'Complete', key: 'complete' }
  ];

  const getStepIndex = (s) => steps.findIndex(step => step.key === s);
  const currentIndex = getStepIndex(status);

  if (status === 'cancelled') return <p className="text-red-500 font-bold text-xs">ORDER CANCELLED</p>;

  return (
    <div className="flex justify-between items-center mt-4 mb-2 relative px-2">
      <div className="absolute h-[2px] bg-gray-100 w-full top-1/2 -translate-y-1/2 left-0 z-0"></div>
      {steps.map((step, index) => (
        <div key={step.key} className="relative z-10 flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            index <= currentIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            {index < currentIndex ? <Check size={12} strokeWidth={4}/> : <span className="text-[10px]">{index + 1}</span>}
          </div>
          <span className={`text-[8px] font-black uppercase mt-1 ${index <= currentIndex ? 'text-blue-600' : 'text-gray-300'}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const MyOrders = () => {
  const { orders, fetchMyOrders, cancelOrder, reorder, loading } = useContext(OrderContext);
  const navigate = useNavigate();

  useEffect(() => { fetchMyOrders(); }, [fetchMyOrders]);

  const handleReorder = async (id) => {
    const newId = await reorder(id);
    if (newId) navigate(`/order-details/${newId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-black mb-10">Order Tracking</h1>
      
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
            <p className="text-gray-400">No orders placed yet.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">#{order.id}</p>
                    <p className="text-[10px] font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">${parseFloat(order.totalPrice).toFixed(2)}</h3>
                  
                  {/* Visual Tracker Component */}
                  <OrderTracker status={order.status} />
                </div>
                
                <div className="flex gap-2 self-end md:self-center">
                  <button 
                    onClick={() => handleReorder(order.id)} 
                    title="Reorder"
                    className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <RefreshCw size={20}/>
                  </button>

                  {order.status === 'awaiting_payment' && (
                    <button 
                      onClick={() => cancelOrder(order.id)} 
                      className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <XCircle size={20}/>
                    </button>
                  )}

                  <Link 
                    to={`/order-details/${order.id}`} 
                    className="p-4 bg-gray-900 text-white rounded-2xl flex items-center gap-2 hover:bg-black transition-all"
                  >
                    Details <ChevronRight size={18}/>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;