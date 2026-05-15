import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Connecting to server...');
    
    try {
      await login(email, password);
      toast.success('Welcome back!', { id: loadingToast });
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Server connection failed';
      toast.error(message, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 bg-gray-50/50">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900">Sign In</h2>
          <p className="text-gray-500 mt-2">Enter your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="email" 
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password field */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="password" 
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {/* FORGOT PASSWORD LINK */}
            <div className="flex justify-end mt-2 px-1">
              <Link 
                to="/forgot-password" 
                className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
            <LogIn size={20} /> Login to Account
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          New user? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;