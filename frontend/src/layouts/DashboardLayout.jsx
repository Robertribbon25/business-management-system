import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Tags, 
  Users, 
  Truck, 
  Briefcase, 
  LogOut, 
  Menu, 
  X,
  Building2,
  User,
  Clock
} from 'lucide-react';

export default function DashboardLayout({ activeTab, setActiveTab, children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // List of tabs matching the roles
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'sales', 'storekeeper'] },
    { id: 'sales', label: 'POS & Sales Checkout', icon: ShoppingCart, roles: ['admin', 'manager', 'sales'] },
    { id: 'products', label: 'Products Stock', icon: Package, roles: ['admin', 'manager', 'sales', 'storekeeper'] },
    { id: 'categories', label: 'Categories', icon: Tags, roles: ['admin', 'manager', 'sales', 'storekeeper'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['admin', 'manager', 'sales'] },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, roles: ['admin', 'manager', 'storekeeper'] },
    { id: 'employees', label: 'Employees Directory', icon: Briefcase, roles: ['admin', 'manager'] },
  ];

  // Filter menu items by user permissions
  const visibleMenuItems = menuItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  // Safe role colors
  const getRoleBadgeClasses = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-300 border-red-500/20';
      case 'manager':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      case 'storekeeper':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      default:
        return 'bg-green-500/10 text-green-300 border-green-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden antialiased">
      {/* Immersive mesh glow elements in background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/45 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between px-4 sm:px-6 relative z-10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 -ml-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-650 to-blue-550 text-white p-1.5 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <Building2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg leading-none tracking-tight block text-white">DAB Enterprise</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Business Management System</span>
            </div>
          </div>
        </div>

        {/* User profile controls & time display */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-white/5 border border-white/10 py-1.5 px-3 rounded-full backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-slate-300">May 26, 2026</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pl-3 border-l border-white/10">
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-white/20 text-white font-semibold flex items-center justify-center text-sm shadow-md select-none">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-white leading-tight">{user?.name || 'Administrator'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] px-1.5 py-0.2 select-none border rounded font-bold uppercase tracking-wide leading-normal ${getRoleBadgeClasses(user?.role)}`}>
                  {user?.role}
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{user?.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 ml-1 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden z-10">
        {/* Mobile slideover menu backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Navigation Drawer */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-2xl border-r border-white/10 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600/30 text-blue-300 p-1.5 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-white">DAB Enterprise</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 hover:bg-white/5 rounded-lg transition text-slate-450 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                    isActive 
                      ? 'bg-white/10 text-white shadow-md border border-white/15' 
                      : 'text-slate-350 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 bg-slate-950/30">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4.5 h-4.5 text-slate-455" />
              <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-300 text-xs font-bold rounded-md transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-950/20 backdrop-blur-xl border-r border-white/10 shrink-0">
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    isActive 
                      ? 'bg-white/10 text-white shadow-md border border-white/15' 
                      : 'text-slate-355 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-550'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-white/10 bg-slate-950/25 text-xs text-slate-500 text-center font-semibold tracking-wider">
            &copy; 2026 DAB Enterprise Ltd.
          </div>
        </aside>

        {/* Primary Screen Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-transparent">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
