import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { ShoppingBag, Star, AlertCircle } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  // Sync with your backend field name 'images'
  const imageSrc = product.images || 'https://placehold.co/300';
  const formattedPrice = product.price ? parseFloat(product.price).toFixed(2) : '0.00';
  
  // Check if item is out of stock
  const isOutOfStock = product.stock <= 0;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group ${isOutOfStock ? 'opacity-75' : ''}`}>
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={imageSrc} 
          alt={product.name}
          crossOrigin="anonymous" 
          className={`w-full h-full object-cover transition-transform duration-300 ${!isOutOfStock && 'group-hover:scale-105'}`}
          onError={(e) => { e.target.src = 'https://placehold.co/300'; }}
        />
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-red-600 px-4 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-800 text-lg truncate">{product.name}</h3>
          <span className="flex items-center text-yellow-500 text-sm font-bold">
            <Star size={14} fill="currentColor" className="mr-1" /> 4.5
          </span>
        </div>
        
        {/* Category Badge & Stock Count */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold uppercase">
            {product.category?.name || 'General'}
          </span>
          {!isOutOfStock && (
             <span className="text-[10px] text-green-600 font-bold">
               {product.stock} left
             </span>
          )}
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-1">{product.description || 'No description available.'}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-black text-gray-900">${formattedPrice}</span>
          
          <button 
            type="button"
            onClick={() => !isOutOfStock && addToCart(product)}
            disabled={isOutOfStock}
            className={`p-2 rounded-lg transition-all ${
              isOutOfStock 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
          >
            {isOutOfStock ? <AlertCircle size={20} /> : <ShoppingBag size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;