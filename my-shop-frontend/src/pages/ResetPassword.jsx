import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Hash, Loader2, ArrowRight, RefreshCcw, UserCircle } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  // Logic to request a NEW OTP (used for Step 1 and the "Resend" button)
  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      toast.success("A new 6-digit code has been sent!");
      setStep(2);
      setOtp(''); // Clear any previous wrong OTP
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send code.");
    } finally { setLoading(false); }
  };

  // Logic to verify if the entered OTP is correct
  const handleVerifyOTP = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    // 1. Verify the code with your backend
    await API.post('/auth/verify-otp', { email, otp });
    
    toast.success("Identity Verified!");

    // 2. CHANGE THIS LINE: Redirect to /change-password, NOT /login
    // We pass the email and otp so the next page knows who is resetting
    navigate('/change-password', { state: { email, otp } });

  } catch (err) {
    toast.error("Invalid code. Please try again.");
    setOtp(''); // Clear the wrong OTP
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900">
          {step === 1 ? "Reset Password" : "Verify Code"}
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          {step === 1 
            ? "Enter your email to receive a reset code." 
            : `We sent a code to ${email}`}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="email" required value={email}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border border-gray-200 focus:border-blue-600 transition-all"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : "Send Reset Code"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="relative group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" required maxLength="6" value={otp}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border border-gray-200 focus:border-blue-600 tracking-[0.5em] font-black text-center text-xl transition-all"
                placeholder="000000"
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center">
              {loading ? <Loader2 className="animate-spin" /> : "Verify & Continue"}
            </button>
          </form>

          {/* HELP OPTIONS FOR WRONG OTP */}
          <div className="flex flex-col gap-4 border-t border-gray-50 pt-6 mt-4">
            <button 
              type="button" 
              onClick={handleRequestOTP}
              className="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
            >
              <RefreshCcw size={14} /> Resend New Code
            </button>
            
            <button 
              type="button" 
              onClick={() => { setStep(1); setOtp(''); }}
              className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
            >
              <UserCircle size={14} /> Wrong email? Change it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;