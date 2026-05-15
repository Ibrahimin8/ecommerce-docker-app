import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardCheck, ArrowRight, Upload, Loader2, CheckCircle2, Landmark, Smartphone } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const PaymentInstructions = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);

  const orderId = state?.orderId;
  const total = state?.totalPrice;

  const handleUploadReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('receipt', file);

    setUploading(true);
    try {
      const response = await API.patch(`/orders/${orderId}/upload-receipt`, formData);
      setReceiptUrl(response.data.receiptUrl);
      toast.success("Receipt uploaded successfully!");
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Complete Your Payment</h1>
        <p className="text-gray-500 mt-2">Order #{orderId} is reserved. Pay to start delivery.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-8">
        <div className="p-8 bg-blue-600 text-white text-center">
          <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Total to Transfer</p>
          <h2 className="text-5xl font-black">${parseFloat(total).toFixed(2)}</h2>
        </div>

        <div className="p-8 space-y-6">
          {/* CBE BANK ACCOUNT SECTION */}
          <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Landmark size={24} />
            </div>
            <div className="flex-1">
              <span className="font-black uppercase text-[10px] text-blue-600 tracking-wider">Commercial Bank (CBE)</span>
              <div className="mt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Account Name</p>
                <p className="font-bold text-gray-900">Ibrahim Ali Beshir</p>
              </div>
              <div className="mt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Account Number</p>
                <p className="text-2xl font-black text-blue-700 tracking-tight">1000277434265</p>
              </div>
            </div>
          </div>

          {/* TELEBIRR SECTION */}
          <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-pink-600 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-pink-200">
              <Smartphone size={24} />
            </div>
            <div className="flex-1">
              <span className="font-black uppercase text-[10px] text-pink-600 tracking-wider">Telebirr Mobile Money</span>
              <div className="mt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Phone Number</p>
                <p className="text-2xl font-black text-pink-600 tracking-tight">0911563727</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-8 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 ${receiptUrl ? 'border-green-500 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
        <h3 className="font-black text-center text-gray-800 mb-4 text-xs uppercase tracking-widest">Step 2: Upload Payment Receipt</h3>
        
        <input type="file" id="receipt" className="hidden" onChange={handleUploadReceipt} accept="image/*" />
        
        {!receiptUrl ? (
          <label htmlFor="receipt" className="cursor-pointer bg-gray-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 mx-auto w-fit hover:bg-black transition-all shadow-lg active:scale-95">
            {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
            {uploading ? "Uploading..." : "Select Receipt Image"}
          </label>
        ) : (
          <div className="flex flex-col items-center text-green-600 animate-in fade-in zoom-in">
            <CheckCircle2 size={48} className="mb-2" />
            <p className="font-black uppercase text-xs tracking-widest">Upload Successful</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => navigate('/my-orders')}
        disabled={!receiptUrl}
        className={`w-full mt-8 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${
          receiptUrl 
          ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 hover:bg-blue-700' 
          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        {receiptUrl ? "Go to Order Tracking" : "Upload Receipt to Continue"} 
        <ArrowRight size={22} />
      </button>
    </div>
  );
};

export default PaymentInstructions;