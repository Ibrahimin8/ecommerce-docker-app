import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Landmark, Smartphone, ClipboardCheck, ArrowRight, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const PaymentInstructions = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null); // Tracks if upload is done

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
        <h1 className="text-3xl font-black text-gray-900">Complete Your Payment</h1>
        <p className="text-gray-500 mt-2">Order #{orderId} is reserved. Pay to start delivery.</p>
      </div>

      {/* Account Details Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-8">
        <div className="p-8 bg-blue-600 text-white text-center">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Total to Transfer</p>
          <p className="text-5xl font-black">${parseFloat(total).toFixed(2)}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3 mb-3 text-blue-600">
              <Landmark size={20} />
              <span className="font-black uppercase text-xs">Bank Transfer (CBE)</span>
            </div>
            <p className="text-sm text-gray-500">Account Name:</p>
            <p className="font-bold text-gray-900">Ibrahim Ali Beshir</p>
            <p className="text-2xl font-black text-blue-700 mt-1">1000277434265</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3 mb-3 text-pink-600">
              <Smartphone size={20} />
              <span className="font-black uppercase text-xs">Telebirr</span>
            </div>
            <p className="text-sm text-gray-500">Phone Number:</p>
            <p className="text-2xl font-black text-pink-600">0911563727</p>
          </div>
        </div>
      </div>

      {/* Upload Section - REQUIRED */}
      <div className={`p-8 rounded-[2.5rem] border-2 border-dashed transition-all ${receiptUrl ? 'border-green-500 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
        <h3 className="font-black text-center text-gray-800 mb-4">Step 2: Upload Payment Screenshot</h3>
        
        <input type="file" id="receipt" className="hidden" onChange={handleUploadReceipt} accept="image/*" />
        
        {!receiptUrl ? (
          <label htmlFor="receipt" className="cursor-pointer bg-gray-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 mx-auto w-fit hover:bg-black transition-all">
            {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
            {uploading ? "Uploading to Cloudinary..." : "Select Receipt Image"}
          </label>
        ) : (
          <div className="flex flex-col items-center text-green-600">
            <CheckCircle2 size={48} className="mb-2" />
            <p className="font-bold">Receipt Verified & Saved</p>
          </div>
        )}
      </div>

      {/* Restricted Navigation Button */}
      <button 
        onClick={() => navigate('/my-orders')}
        disabled={!receiptUrl} // <--- DISABLED UNTIL UPLOADED
        className={`w-full mt-8 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${
          receiptUrl 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {receiptUrl ? "Go to Order Tracking" : "Upload Receipt to Continue"} 
        <ArrowRight size={22} />
      </button>
      
      {!receiptUrl && (
        <p className="text-center text-gray-400 text-[10px] mt-4 uppercase font-bold tracking-widest">
          Button will activate after successful upload
        </p>
      )}
    </div>
  );
};

export default PaymentInstructions;