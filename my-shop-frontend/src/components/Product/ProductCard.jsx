import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { ShoppingBag, Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  /**
   * REAL SOLUTION LOGIC:
   * 1. Check if we are in production (Vercel).
   * 2. If VITE_BASE_URL is missing in production, it will fail to load images 
   *    rather than trying to request 'localhost' (which causes the Mixed Content error).
   */
  const getBackendBaseUrl = () => {
    const envUrl = import.meta.env.VITE_BASE_URL;
    
    // If we are on Vercel but the variable is missing, warn the developer
    if (!envUrl && window.location.hostname !== 'localhost') {
      console.warn("Missing VITE_BASE_URL environment variable in production!");
    }

    return (envUrl || 'http://localhost:5003').replace(/\/$/, "");
  };

  const backendUrl = getBackendBaseUrl();

  const getImageSource = () => {
    // 1. Handle missing product images
    if (!product.images) return 'https://placehold.co/300';
    
    // 2. Handle absolute URLs (e.g., external links)
    if (product.images.startsWith('http')) return product.images;

    /**
     * 3. Handle local/uploaded files.
     * We ensure the path is standardized as: /uploads/filename.jpg
     */
    let imagePath = product.images;

    // Remove any accidental double slashes or leading dots
    imagePath = imagePath.replace(/^(\.\/|\.\.\/|\/)+/, "");

    // If 'uploads/' isn't already in the string, prepend it
    if (!imagePath.startsWith('uploads/')) {
      imagePath = `uploads/${imagePath}`;
    }

    return `${backendUrl}/${imagePath}`;
  };

  const imageSrc = getImageSource();
  const formattedPrice = product.price ? parseFloat(product.price).toFixed(2) : '0.00';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={imageSrc} 
          alt={product.name}
          // crossOrigin is critical for Helmet & CORS when images are on a different domain
          crossOrigin="anonymous" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://placehold.co/300'; // Fallback if image 404s
          }}
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
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;