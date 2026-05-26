import express from 'express';
import { db } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, (req, res) => {
  try {
    const sales = db.sales.find();
    const products = db.products.find();
    const customers = db.customers.find();
    const suppliers = db.suppliers.find();
    const employees = db.employees.find();
    const categories = db.categories.find();

    // 1. Calculate Financial KPIs
    let totalRevenue = 0;
    let totalCostOfGoods = 0;
    let paidTransactions = 0;

    sales.forEach(sale => {
      if (sale.paymentStatus === 'paid') {
        totalRevenue += sale.totalAmount || 0;
        // calculate subtotal cost of goods
        if (sale.items) {
          sale.items.forEach(item => {
            totalCostOfGoods += (item.cost || 0) * (item.quantity || 0);
          });
        }
      }
      paidTransactions++;
    });

    const netProfit = totalRevenue - totalCostOfGoods;
    const avgOrderValue = paidTransactions > 0 ? (totalRevenue / paidTransactions) : 0;

    // 2. Low Stock Alerts
    const lowStockAlerts = products.filter(p => Number(p.stock) <= Number(p.minStockAlert || 5));

    // 3. Category distribution (Product counts per category)
    const categoryDistribution = categories.map(cat => {
      const prodsInCat = products.filter(p => String(p.categoryId) === String(cat._id));
      return {
        name: cat.name,
        value: prodsInCat.length
      };
    }).filter(item => item.value > 0);

    // If empty category, add placeholder list
    if (categoryDistribution.length === 0) {
      categoryDistribution.push({ name: 'General', value: products.length });
    }

    // 4. Sales over time line chart (group by Date string YYYY-MM-DD, last 7 entries)
    const salesByDate = {};
    sales.forEach(sale => {
      const dateStr = sale.createdAt ? sale.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
      const amount = sale.totalAmount || 0;
      salesByDate[dateStr] = (salesByDate[dateStr] || 0) + amount;
    });

    // Convert to sorted array
    const revenueTrend = Object.keys(salesByDate)
      .sort()
      .slice(-7)
      .map(date => ({
        date,
        revenue: salesByDate[date]
      }));

    if (revenueTrend.length === 0) {
      // populate seed timeline if empty
      const today = new Date().toISOString().split('T')[0];
      revenueTrend.push({ date: today, revenue: 0 });
    }

    // 5. Hydrate Recent sales
    const sortedRecentSales = [...sales]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(sale => {
        const customer = sale.customerId ? db.customers.findById(sale.customerId) : null;
        return {
          ...sale,
          customerName: customer ? customer.name : 'Walk-in Customer'
        };
      });

    // 6. Top Products
    const productSalesMap = {};
    sales.forEach(sale => {
      if (sale.items) {
        sale.items.forEach(item => {
          const product = db.products.findById(item.productId);
          if (product) {
            productSalesMap[product.name] = (productSalesMap[product.name] || 0) + item.quantity;
          }
        });
      }
    });

    const topProducts = Object.keys(productSalesMap)
      .map(name => ({ name, sales: productSalesMap[name] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalCostOfGoods,
          netProfit,
          avgOrderValue,
          totalTransactions: sales.length,
          totalProducts: products.length,
          totalCustomers: customers.length,
          totalSuppliers: suppliers.length,
          totalEmployees: employees.length,
          lowStockCount: lowStockAlerts.length
        },
        lowStockAlerts,
        categoryDistribution,
        revenueTrend,
        topProducts,
        recentSales: sortedRecentSales
      }
    });
  } catch (error) {
    console.error('Failed to compile dashboard metrics:', error);
    res.status(500).json({ success: false, message: 'Server error compiling dashboard trends' });
  }
});

export default router;
