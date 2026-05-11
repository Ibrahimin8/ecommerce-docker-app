import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import { Users, Trash2, RefreshCcw, UserPlus, X, ShieldCheck } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // Will store strings like ['user', 'admin']
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Backend alignment: /users for list, /users/roles/list for roles
      const [userRes, roleRes] = await Promise.all([
        API.get('/users'),
        API.get('/users/roles/list')
      ]);
      setUsers(userRes.data);
      setRoles(roleRes.data); // Backend now returns a simple array of strings
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Creating account...");
    try {
      // Alignment with adminCreateUser
      const res = await API.post('/users/admin-create', formData);
      setUsers([res.data, ...users]);
      toast.success("User created successfully!", { id: loadToast });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'user' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed", { id: loadToast });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Alignment with updateUserRole
      await API.patch(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      // Alignment with deleteUser
      await API.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success("User removed");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) return <div className="flex justify-center p-20"><RefreshCcw className="animate-spin text-blue-600" /></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-gray-900">User Directory</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <UserPlus size={20} /> Create User/Admin
        </button>
      </div>

      {/* Dynamic Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-5 text-xs font-black uppercase text-gray-400">User Details</th>
              <th className="px-8 py-5 text-xs font-black uppercase text-gray-400">Role</th>
              <th className="px-8 py-5 text-xs font-black uppercase text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </td>
                <td className="px-8 py-6">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="bg-gray-100 rounded-xl px-4 py-2 text-sm font-bold outline-none border-2 border-transparent focus:border-blue-200"
                  >
                    {roles.map((r, i) => <option key={i} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => handleDelete(user.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400"><X size={24} /></button>
            <h2 className="text-2xl font-black mb-6">New User Account</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input required placeholder="Full Name" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-100" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input required type="email" placeholder="Email Address" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-100" 
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <input required type="password" placeholder="Password" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-100" 
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2">Assign Initial Role</label>
                <select className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" 
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  {roles.map((r, i) => <option key={i} value={r}>{r}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;