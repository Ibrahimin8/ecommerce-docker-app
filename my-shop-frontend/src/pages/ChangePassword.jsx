import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const ChangePassword = () => {
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });

  // Safety check: Use useEffect to handle redirection if state is missing
  useEffect(() => {
    if (!state?.email || !state?.otp) {
      toast.error("Session missing. Please verify your OTP again.");
      navigate('/forgot-password');
    }
  }, [state, navigate]);

  if (!state?.email || !state?.otp) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }

    setLoading(true);
    try {
      // Step 3: Final backend call to update the password
      await API.post('/auth/reset-password', { 
        email: state.email, 
        otp: state.otp, 
        newPassword: formData.password 
      });
      
      toast.success("Password updated successfully!");
      
      // ONLY NOW we go to login
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password.";
      toast.error(msg);
      // If the OTP expired while on this page, send them back to the start
      if (err.response?.status === 400) navigate('/forgot-password');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900">Set New Password</h2>
        <p className="text-gray-500 mt-2">Please enter and confirm your new password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="password" 
            required
            autoComplete="new-password"
            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border border-gray-200 focus:border-blue-600 transition-all"
            placeholder="New Password"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <div className="relative group">
          <CheckCircle2 
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              formData.confirmPassword && formData.password === formData.confirmPassword 
              ? 'text-green-500' : 'text-gray-400'
            }`} 
            size={18} 
          />
          <input 
            type="password" 
            required
            autoComplete="new-password"
            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border border-gray-200 focus:border-blue-600 transition-all"
            placeholder="Confirm Password"
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />
        </div>

        <button 
          disabled={loading} 
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Complete Reset"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;