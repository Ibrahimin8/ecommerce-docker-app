import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { Printer, CheckCircle } from 'lucide-react';
import API from '../services/api';
import { OrderContext } from '../context/OrderContext';
import OrderReceipt from '../pages/OrderReceipt';

// 1. Ensure these match your backend Controller strings exactly (lowercase)
const statusSteps = ["pending", "shipping", "complete"];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        // Based on your controller, data likely looks like { order: { ... } }
        setOrder(data.order);
      } catch (err) { 
        console.error("Fetch Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchOrder();
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_#${id}`,
  });

  // 2. Logic to calculate width based on index
  const getProgressWidth = (currentStatus) => {
    const status = currentStatus?.toLowerCase();
    const index = statusSteps.indexOf(status);
    if (index === -1) return "0%"; // Handles 'cancel' or unknown
    if (index === 0) return "0%";
    
    // Calculates percentage based on array length
    return `${(index / (statusSteps.length - 1)) * 100}%`;
  };

  if (loading) return <div className="p-20 text-center font-black">LOADING TRACKER...</div>;
  if (!order) return <div className="p-20 text-center font-black">ORDER NOT FOUND</div>;

  const currentStatusLower = order.status?.toLowerCase();
  const currentStepIndex = statusSteps.indexOf(currentStatusLower);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-12 shadow-sm">
        <h2 className="text-5xl font-black uppercase italic mb-12 tracking-tighter">
          {order.status}
        </h2>

        {currentStatusLower === 'cancel' ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-black text-center border border-red-100 uppercase">
            Order Cancelled
          </div>
        ) : (
          <div className="relative px-4">
            {/* Background Line */}
            <div className="absolute top-[17px] left-0 w-full h-1.5 bg-gray-100 rounded-full"></div>
            
            {/* Active Progress Line */}
            <div 
              className="absolute top-[17px] left-0 h-1.5 bg-blue-600 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              style={{ width: getProgressWidth(order.status) }}
            ></div>

            {/* Status Nodes */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                // A step is completed if its index is less than or equal to the current status index
                const isCompleted = currentStepIndex >= index;
                const isCurrent = currentStepIndex === index;

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                      isCompleted 
                        ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200' 
                        : 'bg-white border-4 border-gray-100 text-gray-200'
                    }`}>
                      {isCompleted ? <CheckCircle size={20} strokeWidth={3} /> : <div className="w-2.5 h-2.5 bg-current rounded-full" />}
                    </div>
                    
                    <p className={`text-[11px] font-black uppercase mt-4 tracking-widest ${
                      isCompleted ? 'text-blue-600' : 'text-gray-300'
                    }`}>
                      {step}
                    </p>
                    
                    {isCurrent && (
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 animate-ping"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-black transition-all">
          <Printer size={16} /> DOWNLOAD RECEIPT
        </button>
      </div>

      <div style={{ display: 'none' }}>
        <div ref={receiptRef}>
          <OrderReceipt order={order} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;