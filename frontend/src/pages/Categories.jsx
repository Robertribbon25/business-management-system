import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Edit, Trash2, X, RefreshCw, Tags } from 'lucide-react';

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State-driven micro-toasts to replace alert()
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Could not fetch categorisation taxonomies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setModalMode('edit');
    setFormData({ name: cat.name, description: cat.description || '' });
    setEditingId(cat._id);
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
        const res = await axios.post('/api/categories', formData);
        if (res.data.success) {
          setIsModalOpen(false);
          showNotification(`Category '${formData.name}' created successfully.`, 'success');
          fetchCategories();
        }
      } else {
        const res = await axios.put(`/api/categories/${editingId}`, formData);
        if (res.data.success) {
          setIsModalOpen(false);
          showNotification(`Category '${formData.name}' details updated.`, 'success');
          fetchCategories();
        }
      }
    } catch (err) {
      console.error('Save category failed:', err);
      showNotification(err.response?.data?.message || 'Failed to save category.', 'error');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Category '${name}'? This may affect items using it.`)) return;
    try {
      const res = await axios.delete(`/api/categories/${id}`);
      if (res.data.success) {
        showNotification(`Category '${name}' deleted successfully.`, 'success');
        fetchCategories();
      }
    } catch (err) {
      console.error('Delete category failed:', err);
      showNotification(err.response?.data?.message || 'Could not delete category.', 'error');
    }
  };

  const isPowerUser = user && ['admin', 'manager'].includes(user.role);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Floating notifications panel */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl backdrop-blur-xl border shadow-2xl animate-fade-in flex items-center gap-3 ${
          notification.type === 'error' ? 'bg-red-500/15 border-red-500/30 text-red-350' :
          notification.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-350' :
          'bg-blue-500/15 border-blue-500/30 text-blue-350'
        }`}>
          <div className="text-xs font-semibold">{notification.message}</div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Taxonomy Categories</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage taxonomy categories referencing items in the warehouse catalog.</p>
        </div>

        {isPowerUser && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-650 to-blue-550 hover:from-blue-600 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-7 h-7 animate-spin text-blue-400 mb-2" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Syncing categories...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/20 text-slate-400 text-[10px] uppercase font-bold tracking-wider font-semibold">
                  <th className="p-4 font-bold max-w-[120px]">Icon / ID</th>
                  <th className="p-4 font-bold">Category Name</th>
                  <th className="p-4 font-bold">Details</th>
                  {isPowerUser && <th className="p-4 font-bold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-slate-350">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-white/5 transition leading-none">
                    <td className="p-4 text-slate-400 font-mono text-[9px] flex items-center gap-2">
                      <div className="bg-white/5 p-1.5 rounded-md text-white font-medium border border-white/5">
                        <Tags className="w-3.5 h-3.5 text-blue-405" />
                      </div>
                      <span className="text-slate-400 font-mono">#{cat._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="p-4 font-bold text-white text-xs">{cat.name}</td>
                    <td className="p-4 max-w-sm text-slate-400 font-medium truncate">{cat.description || 'No description added yet.'}</td>
                    
                    {isPowerUser && (
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer animate-none"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id, cat.name)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition cursor-pointer animate-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {categories.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500 italic">No categories created yet. Click Add Category to begin.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4 animate-fade-in text-slate-200">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                {modalMode === 'create' ? 'Create New Category' : 'Edit Category Details'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-bold block">Category Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Industrial Automation"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-bold block">Description</label>
                <textarea
                  name="description"
                  placeholder="Brief summary of category scope..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition resize-none font-medium"
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
                  className="px-4 py-2 bg-gradient-to-r from-blue-650 to-blue-550 hover:from-blue-600 hover:to-blue-500 text-white font-bold rounded-lg text-xs leading-none transition cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
