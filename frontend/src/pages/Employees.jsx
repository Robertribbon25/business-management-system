import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Edit, Trash2, X, RefreshCw, Briefcase, Mail, Phone, Calendar, DollarSign } from 'lucide-react';

export default function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
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
    role: 'sales',
    department: 'Sales Department',
    salary: '',
    status: 'active',
    hireDate: ''
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-emerald-500/15 text-[#86efac] border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wide">
            Active
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-amber-500/15 text-[#fde047] border border-amber-500/30 text-[10px] font-bold uppercase tracking-wide">
            On Leave
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[10px] font-bold uppercase tracking-wide">
            Inactive
          </span>
        );
    }
  };

  const isAdmin = user && user.role === 'admin';

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
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white cursor-pointer select-none">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Corporate Staff Directory</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage personnel, structural departments, payroll references, and corporate roles.</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-650 to-blue-550 hover:from-blue-600 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Recruit Employee
          </button>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-7 h-7 animate-spin text-blue-400 mb-2" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading staff profiles...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/20 text-slate-400 text-[10px] uppercase font-bold tracking-wider font-semibold">
                  <th className="p-4 font-bold">Employee Name</th>
                  <th className="p-4 font-bold">Department</th>
                  <th className="p-4 font-bold">Security Role</th>
                  <th className="p-4 font-bold">Emails / Phones</th>
                  <th className="p-4 font-bold">Hiring Date</th>
                  <th className="p-4 font-bold text-right">Compensation</th>
                  <th className="p-4 font-bold text-center">Duty Status</th>
                  {isAdmin && <th className="p-4 font-bold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-slate-350">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-white/5 transition leading-none">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/20 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{emp.name}</p>
                          <p className="font-mono text-[9px] text-slate-500 mt-1">ID: #{emp._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-305 font-bold">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Briefcase className="w-3.5 h-3.5 text-blue-450" />
                        <span>{emp.department}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold uppercase text-[9px] text-[#93c5fd] leading-none">
                      <span className="px-1.5 py-0.5 border border-white/10 bg-white/5 rounded shrink-0">{emp.role}</span>
                    </td>
                    <td className="p-4 space-y-1 text-[11px] text-slate-400 font-medium">
                      <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-450" /> {emp.email}</p>
                      {emp.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-450" /> {emp.phone}</p>}
                    </td>
                    <td className="p-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-450" />
                        <span>{emp.hireDate || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-white font-mono text-xs">
                      <span className="text-slate-450 font-medium">$</span>{emp.salary ? emp.salary.toLocaleString() : '0'} <span className="text-[10px] text-slate-500 font-medium font-sans">/mo</span>
                    </td>
                    <td className="p-4 text-center">{getStatusBadge(emp.status)}</td>
                    
                    {isAdmin && (
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition cursor-pointer"
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
                    <td colSpan="8" className="p-8 text-center text-slate-500 italic">No registered corporate employees. Recruit to fill the roster.</td>
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
                {modalMode === 'create' ? 'Assemble Recruitment File' : 'Amend Employee Records'}
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Employee Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Kenneth Mugisha"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Government Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@dab.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Mobile Phone</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+250..."
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Title Department</label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Finance & Accounting"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Hiring Date</label>
                  <input
                    type="date"
                    name="hireDate"
                    required
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Monthly Salary ($)</label>
                  <input
                    type="number"
                    name="salary"
                    required
                    placeholder="2500"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-white/5 text-white focus:bg-white/10 focus:border-blue-550 transition font-medium"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Corporate Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-slate-900 text-white focus:bg-slate-850 focus:border-blue-550 transition cursor-pointer font-bold uppercase text-[10px] font-semibold"
                  >
                    <option value="sales">Sales</option>
                    <option value="storekeeper">Storekeeper</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-bold">Active Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-white/10 p-2.5 rounded-lg focus:outline-none bg-slate-900 text-white focus:bg-slate-850 focus:border-blue-550 transition cursor-pointer font-bold uppercase text-[10px] font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
