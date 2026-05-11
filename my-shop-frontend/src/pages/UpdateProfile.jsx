import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import { User, Mail, Save, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpdateProfile = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/users/profile');
        setFormData({ name: res.data.name, email: res.data.email });
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await API.patch('/users/profile', formData);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><RefreshCcw className="animate-spin text-blue-600" /></div>;

  return (
    <div className="flex flex-col items-center w-full min-h-screen py-12 px-4 bg-gray-50/50">
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-blue-600 transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Profile</h1>
          <p className="text-gray-500 font-medium">Update your public information</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
              <input 
                required
                style={{ paddingLeft: '60px' }}
                className="w-full pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all font-bold text-gray-800 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
              <input 
                required type="email"
                style={{ paddingLeft: '60px' }}
                className="w-full pr-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all font-bold text-gray-800 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <button disabled={updating} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-blue-100">
            {updating ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;