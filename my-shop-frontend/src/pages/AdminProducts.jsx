import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Box, X, Upload } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    categoryId: '',
    imageUrl: '', 
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products');
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use FormData for Cloudinary upload
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('description', formData.description);
    data.append('categoryId', formData.categoryId);
    
    if (selectedFile) {
      // CRITICAL: Must match your backend's upload.single('images')
      data.append('images', selectedFile); 
    } else if (formData.imageUrl) {
      data.append('imageUrl', formData.imageUrl); 
    }

    try {
      // Authorization headers are usually handled globally by your API service
      const res = await API.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProducts([res.data, ...products]);
      toast.success("Product saved to Cloudinary!");
      setShowForm(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || "Create failed");
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', stock: '', description: '', categoryId: '', imageUrl: '' });
    setSelectedFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Product removed");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Inventory</h1>
          <p className="text-gray-500">Manage store items via Cloudinary Secure Storage</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Close Form' : 'Add New Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-200 mb-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="name" value={formData.name} placeholder="Product Name" onChange={handleInputChange} required className="p-3 border rounded-xl" />
          <input type="number" name="price" value={formData.price} placeholder="Price" onChange={handleInputChange} required className="p-3 border rounded-xl" />
          <input type="number" name="stock" value={formData.stock} placeholder="Stock Quantity" onChange={handleInputChange} required className="p-3 border rounded-xl" />
          <input type="text" name="categoryId" value={formData.categoryId} placeholder="Category ID" onChange={handleInputChange} className="p-3 border rounded-xl" />
          <textarea name="description" value={formData.description} placeholder="Description" onChange={handleInputChange} className="p-3 border rounded-xl md:col-span-2" />
          
          <div className="md:col-span-2 border-2 border-dashed rounded-xl p-4 flex flex-col items-center">
            <input type="file" id="fileInput" onChange={handleFileChange} className="hidden" />
            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center text-gray-500">
              <Upload className="mb-2" />
              <span>{selectedFile ? selectedFile.name : "Upload image to Cloudinary"}</span>
            </label>
            <input type="text" name="imageUrl" value={formData.imageUrl} placeholder="OR Paste External Image URL" onChange={handleInputChange} className="mt-4 w-full p-2 border rounded-lg text-sm" />
          </div>

          <button type="submit" className="md:col-span-2 bg-gray-900 text-white p-4 rounded-xl font-bold hover:bg-black transition-all">
            Upload Product
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
              {product.images ? (
                <img 
                  // No more localhost checking. Cloudinary links work everywhere!
                  src={product.images} 
                  alt={product.name} 
                  className="object-cover w-full h-full" 
                  onError={(e) => { e.target.src = 'https://placehold.co/300'; }}
                />
              ) : (
                <Box size={40} className="text-gray-200" />
              )}
            </div>
            <h3 className="font-bold text-gray-900">{product.name}</h3>
            <div className="flex justify-between items-center mt-2">
              <p className="text-blue-600 font-black">${parseFloat(product.price).toFixed(2)}</p>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">Stock: {product.stock}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex justify-center py-2 bg-gray-50 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all"><Edit size={18} /></button>
              <button onClick={() => handleDelete(product.id)} className="flex-1 flex justify-center py-2 bg-gray-50 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;