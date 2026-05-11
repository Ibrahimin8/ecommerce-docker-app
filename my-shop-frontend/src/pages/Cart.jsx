import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  // Get Backend URL from .env
  const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5003";

  // Helper to build the correct image path
  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/150?text=No+Image';
    // If the path is already a full URL, return it
    if (path.startsWith('http')) return path;
    // Ensure there is a slash between URL and path
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag size={64} className="text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <Link to="/" className="mt-4 text-blue-600 font-bold hover:underline">Go Shopping →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-black mb-8">Your Bag</h1>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            {/* Using .images as verified in your console log */}
            <img 
              src={getImageUrl(item.images)} 
              className="w-20 h-20 object-cover rounded-2xl bg-gray-50" 
              alt={item.name} 
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = 'https://placehold.co/150?text=Error+Loading'; 
              }} 
            />
            
            <div className="flex-1 ml-6">
              <h3 className="font-bold text-gray-800">{item.name}</h3>
              <p className="text-blue-600 font-black">
                ${parseFloat(item.price).toFixed(2)}
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl mr-6">
              <button 
                onClick={() => updateQuantity(item.id, -1)} 
                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
              >
                <Minus size={16}/>
              </button>
              <span className="font-bold w-4 text-center">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, 1)} 
                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
              >
                <Plus size={16}/>
              </button>
            </div>
            
            <button 
              onClick={() => removeFromCart(item.id)} 
              className="text-gray-300 hover:text-red-500 transition-colors p-2"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gray-900 text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Subtotal</p>
          <h2 className="text-4xl font-black">${getCartTotal().toFixed(2)}</h2>
        </div>
        <button 
          onClick={() => navigate('/checkout')} 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
        >
          Proceed to Checkout <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Cart;