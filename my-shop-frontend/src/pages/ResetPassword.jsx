import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Hash, Loader2, ArrowRight } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      toast.success("Code sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending code.");
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/verify-otp', { email, otp });
      toast.success("OTP Verified!");
      // Passing state to the final page for security
      navigate('/change-password', { state: { email, otp } });
    } catch (err) {
      toast.error("Invalid or expired code.");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-gray-50">
      <h2 className="text-3xl font-black text-center mb-6 text-gray-900">
        {step === 1 ? "Forgot Password" : "Enter Code"}
      </h2>

      {step === 1 ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="email" required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-blue-600"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : "Send Code"} <ArrowRight size={18}/>
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" required maxLength="6"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-blue-600 tracking-[0.5em] font-black text-center text-xl"
              placeholder="000000"
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Verify & Continue"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;