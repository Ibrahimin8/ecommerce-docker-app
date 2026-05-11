import { useState, useEffect } from 'react';
import API from '../services/api';
import ProductCard from '../components/Product/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get('/products');
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* This 'max-w-7xl mx-auto' is the magic fix. 
        It centers your content and stops it from hitting the screen edges. 
      */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <header className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">
            Explore Item
          </h1>
          <p className="text-xl text-gray-500 font-medium">
            Premium products delivered to your door.
          </p>
        </header>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No products found in the database.</p>
          </div>
        ) : (
          /* Using a larger gap (gap-10) to make it look expensive */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;