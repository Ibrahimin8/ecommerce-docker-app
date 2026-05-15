import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, getCartTotal, loading } = useContext(CartContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag size={64} className="text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Empty Bag</h2>
        <Link to="/" className="mt-4 text-blue-600 font-bold">Go Shopping →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-black mb-8">Your Bag</h1>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <img src={item.images} className="w-20 h-20 object-cover rounded-2xl bg-gray-50" alt={item.name} />
            <div className="flex-1 ml-6">
              <h3 className="font-bold text-gray-800">{item.name}</h3>
              <p className="text-blue-600 font-black">${parseFloat(item.price).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
              <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8"><Minus size={16}/></button>
              <span className="font-bold">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8"><Plus size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gray-900 text-white p-8 rounded-[2.5rem] flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase">Subtotal</p>
          <h2 className="text-4xl font-black">${getCartTotal().toFixed(2)}</h2>
        </div>
        <button 
          onClick={() => navigate('/checkout')} 
          className="bg-blue-600 px-10 py-5 rounded-2xl font-black flex items-center gap-2"
        >
          Proceed to Checkout <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Cart;