import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Hash, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '' });
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email: formData.email });
      toast.success("Verification code sent!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send code.");
    } finally { setLoading(false); }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/reset-password', formData);
      toast.success("Password changed! Redirecting...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired code.");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-3xl font-black text-gray-900">{step === 1 ? "Reset Password" : "Verify OTP"}</h2>
        <p className="text-gray-500 text-sm mt-2 px-4">
          {step === 1 ? "Enter your email to receive a 6-digit verification code." : `Enter the code sent to ${formData.email}`}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="email" required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-blue-600 transition-all"
              placeholder="Your registered email"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : "Request Code"} <ArrowRight size={18}/>
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" required maxLength="6"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-blue-600 transition-all tracking-[0.5em] font-black text-center text-xl"
              placeholder="000000"
              onChange={(e) => setFormData({...formData, otp: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-blue-600 transition-all"
              placeholder="New secure password"
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
          </button>
          <button type="button" onClick={() => setStep(1)} className="w-full text-gray-400 text-[10px] font-black uppercase tracking-widest mt-4">Change Email</button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;