import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  X, 
  RefreshCw
} from 'lucide-react';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State-driven micro-toasts to replace alert()
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // Automatically clear notifications safely
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4500);
    return () => clearTimeout(timer);
  }, [notification]);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    supplierId: '',
    price: '',
    cost: '',
    stock: '',
    minStockAlert: '5',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, supRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/categories'),
        axios.get('/api/suppliers')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (supRes.data.success) setSuppliers(supRes.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching Products logs:', err);
      setError('Failed to fetch stock or master records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      sku: `DAB-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: categories[0]?._id || '',
      supplierId: suppliers[0]?._id || '',
      price: '',
      cost: '',
      stock: '10',
      minStockAlert: '5',
      description: ''
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setModalMode('edit');
    setFormData({
      name: prod.name,
      sku: prod.sku,
      categoryId: prod.categoryId || '',
      supplierId: prod.supplierId || '',
      price: prod.price,
      cost: prod.cost,
      stock: prod.stock,
      minStockAlert: prod.minStockAlert,
      description: prod.description || ''
    });
    setEditingId(prod._id);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const res = await axios.post('/api/products', formData);
        if (res.data.success) {
          setIsModalOpen(false);
          showNotification(`Product SKU '${formData.sku}' created successfully.`, 'success');
          fetchData();
        }
      } else {
        const res = await axios.put(`/api/products/${editingId}`, formData);
        if (res.data.success) {
          setIsModalOpen(false);
          showNotification(`Product '${formData.name}' details updated.`, 'success');
          fetchData();
        }
      }
    } catch (err) {
      console.error('Save product failed:', err);
      showNotification(err.response?.data?.message || 'Failed saving product records.', 'error');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to completely delete Product '${name}'? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await axios.delete(`/api/products/${id}`);
      if (res.data.success) {
        showNotification(`Product '${name}' deleted successfully.`, 'success');
        fetchData();
      }
    } catch (err) {
      console.error('Delete product failed:', err);
      showNotification(err.response?.data?.message || 'Access denied or server error while deleting product.', 'error');
    }
  };

  // Perform client side live filtering
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prod.categoryId === selectedCategory;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && Number(prod.stock) <= Number(prod.minStockAlert));
    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockBadge = (prod) => {
    const isLow = Number(prod.stock) <= Number(prod.minStockAlert);
    if (prod.stock === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/15 text-red-300 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider">
          <AlertTriangle className="w-3 h-3 text-red-400" /> Out of stock
        </span>
      );
    }
    if (isLow) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 text-yellow-300 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
          <AlertTriangle className="w-3 h-3 text-yellow-400" /> Low Stock ({prod.stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
        Normal ({prod.stock})
      </span>
    );
  };

  const canModify = user && ['admin', 'manager', 'storekeeper'].includes(user.role);
  const canDelete = user && ['admin', 'manager'].includes(user.role);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Floating notifications panel */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 ${
          notification.type === 'error' ? 'bg-red-500/15 border-red-500/30 text-red-400' :
          notification.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
          'bg-blue-500/15 border-blue-500/30 text-blue-400'
        }`}>
          <div className="text-xs font-semibold">{notification.message}</div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Products Master List</h2>
          <p className="text-sm text-slate-400 mt-0.5">Track, edit, and audit real-time warehouse inventory quantities.</p>
        </div>
        
        {canModify && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product SKU
          </button>
        )}
      </div>

      {/* Dynamic filters bar */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-white/10 rounded-lg text-xs bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 border border-white/10 bg-slate-900 rounded-lg text-xs leading-none font-semibold text-slate-200 focus:outline-none focus:bg-slate-800 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Status:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="py-1.5 px-3 border border-white/10 bg-slate-900 rounded-lg text-xs leading-none font-semibold text-slate-200 focus:outline-none focus:bg-slate-800 cursor-pointer"
            >
              <option value="all">Display All Stock</option>
              <option value="low">Under Supply Warning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message Panel */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Stock Table */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-7 h-7 animate-spin text-blue-400 mb-2" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Synchronising Warehouse SKU registries...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/20 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-4 font-bold">Product SKU</th>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold text-right">Unit Price</th>
                  <th className="p-4 font-bold text-right">Ref Cost</th>
                  <th className="p-4 font-bold text-center">Quantities Remaining</th>
                  {canModify && <th className="p-4 font-bold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                {filteredProducts.map((prod) => (
                  <tr key={prod._id} className="hover:bg-white/5 transition leading-none">
                    <td className="p-4 font-mono text-blue-400 font-bold">{prod.sku}</td>
                    <td className="p-4 font-extrabold max-w-xs truncate text-white" title={prod.description}>
                      {prod.name}
                    </td>
                    <td className="p-4 text-slate-400 font-semibold">
                      {prod.category?.name || 'Unassigned'}
                    </td>
                    <td className="p-4 text-right text-white font-bold font-mono">${prod.price}</td>
                    <td className="p-4 text-right text-slate-400 font-mono">${prod.cost || 0}</td>
                    <td className="p-4 text-center">{getStockBadge(prod)}</td>
                    
                    {canModify && (
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            title="Edit"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteProduct(prod._id, prod.name)}
                              title="Delete SKU"
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 italic font-medium">
                      No products found. Refine your search or categories.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Creation & Update Modal drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4 text-slate-200">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                {modalMode === 'create' ? 'Create New Product Record' : 'Edit Product Particulars'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product SKU Code</label>
                  <input
                    type="text"
                    name="sku"
                    required
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg font-mono focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-500 transition font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Display Title Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Grinding Drill XL"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-500 transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Taxonomy Category</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-slate-900 text-white focus:bg-slate-800 focus:border-blue-500 transition cursor-pointer font-medium"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Supplier Partner</label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-slate-900 text-white focus:bg-slate-800 focus:border-blue-500 transition cursor-pointer font-medium"
                  >
                    <option value="" disabled>Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selling Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    placeholder="350"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-500 transition font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Production/Unit Cost ($)</label>
                  <input
                    type="number"
                    name="cost"
                    required
                    placeholder="180"
                    value={formData.cost}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-500 transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Stock Count</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    placeholder="15"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-500 transition font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock Alert Warning Point</label>
                  <input
                    type="number"
                    name="minStockAlert"
                    required
                    placeholder="5"
                    value={formData.minStockAlert}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-500 transition font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Technical Details & Description</label>
                <textarea
                  name="description"
                  placeholder="Insert technical size weight rating..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-500 transition resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/10 text-slate-400 hover:bg-white/5 rounded-lg text-xs leading-none font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg text-xs leading-none transition cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}