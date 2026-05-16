import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Settings, 
  Users, 
  Shield, 
  List, 
  ClipboardList, 
  Home as HomeIcon 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  // CALCULATE TOTAL QUANTITY for the cart badge
  const totalItems = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Optimized Logout Handler
  const handleLogout = () => {
    // The context logout now handles: 
    // 1. localStorage.removeItem('token')
    // 2. API header cleanup 
    // 3. setUser(null)
    logout(); 
    
    // UI redirection after state cleanup
    navigate('/login'); 
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">
          TECH<span className="text-gray-900">SHOP</span>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="flex items-center gap-4 md:gap-8">
          
          <Link to="/" className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
            <HomeIcon size={18} />
            <span className="hidden lg:inline">Home</span>
          </Link>

          {user && (
            <Link to="/my-orders" className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
              <ClipboardList size={18} />
              <span className="hidden lg:inline">My Orders</span>
            </Link>
          )}

          {/* CART ICON */}
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-sm animate-in fade-in zoom-in duration-300">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3 md:gap-4 border-l pl-4 border-gray-100">
              
              {/* ACCOUNT SETTINGS */}
              <Link 
                to="/account-settings" 
                className="flex items-center gap-3 group px-2 py-1 rounded-2xl hover:bg-gray-50 transition-all border border-transparent"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {user.name ? user.name[0].toUpperCase() : <User size={16} />}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-[9px] font-black uppercase text-gray-400 leading-none tracking-widest">Profile</span>
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    {user.name.split(' ')[0]} <Settings size={10} className="text-gray-300 group-hover:rotate-90 transition-transform duration-500" />
                  </span>
                </div>
              </Link>

              {/* ADMIN SECTION (Visible only to Admins) */}
              {isAdmin && (
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  <Link to="/admin/users" className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Manage Users">
                    <Users size={18} />
                  </Link>
                  <Link to="/admin/orders" className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Admin Order Management">
                    <List size={18} />
                  </Link>
                  <Link to="/admin" className="p-2 text-gray-400 hover:text-purple-600 transition-colors" title="Full Dashboard">
                    <Shield size={18} />
                  </Link>
                </div>
              )}

              {/* LOGOUT - Styled for prominence and safety */}
              <button 
                onClick={handleLogout} 
                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Secure Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95">Join</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;