import React, { useState } from 'react';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import { Lock, ShieldCheck, CheckCircle2, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Passwords do not match!");
    
    setLoading(true);
    try {
      await API.put('/users/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success("Password changed!");
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Change failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen py-12 px-4 bg-gray-50/50">
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-red-500 transition-colors">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Security</h1>
          <p className="text-gray-500 font-medium">Update your login password</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col gap-5">
          {/* Current Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" required
                style={{ paddingLeft: '60px' }}
                className="w-full pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-500/20 outline-none font-bold"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
              />
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">New Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" required
                style={{ paddingLeft: '60px' }}
                className="w-full pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-green-500/20 outline-none font-bold"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Confirm Password</label>
            <div className="relative">
              <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" required
                style={{ paddingLeft: '60px' }}
                className="w-full pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-green-500/20 outline-none font-bold"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 mt-2 shadow-lg">
            {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Lock size={20} />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;