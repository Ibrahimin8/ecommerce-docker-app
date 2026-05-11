import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Plus, Edit, Trash2, Box, X, Upload, Save, 
  Image as ImageIcon, Search, AlertTriangle, Loader2 
} from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    categoryId: '',
    imageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products');
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to load products");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, imageUrl: '' })); // Clear URL if file is chosen
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
      categoryId: product.categoryId || '',
      imageUrl: product.images && !product.images.startsWith('/uploads/') ? product.images : '',
    });
    setPreviewUrl(product.images?.startsWith('/uploads/') ? `http://localhost:5003${product.images}` : product.images);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: '', price: '', stock: '', description: '', categoryId: '', imageUrl: '' });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    if (selectedFile) {
      data.append('image', selectedFile);
    }

    try {
      if (editingProduct) {
        const res = await API.put(`/products/${editingProduct.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProducts(products.map(p => p.id === editingProduct.id ? res.data.product : p));
        toast.success("Product updated!");
      } else {
        const res = await API.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProducts([res.data, ...products]);
        toast.success("Product created!");
      }
      closeForm();
    } catch (err) {
      toast.error(err.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="font-bold text-gray-500">Syncing Inventory...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Inventory</h1>
          <p className="text-gray-500 font-medium">Manage stock, pricing, and product details.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => (showForm ? closeForm() : setShowForm(true))}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${
              showForm ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100'
            }`}
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            <span className="hidden sm:inline">{showForm ? 'Cancel' : 'Add Product'}</span>
          </button>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 mb-10 shadow-2xl shadow-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="space-y-4">
            <h2 className="font-black text-2xl text-gray-800 mb-4 flex items-center gap-2">
              <Edit className="text-blue-600" size={24} />
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h2>
            
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400 outline-none font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Price ($)</label>
                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400 outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Stock</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400 outline-none font-bold" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400 outline-none font-medium appearance-none">
                <option value="">Select a category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1 pt-10">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-400 outline-none font-medium" />
            </div>

            <div className="relative group overflow-hidden bg-gray-50 rounded-2xl h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto text-gray-300 group-hover:text-blue-400 transition-colors" size={32} />
                  <p className="text-xs font-bold text-gray-400 mt-2">Upload Image</p>
                </div>
              )}
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <button type="submit" className="w-full bg-gray-900 text-white p-5 rounded-2xl font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg">
              <Save size={20} />
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-[2rem] border border-gray-100 p-4 hover:shadow-xl transition-all group flex flex-col">
            <div className="aspect-square rounded-[1.5rem] bg-gray-50 mb-4 overflow-hidden relative">
              {product.images ? (
                <img 
                  src={product.images.startsWith('/uploads/') ? `http://localhost:5003${product.images}` : product.images} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={40} className="text-gray-200" /></div>
              )}
              
              {product.stock <= 5 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                  <AlertTriangle size={10} /> Low Stock
                </div>
              )}
            </div>

            <div className="flex-1 px-2">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                {categories.find(c => c.id === product.categoryId)?.name || 'General'}
              </p>
              <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
              <div className="flex justify-between items-center mt-3">
                <p className="text-xl font-black text-gray-900">${parseFloat(product.price).toFixed(2)}</p>
                <p className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">Qty: {product.stock}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <button onClick={() => startEdit(product)} className="py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(product.id)} className="py-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;