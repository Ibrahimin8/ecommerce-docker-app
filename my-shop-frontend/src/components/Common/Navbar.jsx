import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { ShoppingCart, User, LogOut, Settings, Users, Shield, List } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  
  // UPDATED: Using cartItems from our new Context
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  // CALCULATE TOTAL QUANTITY: 
  // This sums up the quantity of every item in the bag
  const totalItems = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">
          TECH<span className="text-gray-900">SHOP</span>
        </Link>

        <div className="flex items-center gap-6">
          {/* CART ICON */}
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              
              {/* ACCOUNT SETTINGS LINK */}
              <Link 
                to="/account-settings" 
                className="flex items-center gap-3 group px-3 py-2 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {user.name ? user.name[0].toUpperCase() : <User size={18} />}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400 leading-none tracking-widest">Settings</span>
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    {user.name} <Settings size={12} className="text-gray-300 group-hover:rotate-90 transition-transform duration-500" />
                  </span>
                </div>
              </Link>

              {/* ADMIN SECTION */}
              {isAdmin && (
                <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
                  <Link to="/admin/users" className="p-2 text-gray-400 hover:text-blue-600" title="Manage Users">
                    <Users size={20} />
                  </Link>
                  {/* <Link to="/admin/categories" className="p-2 text-gray-400 hover:text-green-600" title="Manage Categories">
                     <List size={20} />
                  </Link> */}
                  <Link to="/admin" className="p-2 text-gray-400 hover:text-purple-600" title="Admin Panel">
                    <Shield size={20} />
                  </Link>
                  <Link to="/admin/orders" className="p-2 text-gray-400 hover:text-red-600" title="Manage Orders">
                    <List size={20} />
                  </Link>
                  {/* <Link to="/admin/products" className="p-2 text-gray-400 hover:text-yellow-600" title="Manage Products">
                    <List size={20} />
                  </Link> */}
                </div>
              )}

              {/* LOGOUT */}
              <button 
                onClick={() => { logout(); navigate('/login'); }} 
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={22} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md">Join</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;