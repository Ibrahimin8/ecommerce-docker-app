import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, Check, Loader2 } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const PaymentInstructions = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const orderId = state?.orderId;
  const total = state?.totalPrice;

  const handleUploadReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('receipt', file);

    setUploading(true);
    try {
      // Endpoint to attach image to the order
      await API.patch(`/orders/${orderId}/upload-receipt`, formData);
      setReceipt(true);
      toast.success("Receipt uploaded! Admin will verify soon.");
    } catch (err) {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 py-12">
      {/* ... previous bank details code ... */}

      <div className="mt-8 p-8 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center">
        <h3 className="font-bold text-lg mb-4">Upload Payment Receipt</h3>
        <input 
          type="file" 
          id="receipt-upload" 
          className="hidden" 
          onChange={handleUploadReceipt} 
          accept="image/*"
        />
        
        {receipt ? (
          <div className="text-green-600 font-bold flex items-center justify-center gap-2">
            <Check size={24}/> Receipt Sent Successfully
          </div>
        ) : (
          <label 
            htmlFor="receipt-upload" 
            className="cursor-pointer bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mx-auto w-fit"
          >
            {uploading ? <Loader2 className="animate-spin"/> : <Upload size={20}/>}
            {uploading ? "Uploading..." : "Select Screenshot"}
          </label>
        )}
      </div>

      <button 
        onClick={() => navigate('/my-orders')}
        className="w-full mt-6 bg-blue-600 text-white py-5 rounded-2xl font-black"
      >
        Go to Tracking Page
      </button>
    </div>
  );
};

export default PaymentInstructions;