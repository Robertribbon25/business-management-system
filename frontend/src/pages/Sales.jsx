import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

import {
  Trash2,
  ShoppingCart,
  Search,
  Receipt,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Printer
} from 'lucide-react';

export default function Sales() {
  const { user } = useAuth();

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [activeTab, setActiveTab] = useState('pos');
  const [posSearch, setPosSearch] = useState('');

  const [viewingInvoice, setViewingInvoice] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [salesRes, productsRes, customersRes] = await Promise.all([
        axios.get('/api/sales'),
        axios.get('/api/products'),
        axios.get('/api/customers')
      ]);

      if (salesRes.data.success) {
        setSales(salesRes.data.data);
      }

      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }

      if (customersRes.data.success) {
        setCustomers(customersRes.data.data);
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to load sales data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      showNotification('Product out of stock.', 'error');
      return;
    }

    const existing = cart.find(
      (item) => item.productId === product._id
    );

    if (existing) {
      if (existing.quantity >= product.stock) {
        showNotification('Stock limit reached.', 'error');
        return;
      }

      setCart(
        cart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock
        }
      ]);
    }

    showNotification('Product added to cart.', 'success');
  };

  const updateQuantity = (productId, qty) => {
    const updatedQty = Number(qty);

    if (updatedQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: updatedQty }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showNotification('Cart is empty.', 'error');
      return;
    }

    try {
      const payload = {
        customerId: selectedCustomerId,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod,
        paymentStatus: 'paid'
      };

      const res = await axios.post('/api/sales', payload);

      if (res.data.success) {
        showNotification('Sale completed successfully.', 'success');

        setCart([]);
        setSelectedCustomerId('');
        setPaymentMethod('cash');

        fetchData();

        setViewingInvoice(res.data.data);
      }
    } catch (error) {
      console.error(error);

      showNotification(
        error.response?.data?.message || 'Checkout failed.',
        'error'
      );
    }
  };

  const handleDeleteSale = async (id) => {
    const confirmDelete = window.confirm(
      'Delete this sale record?'
    );

    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`/api/sales/${id}`);

      if (res.data.success) {
        showNotification('Sale deleted.', 'success');
        fetchData();
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to delete sale.', 'error');
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(posSearch.toLowerCase())
  );

  const isAdmin =
    user &&
    ['admin', 'manager'].includes(user.role);

  return (
    <div className="space-y-6 text-white">

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 ${
            notification.type === 'error'
              ? 'bg-red-500/20 border-red-500 text-red-300'
              : notification.type === 'success'
              ? 'bg-green-500/20 border-green-500 text-green-300'
              : 'bg-blue-500/20 border-blue-500 text-blue-300'
          }`}
        >
          <AlertCircle className="w-4 h-4" />

          <span className="text-sm font-medium">
            {notification.message}
          </span>

          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Sales Management
          </h1>

          <p className="text-slate-400 text-sm">
            POS and sales tracking
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === 'pos'
                ? 'bg-blue-600'
                : 'bg-slate-800'
            }`}
          >
            POS
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === 'history'
                ? 'bg-blue-600'
                : 'bg-slate-800'
            }`}
          >
            Sales History
          </button>
        </div>
      </div>

      {/* POS */}
      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Products */}
          <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-800">

            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={posSearch}
                  onChange={(e) =>
                    setPosSearch(e.target.value)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-800">

              {loading ? (
                <div className="p-8 flex justify-center">
                  <RefreshCw className="animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No products found
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => addToCart(product)}
                    className="p-4 hover:bg-slate-800 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold">
                        {product.name}
                      </h3>

                      <p className="text-xs text-slate-400">
                        Stock: {product.stock}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        ${product.price}
                      </p>
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-5 bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-5">

            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" />

              <h2 className="font-bold">
                Checkout Cart
              </h2>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">

              {cart.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  Cart is empty
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-slate-800 p-3 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium">
                        {item.name}
                      </h4>

                      <p className="text-xs text-slate-400">
                        ${item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.productId,
                            e.target.value
                          )
                        }
                        className="w-16 bg-slate-700 rounded px-2 py-1 text-center"
                      />

                      <button
                        onClick={() =>
                          removeFromCart(item.productId)
                        }
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                ))
              )}

            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm mb-2">
                Customer
              </label>

              <select
                value={selectedCustomerId}
                onChange={(e) =>
                  setSelectedCustomerId(e.target.value)
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
              >
                <option value="">
                  Walk-in Customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer._id}
                    value={customer._id}
                  >
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment */}
            <div>
              <label className="block text-sm mb-2">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">
                  Bank Transfer
                </option>
                <option value="mobile_money">
                  Mobile Money
                </option>
              </select>
            </div>

            {/* Total */}
            <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-2xl font-bold text-green-400">
                ${calculateTotal().toLocaleString()}
              </span>
            </div>

            {/* Checkout */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />

              Complete Checkout
            </button>

          </div>
        </div>
      ) : (
        /* Sales History */
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">

          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="p-4 text-left">
                  Invoice
                </th>

                <th className="p-4 text-left">
                  Customer
                </th>

                <th className="p-4 text-left">
                  Amount
                </th>

                <th className="p-4 text-left">
                  Payment
                </th>

                <th className="p-4 text-left">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {sales.map((sale) => (
                <tr
                  key={sale._id}
                  className="border-t border-slate-800"
                >
                  <td className="p-4">
                    {sale.invoiceNumber}
                  </td>

                  <td className="p-4">
                    {sale.customer?.name ||
                      'Walk-in'}
                  </td>

                  <td className="p-4 text-green-400 font-bold">
                    $
                    {sale.totalAmount?.toLocaleString()}
                  </td>

                  <td className="p-4 uppercase">
                    {sale.paymentMethod}
                  </td>

                  <td className="p-4 flex gap-2">

                    <button
                      onClick={() =>
                        setViewingInvoice(sale)
                      }
                      className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-xs"
                    >
                      View
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() =>
                          handleDeleteSale(sale._id)
                        }
                        className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

      {/* Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg">

            <div className="flex justify-between items-center mb-6">

              <div>
                <h2 className="text-xl font-bold">
                  Invoice
                </h2>

                <p className="text-slate-400 text-sm">
                  {viewingInvoice.invoiceNumber}
                </p>
              </div>

              <button
                onClick={() =>
                  setViewingInvoice(null)
                }
              >
                <X />
              </button>

            </div>

            <div className="space-y-4">

              {(viewingInvoice.items || []).map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b border-slate-800 pb-2"
                  >
                    <div>
                      <p className="font-medium">
                        {item.product?.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-bold">
                      $
                      {(
                        item.price * item.quantity
                      ).toLocaleString()}
                    </p>
                  </div>
                )
              )}

            </div>

            <div className="mt-6 flex justify-between items-center">

              <div className="text-xl font-bold text-green-400">
                $
                {viewingInvoice.totalAmount?.toLocaleString()}
              </div>

              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}