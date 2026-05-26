# DAB Enterprise Ltd - Business Management System

A high-performance, responsive, full-stack Web-Based Business Management System custom-engineered for **DAB Enterprise Ltd**. Serves corporate administrators, branch managers, storekeepers, and cashiers dynamically under singular deployment architectures.

---

## 🚀 Key Integrated Features

- **📊 COMMAND DASHBOARD**: Real-time business intelligence showcasing active revenue metrics, average order values, low-stock alerts, taxonomy allocations via Recharts pie-wedges, and time-series performance charts.
- **🛒 DIGITAL POS CASHIER**: A high-fidelity cashier desk to bill walk-in counter receipts. Automatically handles cart deductions, available stock threshold checks, CRM client links, payment methods, and auto-generated invoices.
- **📦 WAREHOUSE CATALOG (PRODUCTS)**: Full CRUD master list of products with unique SKUs, automatic safety points alerts, cost records, and filtering by category taxonomy.
- **🏷️ TAXONOMY CATEGORIES**: Complete CRUD tracking to organize system items.
- **👥 CLIENT CRM**: Customer directories of contact lines, company profiles, and specific account instructions.
- **🚚 SUPPLIERS VENDORS**: Procurement catalog tracking vendor representatives and partner channels.
- **💼 HR STAFF ROSTER**: Personnel roster with roles, salaries, status badges (Active, On Leave, Inactive), and hire dates (Restricted to Admins and Managers).
- **🔒 SECURE JWT AUTH**: Role-based access controls fully protecting API routes server-side and client-side (Roles: `admin`, `manager`, `sales`, `storekeeper`).

---

## 🛠️ Technology Stack

- **Frontend**: React.js 19 with Vite 6.2, Tailwind CSS v4, Lucide Icons, and Recharts.
- **Backend**: Node.js & Express.JS API routes with full async error handlers and JWT authentications.
- **Database**: Zero-dependency local file-based persistent database system. Real-time automatic file serialization ensures data is saved securely across sessions with zero complex setup or database crashes!
- **Automation**: Automatic database self-healing seeder triggers on server boot to pre-populate beautiful mock KPIs!

---

## 🗄️ Folder Structure

```
project-root/
├── backend/
│   └── src/
│       ├── config/        # Local persistent database client
│       ├── controllers/   # Data validation controllers
│       ├── data/          # Persistent serialized JSON tables
│       ├── middleware/    # Role-based JWT middlewares
│       ├── routes/        # Auth, Products, Customers, Sales, and HR endpoints
│       └── seed/          # Preset enterprise data loader
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable structural widgets
│   │   ├── context/       # Auth Hook and Axios defaults header injections
│   │   ├── layouts/       # Main navigation and user headers
│   │   ├── pages/         # Dashboard, Products, POS, HR, and CRM Pages
│   │   ├── App.jsx        # Routing coordinator
│   │   └── index.css      # Core styles with custom system fonts
│   └── index.html         # SPA view canvas
├── server.js              # Unified Full-stack Server coordinator
└── README.md              # Installation guides
```

---

## ⚙️ Fast Access Credentials

On startup, select any of these fast access buttons on the login cards or use the detailed credentials manually:

| Corporate Role | Email Account | Secret Password |
| :--- | :--- | :--- |
| **Corporate Administrator** | `admin@dab.com` | `admin123` |
| **Branch Manager** | `manager@dab.com` | `manager123` |
| **Sales Cashier** | `sales@dab.com` | `sales123` |
| **Warehouse Storekeeper** | `store@dab.com` | `store123` |

---

## 💻 Manual Setup & Execution

### 1. Configure environmental parameters

Ensure the `.env` file at the root holds the required parameters:

```env
PORT=3000
JWT_SECRET=supersecretjwt
```

### 2. Install dependencies

```bash
npm install
```

### 3. Clear or manually seed database (Optional)

Our system automatically seeds itself with lovely business metrics if the server detects empty data folders! If you want to force reset and re-seed, run:

```bash
npm run seed
```

### 4. Direct developer startup

Start the combined backend APIs and hot-reloading React client simultaneously:

```bash
npm run dev
```

Open your browser to: [http://localhost:3000](http://localhost:3000)

---

&copy; 2026 **DAB Enterprise Ltd**. All architectural rights reserved.
