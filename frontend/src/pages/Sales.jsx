import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Search, 
  User, 
  CreditCard, 
  Receipt,
  CheckCircle,
  AlertHorizontal,
  RefreshCw,
  X,
  Printer,
  ChevronRight
} from 'lucide-react';

export default function Sales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State-driven premium notifications to replace alert()
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Active cashier / checkout cart states
  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'history'
  const [posSearch, setPosSearch] = useState('');

  // Invoice view modal
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, prodRes, custRes] = await axios.all([
        axios.get('/api/sales'),
        axios.get('/api/products'),
        axios.get('/api/customers')
      ]);

      if (salesRes.data.success) setSales(salesRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
    } catch (err) {
      console.error('Failed to pull POS data:', err);
      setError('Could not retrieve transactional or stock records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // POS CART ACTIONS
  const addToCart = (product) => {
    if (product.stock <= 0) {
      showNotification(`'${product.name}' is currently Sold Out and cannot be billed.`, 'error');
      return;
    }

    const existingIndex = cart.findIndex(item => item.productId === product._id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= product.stock) {
        showNotification(`Insufficient stock remaining for '${product.name}'. Max: ${product.stock}`, 'error');
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
      showNotification(`Added another unit of ${product.name}`, 'info');
    } else {
      setCart([...cart, {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        quantity: 1
      }]);
      showNotification(`Added ${product.name} to checkout cart`, 'success');
    }
  };

  const updateQuantity = (productId, newQty) => {
    const targetProduct = cart.find(item => item.productId === productId);
    if (!targetProduct) return;

    if (newQty > targetProduct.stock) {
      showNotification(`Limit exceeded. Only ${targetProduct.stock} units available in stock.`, 'error');
      return;
    }

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => 
      item.productId === productId ? { ...item, quantity: Number(newQty) } : item
    ));
  };

  const removeFromCart = (productId) => {
    const item = cart.find(i => i.productId === productId);
    setCart(cart.filter(item => item.productId !== productId));
    if (item) {
      showNotification(`Removed ${item.name} from checkout cart`, 'info');
    }
  };

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showNotification('Cart is empty. Please select products to bill.', 'error');
      return;
    }

    try {
      const payload = {
        customerId: selectedCustomerId,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod,
        paymentStatus: 'paid'
      };

      const res = await axios.post('/api/sales', payload);
      if (res.data.success) {
        showNotification('Checkout transaction completed! Invoice logged successfully.', 'success');
        // Reset POS Checkout Form
        setCart([]);
        setSelectedCustomerId('');
        setPaymentMethod('cash');
        // Refresh master counts
        fetchData();
        // Open Invoice details for review
        setViewingInvoice(res.data.data);
      }
    } catch (err) {
      console.error('POS Checkout failed:', err);
      showNotification(err.response?.data?.message || 'Checkout failed.', 'error');
    }
  };

  const handleCancelSale = async (id, invoiceNumber) => {
    if (!window.confirm(`Are you sure you want to Cancel and Delete sale '${invoiceNumber}'? This will restore sold stock back to product registries.`)) {
      return;
    }
    try {
      const res = await axios.delete(`/api/sales/${id}`);
      if (res.data.success) {
        showNotification(`Invoice ${invoiceNumber} cancelled and stock updated.`, 'success');
        fetchData();
      }
    } catch (err) {
      console.error('Cancel transaction failed:', err);
      showNotification(err.response?.data?.message || 'Unable to delete sale.', 'error');
    }
  };

  const filteredPOSProducts = products.filter(prod => 
    prod.name.toLowerCase().includes(posSearch.toLowerCase()) ||
    prod.sku.toLowerCase().includes(posSearch.toLowerCase())
  );

  const getPaymentBadge = (method) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Wire';
      case 'mobile_money':
        return 'Mobile Money';
      case 'card':
        return 'Card Terminal';
      default:
        return 'Cash';
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
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">POS & Sales Accounting</h2>
          <p className="text-sm text-slate-400 mt-0.5">Register counter receipts, search client catalogs, and audit sales invoice logs.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold leading-normal transition cursor-pointer select-none ${activeTab === 'pos' ? 'bg-white/10 text-white shadow-md border border-white/10' : 'text-slate-400 hover:text-white'}`}
          >
            Digital POS Cashier
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold leading-normal transition cursor-pointer select-none ${activeTab === 'history' ? 'bg-white/10 text-white shadow-md border border-white/10' : 'text-slate-400 hover:text-white'}`}
          >
            Invoice Journals
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        /* ======================== POS CASHIER VIEW ======================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Catalog selection (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg flex items-center gap-3">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Terminal SKU search or name query..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-white/10 rounded-lg text-xs bg-white/5 text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition font-medium"
                />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-slate-950/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Add Items to Receipt</h3>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mb-2" />
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Syncing Inventory registers...</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                  {filteredPOSProducts.map(prod => (
                    <div 
                      key={prod._id} 
                      onClick={() => addToCart(prod)}
                      className={`p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition select-none ${prod.stock <= 0 ? 'opacity-40 hover:bg-transparent cursor-not-allowed' : ''}`}
                    >
                      <div className="space-y-1">
                        <p className="font-extrabold text-white text-xs leading-none">{prod.name}</p>
                        <p className="font-mono text-[9px] text-slate-400">SKU: {prod.sku}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span>
                          {prod.stock > 0 ? (
                            <span className="text-slate-300 text-xs">Stock: {prod.stock} Units</span>
                          ) : (
                            <span className="text-red-400 font-extrabold uppercase text-[9px] tracking-wide">Sold Out</span>
                          )}
                        </span>
                        <span className="font-extrabold text-white bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 font-mono">
                          ${prod.price}
                        </span>
                      </div>
                    </div>
                  ))}

                  {filteredPOSProducts.length === 0 && (
                    <div className="p-8 text-center text-slate-400 italic">No products matching filters.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Active Billing Drawer (5 cols) */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-5 sticky top-24 space-y-6">
            <div className="flex items-center gap-2 text-white border-b border-white/10 pb-3">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Active Counter Cart</h3>
            </div>

            {/* Cart Listings */}
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between p-3 border border-white/5 rounded-xl bg-white/5 text-xs">
                  <div className="space-y-1 leading-none max-w-[150px]">
                    <p className="font-extrabold text-white truncate">{item.name}</p>
                    <p className="text-[10px] font-mono text-slate-450 font-bold">Each: ${item.price}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, e.target.value)}
                      className="w-12 text-center py-1 border border-white/10 bg-slate-900 text-white rounded-md font-bold focus:outline-none focus:border-blue-400"
                    />
                    <span className="font-extrabold text-white w-16 text-right font-mono">
                      ${item.price * item.quantity}
                    </span>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-medium italic border border-dashed border-white/10 rounded-xl flex flex-col items-center gap-2 bg-slate-950/20">
                  <Receipt className="w-7 h-7 text-slate-500" />
                  <span>Your receipt cart is empty. Click catalog item to bill.</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-4">
              {/* Billed Client Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Attach CRM Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 border border-white/10 bg-slate-900 focus:bg-slate-800 rounded-lg focus:outline-none cursor-pointer font-semibold text-slate-200 focus:border-blue-400"
                >
                  <option value="">Walk-In Transaction / General Counter</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id} className="text-black">{c.name} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Payment Payment Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Method of Payment</label>
                <div className="grid grid-cols-4 gap-2">
                  {['cash', 'card', 'bank_transfer', 'mobile_money'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-1 text-[9px] font-extrabold uppercase border rounded-lg transition shrink-0 cursor-pointer ${paymentMethod === method ? 'bg-white/15 border-blue-400 text-white shadow-md font-bold' : 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      {method === 'bank_transfer' ? 'Wire' : method === 'mobile_money' ? 'M-Money' : method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aggregated sums */}
              <div className="bg-white/5 p-4 border border-white/10 rounded-xl flex items-center justify-between text-white select-none">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-300">Total Invoice Amount</span>
                <span className="text-xl font-extrabold tracking-tight font-mono text-emerald-350">${calculateCartTotal().toLocaleString()}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 bg-gradient-to-r from-blue-650 to-blue-550 hover:from-blue-600 hover:to-blue-500 font-bold tracking-wide uppercase text-xs text-white rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_24px_rgba(37,99,235,0.45)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" /> Process Checkout (Collect Paid)
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* ======================== HISTORIC LOG SHEET ======================== */
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-7 h-7 animate-spin text-blue-400 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Retrieving transaction journals...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/20 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-4 font-bold">Invoice ID</th>
                    <th className="p-4 font-bold">Billing Customer</th>
                    <th className="p-4 font-bold">Checkout Date</th>
                    <th className="p-4 font-bold text-center">Items billed</th>
                    <th className="p-4 font-bold">Method</th>
                    <th className="p-4 font-bold">Sales Rep</th>
                    <th className="p-4 font-bold text-right">Invoice Sum</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                  {sales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-white/5 transition leading-none">
                      <td className="p-4 font-mono text-blue-400 font-bold">{sale.invoiceNumber}</td>
                      <td className="p-4 font-bold text-white">
                        {sale.customer ? sale.customer.name : <span className="italic font-medium text-slate-500 text-[11px]">Walk-In Client</span>}
                      </td>
                      <td className="p-4 text-slate-400 font-medium">
                        {sale.createdAt ? sale.createdAt.split('T')[0] : '-'}
                      </td>
                      <td className="p-4 text-center">{sale.items ? sale.items.length : 0} items</td>
                      <td className="p-4 uppercase text-[10px]">
                        <span className="px-1.5 py-0.5 border border-white/10 bg-white/5 text-slate-300 rounded font-bold select-none">{getPaymentBadge(sale.paymentMethod)}</span>
                      </td>
                      <td className="p-4 text-slate-400 font-semibold">{sale.salesRep}</td>
                      <td className="p-4 text-right text-emerald-350 font-extrabold font-mono">${(sale.totalAmount || 0).toLocaleString()}</td>
                      
                      <td className="p-4 text-right flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingInvoice(sale)}
                          className="px-2.5 py-1.5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
                        >
                          Invoice Details
                        </button>

                        {isPowerUser && (
                          <button
                            onClick={() => handleCancelSale(sale._id, sale.invoiceNumber)}
                            title="Cancel Sale & Restore Stock"
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 italic">No counter sales recorded yet. Use Digital POS Cashier view to checkout.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Viewing Detailed corporate Invoice receipt */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4 animate-fade-in text-slate-200">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6">
            
            {/* Header branding */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#a5b4fc] leading-none">DAB ENTERPRISE LTD</span>
                <h4 className="text-base font-extrabold text-white">TAX INVOICE RECEIPT</h4>
                <p className="text-[10px] text-slate-400 font-medium">Kigali, Rwanda | Support: system@dab.com</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="font-mono text-xs font-bold uppercase text-blue-400">{viewingInvoice.invoiceNumber}</p>
                <p className="text-[9px] text-slate-450 font-bold">Date: {viewingInvoice.createdAt ? viewingInvoice.createdAt.split('T')[0] : '-'}</p>
              </div>
            </div>

            {/* Bill clients */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold leading-relaxed">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-450">Billed To Client:</span>
                <p className="font-bold text-white mt-0.5 text-xs">{viewingInvoice.customer ? viewingInvoice.customer.name : 'Walk-in Cash Customer'}</p>
                {viewingInvoice.customer?.company && <p className="text-slate-400 font-medium">{viewingInvoice.customer.company}</p>}
                {viewingInvoice.customer?.phone && <p className="text-slate-450 font-medium">{viewingInvoice.customer.phone}</p>}
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-455">Payment particulars:</span>
                <p className="font-bold text-slate-300 mt-0.5">Rep: {viewingInvoice.salesRep}</p>
                <p className="text-slate-300 font-bold uppercase text-[10px]">Method: {getPaymentBadge(viewingInvoice.paymentMethod)}</p>
                <p className="text-emerald-400 font-bold uppercase text-[9px] tracking-wide mt-1">Status: SECURE PAID</p>
              </div>
            </div>

            {/* Invoiced products table */}
            <div className="border border-white/10 rounded-xl overflow-hidden text-xs font-semibold">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/30 text-slate-400 text-[9px] uppercase font-bold border-b border-white/10 tracking-wider">
                    <th className="p-3">Billed Particular</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-350">
                  {(viewingInvoice.items || []).map((item, idx) => (
                    <tr key={idx} className="leading-none text-[11px]">
                      <td className="p-3 font-bold text-white leading-tight">
                        {item.product?.name || 'Unregistered Product'}
                        <span className="block text-[8px] font-mono font-medium text-slate-450 mt-0.5 uppercase">SKU: {item.product?.sku || '-'}</span>
                      </td>
                      <td className="p-3 text-center font-mono">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">${item.price}</td>
                      <td className="p-3 text-right text-emerald-350 font-bold font-mono">${item.subtotal || (item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer total sums */}
            <div className="flex justify-between items-center bg-white/5 p-4 border border-white/10 rounded-xl text-white select-none leading-none">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Grand Total Paid</span>
                <span className="text-[10px] text-slate-450 font-semibold mt-0.5">Varnished details verified</span>
              </div>
              <span className="text-lg font-extrabold tracking-tight font-mono text-emerald-350">${(viewingInvoice.totalAmount || 0).toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Invoice
              </button>
              <button 
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 bg-gradient-to-r from-blue-650 to-blue-550 hover:from-blue-600 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
