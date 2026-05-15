import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  // Helper to get image path (Matches your ProductCard logic)
  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/150?text=No+Image';
    // Use the Cloudinary URL directly since it's stored in the 'images' field
    return path;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-gray-50 p-10 rounded-full mb-6">
          <ShoppingBag size={80} className="text-gray-200" />
        </div>
        <h2 className="text-3xl font-black text-gray-800">Your bag is empty</h2>
        <p className="text-gray-500 mt-2">Looks like you haven't added anything yet.</p>
        <Link 
          to="/" 
          className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Your Bag</h1>
          <p className="text-gray-500 font-medium mt-1">Review your items before checkout</p>
        </div>
        <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-black text-sm">
          {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
        </span>
      </header>

      <div className="space-y-4 mb-10">
        {cartItems.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Product Image */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
              <img 
                src={getImageUrl(item.images)} 
                className="w-full h-full object-cover" 
                alt={item.name}
                onError={(e) => { e.target.src = 'https://placehold.co/150'; }}
              />
            </div>
            
            {/* Product Info */}
            <div className="flex-1 ml-6">
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
              <p className="text-blue-600 font-black text-xl mt-1">
                ${parseFloat(item.price).toFixed(2)}
              </p>
            </div>
            
            {/* Quantity Controls */}
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl mr-6 border border-gray-100">
              <button 
                onClick={() => updateQuantity(item.id, -1)} 
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
              >
                <Minus size={18}/>
              </button>
              <span className="font-black text-lg w-6 text-center text-gray-800">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, 1)} 
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
              >
                <Plus size={18}/>
              </button>
            </div>
            
            {/* Remove Button */}
            <button 
              onClick={() => removeFromCart(item.id)} 
              className="bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all p-3 rounded-xl"
            >
              <Trash2 size={22} />
            </button>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="bg-gray-900 text-white p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-blue-900/20">
        <div className="text-center md:text-left">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">Estimated Subtotal</p>
          <h2 className="text-5xl font-black tracking-tighter">${getCartTotal().toFixed(2)}</h2>
        </div>
        
        <button 
          onClick={() => navigate('/checkout')} 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 group"
        >
          Proceed to Checkout 
          <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <p className="text-center text-gray-400 text-sm mt-8 font-medium">
        Free delivery for orders within central Addis Ababa.
      </p>
    </div>
  );
};

export default Cart;