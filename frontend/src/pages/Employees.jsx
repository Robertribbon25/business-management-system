import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Edit, Trash2, X, RefreshCw, Briefcase, Mail, Phone, Calendar, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State-driven micro-toasts
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
    role: 'sales',
    department: 'Sales Department',
    salary: '',
    status: 'active',
    hireDate: ''
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/employees');
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error('Failed to pull employees:', err);
      setError('Could not fetch corporate employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'sales',
      department: 'Direct Sales Department',
      salary: '1500',
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setModalMode('edit');
    setFormData({
      name: emp.name,
      email: emp.email || '',
      phone: emp.phone || '',
      role: emp.role || 'sales',
      department: emp.department || '',
      salary: emp.salary || 0,
      status: emp.status || 'active',
      hireDate: emp.hireDate || ''
    });
    setEditingId(emp._id);
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
        const res = await axios.post('/api/employees', formData);
        if (res.data.success) {
          setIsModalOpen(false);
          showNotification(`Staff record for '${formData.name}' created.`, 'success');
          fetchEmployees();
        }
      } else {
        const res = await axios.put(`/api/employees/${editingId}`, formData);
        if (res.data.success) {
          setIsModalOpen(false);
          showNotification(`Staff record for '${formData.name}' updated.`, 'success');
          fetchEmployees();
        }
      }
    } catch (err) {
      console.error('Save employee failed:', err);
      showNotification(err.response?.data?.message || 'Error occurred while saving employee record.', 'error');
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to dismiss and delete employee '${name}' from active index?`)) return;
    try {
      const res = await axios.delete(`/api/employees/${id}`);
      if (res.data.success) {
        showNotification(`Employee record for '${name}' removed.`, 'success');
        fetchEmployees();
      }
    } catch (err) {
      console.error('Delete employee failed:', err);
      showNotification(err.response?.data?.message || 'Access denied. Only administrators can delete staff logs.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Active
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-400"></span>
            On Leave
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-400"></span>
            Inactive
          </span>
        );
    }
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="space-y-6 text-slate-100 p-4 max-w-7xl mx-auto">
      {/* Floating notifications panel */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl backdrop-blur-md border shadow-2xl transition-all duration-300 flex items-center gap-3 max-w-md ${
          notification.type === 'error' ? 'bg-slate-900/90 border-red-500/30 text-red-400' :
          notification.type === 'success' ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-400' :
          'bg-slate-900/90 border-blue-500/30 text-blue-400'
        }`}>
          {notification.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {notification.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
          <div className="text-sm font-medium text-slate-200">{notification.message}</div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Corporate Staff Directory</h2>
          <p className="text-sm text-slate-400 mt-1">Manage corporate profiles, department structures, payroll references, and roles.</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Recruit Employee
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm text-slate-400 font-medium tracking-wide">Loading staff profiles...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs font-semibold tracking-wider uppercase">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Department</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Contact Info</th>
                  <th className="p-4 font-semibold">Hiring Date</th>
                  <th className="p-4 font-semibold text-right">Compensation</th>
                  <th className="p-4 font-semibold text-center">Duty Status</th>
                  {isAdmin && <th className="p-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-white/[0.02] transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm uppercase shadow-inner shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{emp.name}</p>
                          <p className="font-mono text-[10px] text-slate-500 mt-0.5">ID: #{emp._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{emp.department}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 border border-white/10 bg-white/5 rounded text-xs font-medium text-blue-300 uppercase tracking-wide">
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-4 space-y-1 text-xs text-slate-400">
                      <p className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {emp.email}</p>
                      {emp.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {emp.phone}</p>}
                    </td>
                    <td className="p-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Paperclip className="hidden" /> {/* Placeholder fallback match */}
                        <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{emp.hireDate || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold text-white font-mono">
                      <span className="text-slate-500 font-normal mr-0.5">$</span>
                      {emp.salary ? emp.salary.toLocaleString() : '0'}
                      <span className="text-xs text-slate-500 font-sans font-normal ml-1">/mo</span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">{getStatusBadge(emp.status)}</td>
                    
                    {isAdmin && (
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {employees.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="p-12 text-center text-slate-500 italic">
                      No registered corporate employees found. Recruit to fill the roster.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 text-slate-200 transition-all">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-950/20">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {modalMode === 'create' ? 'Assemble Recruitment File' : 'Amend Employee Records'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Employee Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Kenneth Mugisha"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Corporate Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Mobile Phone</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+250..."
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Title Department</label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Finance & Accounting"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Hiring Date</label>
                  <input
                    type="date"
                    name="hireDate"
                    required
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Salary ($)</label>
                  <input
                    type="number"
                    name="salary"
                    required
                    placeholder="2500"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Corporate Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer font-medium"
                  >
                    <option value="sales">Sales</option>
                    <option value="storekeeper">Storekeeper</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Active Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-white/10 p-2.5 rounded-xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition cursor-pointer shadow-md shadow-blue-600/10"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}