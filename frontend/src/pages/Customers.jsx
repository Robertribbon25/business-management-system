import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Edit, Trash2, X, RefreshCw, Search, Phone, Mail, Building, MapPin, Notebook } from 'lucide-react';

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modal drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: ''
  });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/customers');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to pull customers:', err);
      setError('Could not retrieve customers index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', email: '', phone: '', address: '', company: '', notes: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust) => {
    setModalMode('edit');
    setFormData({
      name: cust.name,
      email: cust.email || '',
      phone: cust.phone || '',
      address: cust.address || '',
      company: cust.company || '',
      notes: cust.notes || ''
    });
    setEditingId(cust._id);
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
        const res = await axios.post('/api/customers', formData);
        if (res.data.success) {
          setIsModalOpen(false);
          showNotification(`Customer profile for '${formData.name}' created.`, 'success');
          fetchCustomers();
        }
      } else {
        const res = await axios.put(`/api/customers/${editingId}`, formData);
        if (res.data.success) {
          setIsModalOpen(false);
          showNotification(`Customer profile for '${formData.name}' updated.`, 'success');
          fetchCustomers();
        }
      }
    } catch (err) {
      console.error('Save customer failure:', err);
      showNotification(err.response?.data?.message || 'Error occurred while saving customer record.', 'error');
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Customer '${name}' from archives?`)) return;
    try {
      const res = await axios.delete(`/api/customers/${id}`);
      if (res.data.success) {
        showNotification(`Customer '${name}' profile removed from archives.`, 'success');
        fetchCustomers();
      }
    } catch (err) {
      console.error('Delete customer failure:', err);
      showNotification(err.response?.data?.message || 'Could not delete customer.', 'error');
    }
  };

  const filteredCustomers = customers.filter(cust => 
    cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cust.email && cust.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (cust.company && cust.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const canDelete = user && ['admin', 'manager'].includes(user.role);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-200 transition-all duration-300">
      
      {/* Toast Notifications */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl backdrop-blur-md border shadow-2xl transition-all duration-300 transform scale-100 flex items-center gap-3 ${
          notification.type === 'error' ? 'bg-red-950/80 border-red-500/30 text-red-200' :
          notification.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200' :
          'bg-slate-900/90 border-slate-700 text-slate-200'
        }`}>
          <span className="text-sm font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white to-slate-400">
            CRM Directory
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage customer registers, account properties, and corporate contacts.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Register Customer
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl shadow-md flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-xl text-sm bg-slate-950/40 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-medium"
          />
        </div>
        {error && <span className="text-xs font-medium text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">{error}</span>}
      </div>

      {/* Main Table / Grid Space */}
      <div className="bg-slate-900/20 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Syncing system database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4 font-semibold">Contact Name</th>
                  <th className="p-4 font-semibold">Company / Group</th>
                  <th className="p-4 font-semibold">Contact Details</th>
                  <th className="p-4 font-semibold">Location Address</th>
                  <th className="p-4 font-semibold">Internal Notes</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredCustomers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 font-semibold text-white whitespace-nowrap">
                      {cust.name}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {cust.company ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-450 border border-blue-500/10">
                          <Building className="w-3.5 h-3.5" />
                          {cust.company}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/10">
                          Retail Consumer
                        </span>
                      )}
                    </td>
                    <td className="p-4 space-y-1 text-xs">
                      {cust.email && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{cust.email}</span>
                        </div>
                      )}
                      {cust.phone && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{cust.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 max-w-xs text-slate-400 truncate">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{cust.address || 'Counter Pick-up Only'}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs text-slate-400 truncate">
                      {cust.notes ? (
                        <div className="flex items-center gap-1.5">
                          <Notebook className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{cust.notes}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(cust)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                          title="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteCustomer(cust._id, cust.name)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-500 font-medium">
                      No customer records matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer / Dialog Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 transition-all">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xl p-6 shadow-2xl scale-100 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white tracking-wide">
                {modalMode === 'create' ? 'Register Customer Profile' : 'Edit Customer Record'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Customer Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-slate-950/40 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="doe@corp.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-slate-950/40 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Phone Connection</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+250 788..."
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-slate-950/40 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Corporate Corporate Unit</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Zenith Ltd"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-slate-950/40 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Office Billing Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Kigali, Rwanda"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-slate-950/40 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Internal Accounts Notes</label>
                <textarea
                  name="notes"
                  placeholder="Special billing instructions, custom provisions, or account comments..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-slate-950/40 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none font-medium"
                />
              </div>

              {/* Action Operations */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/10 text-slate-300 hover:bg-white/5 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/10 transition"
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