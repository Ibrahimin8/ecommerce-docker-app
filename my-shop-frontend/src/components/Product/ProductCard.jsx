import React, { useContext, useState } from 'react';
import { CartContext } from '../../context/CartContext';
import { ShoppingBag, Star, AlertCircle, Check } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [added, setAdded] = useState(false);

 
  // Ensure we use 'images' plural and handle numeric price strings from DB
  const imageSrc = product.images || 'https://placehold.co/400x400?text=No+Image';
  const formattedPrice = product.price ? parseFloat(product.price).toFixed(2) : '0.00';
  
  // 2. STOCK LOGIC:
  // Reflect the real-time stock state (0 or less is Sold Out)
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product);
      setAdded(true);
      // Reset the "Check" icon after 2 seconds
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group ${isOutOfStock ? 'opacity-80' : ''}`}>
      
      {/* Product Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={imageSrc} 
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${!isOutOfStock && 'group-hover:scale-110'}`}
          onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=Image+Error'; }}
        />
        
        {/* Category Label */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
            {product.category?.name || 'General'}
          </span>
        </div>

        {/* Sold Out Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white px-5 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl">
              Sold Out
            </span>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 text-lg truncate pr-2">{product.name}</h3>
          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
            <Star size={12} fill="#eab308" className="text-yellow-500 mr-1" />
            <span className="text-xs font-black text-yellow-700">4.5</span>
          </div>
        </div>
        
        <p className="text-gray-500 text-xs mb-4 line-clamp-1">
          {product.description || 'Premium quality appliance for your home.'}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900 tracking-tighter">
              ${formattedPrice}
            </span>
            {/* Real-time stock display */}
            <span className={`text-[10px] font-bold ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
              {isOutOfStock ? 'Restocking Soon' : `${product.stock} in stock`}
            </span>
          </div>
          
          <button 
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
              isOutOfStock 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
              : added 
                ? 'bg-green-500 text-white scale-110 shadow-green-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-90 shadow-blue-200'
            }`}
          >
            {isOutOfStock ? (
              <AlertCircle size={22} />
            ) : added ? (
              <Check size={22} strokeWidth={3} />
            ) : (
              <ShoppingBag size={22} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;