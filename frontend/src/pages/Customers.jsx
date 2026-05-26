import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Edit, Trash2, X, RefreshCw, Search, Phone, Mail, Building } from 'lucide-react';

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State-driven micro-toasts to replace alert()
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Modal drawer
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

  const fetchCustomers = async () => {
    try {
      setLoading(true);
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
          showNotification(`Customer profile and account for '${formData.name}' created.`, 'success');
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

  // Live filter customers on prompt search
  const filteredCustomers = customers.filter(cust => 
    cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cust.email && cust.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (cust.company && cust.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const canDelete = user && ['admin', 'manager'].includes(user.role);

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
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">CRM Directory</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage customer registers, account properties, and corporate contacts.</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-650 to-blue-550 hover:from-blue-600 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Register Customer
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by customer name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-white/10 rounded-lg text-xs leading-none bg-white/5 text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition font-medium"
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-7 h-7 animate-spin text-blue-400 mb-2" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Syncing customers database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/20 text-slate-400 text-[10px] uppercase font-bold tracking-wider font-semibold">
                  <th className="p-4 font-bold">Contact Name</th>
                  <th className="p-4 font-bold">Company / Group</th>
                  <th className="p-4 font-bold">Contact Information</th>
                  <th className="p-4 font-bold">Location Address</th>
                  <th className="p-4 font-bold">Administrative notes</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-slate-350">
                {filteredCustomers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-white/5 transition leading-none">
                    <td className="p-4 font-bold text-white text-xs">{cust.name}</td>
                    <td className="p-4 text-slate-400">
                      {cust.company ? (
                        <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px]">
                          <Building className="w-3.5 h-3.5 text-blue-450" />
                          <span>{cust.company}</span>
                        </div>
                      ) : (
                        <span className="italic text-slate-500 font-medium text-[10px]">Retail Consumer</span>
                      )}
                    </td>
                    <td className="p-4 space-y-1 text-[11px]">
                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3 h-3 text-slate-450 animate-none" />
                          <span>{cust.email}</span>
                        </div>
                      )}
                      {cust.phone && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3 h-3 text-slate-450 animate-none" />
                          <span>{cust.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 max-w-xs text-slate-400 truncate font-semibold">{cust.address || 'Counter Pick-up Only'}</td>
                    <td className="p-4 max-w-xs text-slate-400 truncate font-medium">{cust.notes || '-'}</td>
                    
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cust)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteCustomer(cust._id, cust.name)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition cursor-pointer"
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
                    <td colSpan="6" className="p-8 text-center text-slate-500 italic">No customer records matching search QUERY.</td>
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
                {modalMode === 'create' ? 'Register Customer Profile' : 'Edit Customer Record'}
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Customer Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="doe@corp.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Phone Code</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+250788..."
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Corporate / Company Unit</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Zenith Ltd"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Office Billing Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Kigali, Rwanda"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Internal Accounts Notes</label>
                <textarea
                  name="notes"
                  placeholder="Special billing instructions or comments..."
                  value={formData.notes}
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
                  className="px-4 py-2 bg-gradient-to-r from-blue-650 to-blue-550 hover:from-blue-600 hover:to-blue-500 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
