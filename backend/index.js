import express from 'express';
import cors from 'cors';
import { db, initDatabase, seedDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

initDatabase();
seedDatabase();

function mapUser(row) {
  if (!row) return null;
  return {
    user_id: row.user_id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

// Auth
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Admin auth via dedicated table (username: admin, password: admin123)
  const normalizedUsername = username.trim().toLowerCase();
  const admin = db.prepare('SELECT * FROM admin WHERE LOWER(username) = ?').get(normalizedUsername);
  if (admin && admin.password === password) {
    return res.json({
      user: {
        user_id: admin.admin_id,
        name: 'Admin',
        email: admin.username,
        role: 'admin',
      },
    });
  }

  // Fallback to users table (manager/employee etc.)
  const stmt = db.prepare('SELECT * FROM users WHERE email = ? OR name = ?');
  const user = stmt.get(username, username);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  return res.json({ user: mapUser(user) });
});

// Generic helpers — idCol is optional; defaults derived from table name but can be overridden
function createCrudRoutes(path, table, idCol) {
  // Derive the primary key column name automatically, with override support
  const resolvedIdCol = idCol || (() => {
    // Finance transactions → transaction_id, sales_orders → order_id, others → <table_singular>_id
    if (table === 'finance_transactions') return 'transaction_id';
    if (table === 'sales_orders') return 'order_id';
    // Default: strip trailing 's' then append '_id'
    return `${table.replace(/s$/, '')}_id`;
  })();

  app.get(`/api/${path}`, (req, res) => {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    res.json(rows);
  });

  app.get(`/api/${path}/:id`, (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE ${resolvedIdCol} = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  app.post(`/api/${path}`, (req, res) => {
    const body = req.body || {};
    const keys = Object.keys(body);
    if (!keys.length) return res.status(400).json({ error: 'Body required' });
    const cols = keys.join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const stmt = db.prepare(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`);
    const info = stmt.run(...keys.map(k => body[k]));
    const row = db.prepare(`SELECT * FROM ${table} WHERE rowid = ?`).get(info.lastInsertRowid);
    res.status(201).json(row);
  });

  app.put(`/api/${path}/:id`, (req, res) => {
    const body = req.body || {};
    const keys = Object.keys(body);
    if (!keys.length) return res.status(400).json({ error: 'Body required' });
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const stmt = db.prepare(`UPDATE ${table} SET ${setClause} WHERE ${resolvedIdCol} = ?`);
    const info = stmt.run(...keys.map(k => body[k]), req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
    const row = db.prepare(`SELECT * FROM ${table} WHERE ${resolvedIdCol} = ?`).get(req.params.id);
    res.json(row);
  });

  app.delete(`/api/${path}/:id`, (req, res) => {
    const stmt = db.prepare(`DELETE FROM ${table} WHERE ${resolvedIdCol} = ?`);
    const info = stmt.run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  });
}

createCrudRoutes('products', 'products');
createCrudRoutes('employees', 'employees');
createCrudRoutes('production', 'production');
createCrudRoutes('inventory', 'inventory');
// Standardised paths used by frontend
createCrudRoutes('sales', 'sales_orders', 'order_id');
createCrudRoutes('finance', 'finance_transactions', 'transaction_id');
createCrudRoutes('users', 'users');
// Backwards-compatible aliases
createCrudRoutes('sales-orders', 'sales_orders', 'order_id');
createCrudRoutes('finance-transactions', 'finance_transactions', 'transaction_id');

// Aggregated data for dashboard
app.get('/api/dashboard/summary', (req, res) => {
  const totals = {
    totalProduction: db.prepare('SELECT COALESCE(SUM(quantity),0) as v FROM production').get().v,
    totalScrap: db.prepare('SELECT COALESCE(SUM(scrap),0) as v FROM production').get().v,
    totalRevenue: db.prepare("SELECT COALESCE(SUM(CASE WHEN type = 'revenue' THEN amount END),0) as v FROM finance_transactions").get().v,
    totalExpense: db.prepare("SELECT COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END),0) as v FROM finance_transactions").get().v,
    employees: db.prepare('SELECT COUNT(*) as c FROM employees').get().c,
    activeOrders: db.prepare('SELECT COUNT(*) as c FROM sales_orders').get().c,
    inventoryLevel: db.prepare('SELECT COALESCE(SUM(stock_level),0) as v FROM inventory').get().v,
  };

  const productionTrend = db.prepare(`
    SELECT substr(date,1,7) as month, SUM(quantity) as production
    FROM production
    GROUP BY month
    ORDER BY month
  `).all();

  const salesByRegion = db.prepare(`
    SELECT region, SUM(total_amount) as revenue
    FROM sales_orders
    GROUP BY region
  `).all();

  const inventoryByWarehouse = db.prepare(`
    SELECT warehouse as name, SUM(stock_level) as value
    FROM inventory
    GROUP BY warehouse
  `).all();

  const revenueExpensesByMonth = db.prepare(`
    SELECT substr(date,1,7) as month,
      SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as revenue,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM finance_transactions
    GROUP BY month
    ORDER BY month
  `).all();

  const employeesByDepartment = db.prepare(`
    SELECT department as name, COUNT(*) as value
    FROM employees
    GROUP BY department
  `).all();

  const productionByPlant = db.prepare(`
    SELECT plant, SUM(quantity) as qty
    FROM production
    GROUP BY plant
  `).all();

  res.json({
    totals,
    productionTrend,
    salesByRegion,
    inventoryByWarehouse,
    revenueExpensesByMonth,
    employeesByDepartment,
    productionByPlant,
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server listening on http://localhost:${PORT}`);
});

