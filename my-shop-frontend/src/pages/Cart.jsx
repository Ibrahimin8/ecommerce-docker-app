import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const { cartItems, updateQuantity, getCartTotal, loading, checkout } = useContext(CartContext);
  const navigate = useNavigate();

  // THE REDIRECT LOGIC
  const handleProceedToCheckout = async () => {
    // 1. Basic validation
    if (cartItems.length === 0) return;

    // 2. Prepare Order Data
    // Note: If you have a separate Address form page, navigate there first.
    // But for a direct "Manual Payment" flow, we process the order now.
    const orderData = {
      items: cartItems,
      totalPrice: getCartTotal(),
      // You can add default values or prompt for these if not in a separate form
      city: "Addis Ababa", 
      phone: "Customer Phone", 
    };

    try {
      // 3. Call checkout from Context
      const result = await checkout(orderData);

      // 4. If successful, redirect to Payment Instructions with Order Data
      if (result) {
        navigate('/payment-instructions', { 
          state: { 
            orderId: result, 
            totalPrice: getCartTotal() 
          } 
        });
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error("Failed to process checkout. Please try again.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag size={64} className="text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Empty Bag</h2>
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
            <img 
              src={item.images} 
              className="w-20 h-20 object-cover rounded-2xl bg-gray-50" 
              alt={item.name} 
              onError={(e) => { e.target.src = 'https://placehold.co/150'; }}
            />
            
            <div className="flex-1 ml-6">
              <h3 className="font-bold text-gray-800">{item.name}</h3>
              <p className="text-blue-600 font-black">${parseFloat(item.price).toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
              <button 
                disabled={loading}
                onClick={() => updateQuantity(item.id, -1)} 
                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Minus size={16}/>
              </button>
              <span className="font-bold w-4 text-center">{item.quantity}</span>
              <button 
                disabled={loading}
                onClick={() => updateQuantity(item.id, 1)} 
                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gray-900 text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Subtotal</p>
          <h2 className="text-4xl font-black">${getCartTotal().toFixed(2)}</h2>
        </div>
        
        <button 
          onClick={handleProceedToCheckout} 
          disabled={loading}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:bg-gray-700"
        >
          {loading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>
              Proceed to Checkout <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Cart;