import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Landmark, Smartphone, ClipboardCheck, ArrowRight } from 'lucide-react';

const PaymentInstructions = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Data passed from Checkout/Cart
  const orderId = state?.orderId;
  const total = state?.totalPrice;

  return (
    <div className="max-w-2xl mx-auto p-6 pt-12">
      <div className="text-center mb-10">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="text-green-600" size={32} />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Final Step: Payment</h1>
        <p className="text-gray-500 mt-2">Please transfer the total amount to one of the accounts below.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mb-8">
        <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Amount</p>
            <p className="text-3xl font-black">${parseFloat(total).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Reference Code</p>
            <p className="text-xl font-black text-blue-400">#{orderId}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Option 1: Bank */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <Landmark className="text-blue-600 mt-1" />
            <div>
              <p className="font-bold text-blue-900">Commercial Bank of Ethiopia (CBE)</p>
              <p className="text-sm text-blue-700">Acc Name: Ibrahim Ali Beshir</p>
              <p className="text-lg font-black text-blue-900">1000234567891</p>
            </div>
          </div>

          {/* Option 2: Telebirr */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-pink-50 border border-pink-100">
            <Smartphone className="text-pink-600 mt-1" />
            <div>
              <p className="font-bold text-pink-900">Telebirr / Mobile Money</p>
              <p className="text-lg font-black text-pink-900">0911XXXXXX</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl mb-8">
        <p className="text-sm text-yellow-800 leading-relaxed">
          <strong>Important:</strong> Please include the Reference Code <b>#{orderId}</b> in your transfer reason. Once finished, our admin will verify your payment and start the delivery.
        </p>
      </div>

      <button 
        onClick={() => navigate('/my-orders')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2"
      >
        I have completed the payment <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default PaymentInstructions;