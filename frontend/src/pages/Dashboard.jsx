import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  ArrowRight,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard({ setActiveTab }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/dashboard');
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError('Failed to fetch dashboard intelligence. Re-trying...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-neutral-600 mb-2" />
        <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Syncing Corporate Intelligence...</p>
      </div>
    );
  }

  const summary = metrics?.summary || {};
  const recentSales = metrics?.recentSales || [];
  const lowStockAlerts = metrics?.lowStockAlerts || [];
  const revenueTrend = metrics?.revenueTrend || [];
  const topProducts = metrics?.topProducts || [];
  const categoryDistribution = metrics?.categoryDistribution || [];

  const COLORS = ['#3af6bb', '#3b82f6', '#6366f1', '#a855f7', '#06b6d4'];

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Corporate Command Dashboard</h2>
          <p className="text-sm text-slate-400 mt-0.5">Real-time analytical metrics, inventory safety points, and transaction records.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/15 rounded-xl text-white shadow-md transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Force Sync
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-xl hover:shadow-blue-500/5 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest text-opacity-80">Gross Revenue</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20"><DollarSign className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-extrabold tracking-tight mt-3 text-white font-mono">${(summary.totalRevenue || 0).toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-400">
            <span className="font-semibold text-emerald-400">Paid Invoices Only</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-xl hover:shadow-blue-500/5 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest text-opacity-80">Profit Margin</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-extrabold tracking-tight mt-3 text-white font-mono">${(summary.netProfit || 0).toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-400">Cost: ${(summary.totalCostOfGoods || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-xl hover:shadow-blue-500/5 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest text-opacity-80">Avg Sale Value</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20"><ShoppingCart className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-extrabold tracking-tight mt-3 text-white font-mono">${Math.round(summary.avgOrderValue || 0).toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-400">{summary.totalTransactions} transactions total</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-xl hover:shadow-blue-500/5 relative overflow-hidden transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest text-opacity-80">Low Stock SKUs</span>
            <div className={`p-2 rounded-lg border ${summary.lowStockCount > 0 ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse' : 'bg-white/5 text-slate-300 border-white/10'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold tracking-tight mt-3 text-white font-mono">{summary.lowStockCount || 0}</p>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs">
            {summary.lowStockCount > 0 ? (
              <span className="font-semibold text-amber-400">Requires Replenishment</span>
            ) : (
              <span className="font-semibold text-emerald-400">All inventory batches safe</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts & Stock Warning Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Revenue Performance Over Time</h3>
              <p className="text-xs text-slate-400">Aggregated payments collected across active checkout sessions.</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Distribution */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Inventory Allocation</h3>
            <p className="text-xs text-slate-400 mb-6">Grouping total product offerings by taxonomy categorisation.</p>
          </div>

          <div className="h-44 relative flex items-center justify-center">
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} products`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 font-medium italic">Taxonomy records absent.</p>
            )}
          </div>

          <div className="space-y-1.5 mt-4">
            {categoryDistribution.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name}</span>
                </div>
                <span className="font-mono">{entry.value} Items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Top Selling Products, Low Stock warnings, Recent Log sheets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Invoices Table */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-bold">Recent Checkout Invoices</h3>
              <p className="text-xs text-slate-400">Latest business sales recorded across the counters.</p>
            </div>
            <button 
              onClick={() => setActiveTab('sales')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer hover:underline"
            >
              Sales Screen <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 font-bold">Invoice ID</th>
                  <th className="py-2.5 font-bold">Customer</th>
                  <th className="py-2.5 font-bold">Rep</th>
                  <th className="py-2.5 font-bold text-right">Items</th>
                  <th className="py-2.5 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                {recentSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-white/5 transition">
                    <td className="py-3 font-mono text-blue-400">{sale.invoiceNumber}</td>
                    <td className="py-3 text-white">{sale.customerName}</td>
                    <td className="py-3 text-slate-400">{sale.salesRep}</td>
                    <td className="py-3 text-right font-mono">{sale.items ? sale.items.length : 0}</td>
                    <td className="py-3 text-right text-emerald-450 font-bold font-mono">${(sale.totalAmount || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-slate-500 italic font-medium">No sales recorded yet. Try POS Checkout.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts and Top Products */}
        <div className="space-y-6">
          {lowStockAlerts.length > 0 && (
            <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/20 p-5 rounded-xl shadow-xl">
              <div className="flex items-center gap-2 text-amber-300 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Replenishment Priority Alerts</h3>
              </div>
              <p className="text-xs text-slate-300 mb-4 font-semibold">The following items have dropped below their critical stock alert margins and require ordering:</p>

              <div className="space-y-2">
                {lowStockAlerts.map(prod => (
                  <div key={prod._id} className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-lg text-xs leading-none">
                    <div className="space-y-1">
                      <p className="font-bold text-white">{prod.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">SKU: {prod.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-305 border border-amber-500/30 font-extrabold rounded text-[10px] uppercase font-mono">
                        Stock: {prod.stock} / Alert @{prod.minStockAlert}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">Top Volume Items</h3>
            {topProducts.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#fff" fontSize={9} width={90} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                    />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic font-medium pt-8 text-center select-none">Quantity statistics will populate on checkout checkout.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
