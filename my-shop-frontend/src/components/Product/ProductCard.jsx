import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { ShoppingBag, Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  // --- FAIL-SAFE URL LOGIC ---
  const getImageUrl = () => {
    if (!product.images) return 'https://placehold.co/300';
    if (product.images.startsWith('http')) return product.images;

    // Force Render if the URL in the browser bar is NOT localhost
    const isProduction = !window.location.hostname.includes('localhost');
    const base = isProduction 
      ? 'https://ecommerce-docker-app.onrender.com' 
      : 'http://localhost:5003';

    // Ensure we don't double up on slashes
    const cleanImagePath = product.images.startsWith('/') ? product.images : `/${product.images}`;
    
    return `${base}${cleanImagePath}`;
  };

  const imageSrc = getImageUrl();
  const formattedPrice = product.price ? parseFloat(product.price).toFixed(2) : '0.00';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={imageSrc} 
          alt={product.name}
          crossOrigin="anonymous" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://placehold.co/300'; }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-800 text-lg truncate">{product.name}</h3>
          <span className="flex items-center text-yellow-500 text-sm font-bold">
            <Star size={14} fill="currentColor" className="mr-1" /> 4.5
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-black text-gray-900">${formattedPrice}</span>
          <button 
            type="button"
            onClick={() => addToCart(product)}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;