import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Sales from './pages/Sales.jsx';
import Products from './pages/Products.jsx';
import Categories from './pages/Categories.jsx';
import Customers from './pages/Customers.jsx';
import Suppliers from './pages/Suppliers.jsx';
import Employees from './pages/Employees.jsx';
import { RefreshCw } from 'lucide-react';

function ApplicationShell() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Verify that activeTab matches user roles on transition or profile reload
  useEffect(() => {
    if (!user) return;
    
    const rolePermissions = {
      admin: ['dashboard', 'sales', 'products', 'categories', 'customers', 'suppliers', 'employees'],
      manager: ['dashboard', 'sales', 'products', 'categories', 'customers', 'suppliers', 'employees'],
      storekeeper: ['dashboard', 'products', 'categories', 'suppliers'],
      sales: ['dashboard', 'sales', 'products', 'categories', 'customers']
    };

    const allowedTabs = rolePermissions[user.role] || ['dashboard'];
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]); // Reset to safe initial authorized tab
    }
  }, [user, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center font-sans">
        <RefreshCw className="w-10 h-10 animate-spin text-neutral-800 mb-3.5" />
        <h3 className="text-base font-bold text-neutral-900 uppercase tracking-widest leading-none">DAB Enterprise Ltd</h3>
        <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Acquiring Session Authorization...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
      {activeTab === 'sales' && <Sales />}
      {activeTab === 'products' && <Products />}
      {activeTab === 'categories' && <Categories />}
      {activeTab === 'customers' && <Customers />}
      {activeTab === 'suppliers' && <Suppliers />}
      {activeTab === 'employees' && <Employees />}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ApplicationShell />
    </AuthProvider>
  );
}
