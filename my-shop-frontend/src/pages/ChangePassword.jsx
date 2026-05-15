import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const ChangePassword = () => {
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });

  if (!state?.email || !state?.otp) {
    navigate('/forgot-password');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);
    try {
      await API.post('/auth/reset-password', { 
        email: state.email, 
        otp: state.otp, 
        newPassword: formData.password 
      });
      toast.success("Password updated successfully!");
      navigate('/login');
    } catch (err) {
      toast.error("Failed to update password.");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-black text-center mb-6 text-gray-900">New Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="password" required
            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-blue-600 transition-all"
            placeholder="New Password"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
        <div className="relative">
          <CheckCircle2 className={`absolute left-4 top-1/2 -translate-y-1/2 ${formData.password && formData.password === formData.confirmPassword ? 'text-green-500' : 'text-gray-400'}`} size={18} />
          <input 
            type="password" required
            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-blue-600 transition-all"
            placeholder="Confirm Password"
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />
        </div>
        <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100">
          {loading ? <Loader2 className="animate-spin" /> : "Complete Reset"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;