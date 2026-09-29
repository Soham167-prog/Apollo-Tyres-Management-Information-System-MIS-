import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'mis.db');

export const db = new Database(dbPath);

export function initDatabase() {
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','manager','employee'))
    );

    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      tyre_type TEXT NOT NULL,
      vehicle_type TEXT NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employees (
      employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      salary REAL NOT NULL,
      join_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production (
      production_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(product_id),
      plant TEXT NOT NULL,
      machine_id TEXT,
      quantity INTEGER NOT NULL,
      scrap INTEGER NOT NULL,
      date TEXT NOT NULL,
      created_by INTEGER REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS inventory (
      inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(product_id),
      warehouse TEXT NOT NULL,
      stock_level INTEGER NOT NULL,
      reorder_level INTEGER NOT NULL,
      updated_by INTEGER REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS sales_orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(product_id),
      customer_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      region TEXT NOT NULL,
      date TEXT NOT NULL,
      created_by INTEGER REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS finance_transactions (
      transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('revenue','expense')),
      amount REAL NOT NULL,
      department TEXT NOT NULL,
      date TEXT NOT NULL
    );
  `);
}

// ─── Deterministic helpers (seeded pseudo-random so output is always the same) ─
function seededRand(seed) {
  // Simple LCG pseudo-random (returns 0..1)
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;
  return ((a * seed + c) % m) / m;
}

function deterministicPick(arr, seed) {
  return arr[Math.floor(seededRand(seed) * arr.length)];
}

function deterministicInt(min, max, seed) {
  return min + Math.floor(seededRand(seed) * (max - min + 1));
}

function deterministicDate(startYear, endYear, seed) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + seededRand(seed) * (end - start)).toISOString().split('T')[0];
}

// ─── Apollo Tyres specific data (matches sampleData.ts) ──────────────────────
const APOLLO_PRODUCTS = [
  { name: 'Alnac 4G',            tyre_type: 'Radial',    vehicle_type: 'Passenger Car', price: 4500  },
  { name: 'Amazer 4G Life',      tyre_type: 'Tubeless',  vehicle_type: 'Passenger Car', price: 3800  },
  { name: 'Aspire 4G',           tyre_type: 'Radial',    vehicle_type: 'Passenger Car', price: 5200  },
  { name: 'Alnac 4G Plus',       tyre_type: 'Tubeless',  vehicle_type: 'Passenger Car', price: 5800  },
  { name: 'Apterra HT2',         tyre_type: 'Radial',    vehicle_type: 'Off Road',      price: 8500  },
  { name: 'Apterra AT2',         tyre_type: 'Radial',    vehicle_type: 'Off Road',      price: 9200  },
  { name: 'EnduRace RT',         tyre_type: 'Radial',    vehicle_type: 'Truck',         price: 12000 },
  { name: 'EnduRace RD',         tyre_type: 'Bias',      vehicle_type: 'Truck',         price: 11500 },
  { name: 'EnduMile LM',         tyre_type: 'Bias',      vehicle_type: 'Truck',         price: 10800 },
  { name: 'EnduRace RA',         tyre_type: 'Radial',    vehicle_type: 'Truck',         price: 13500 },
  { name: 'Acti ZIP R3',         tyre_type: 'Tubeless',  vehicle_type: 'Two Wheeler',   price: 1200  },
  { name: 'Acti Grip R4',        tyre_type: 'Tube-type', vehicle_type: 'Two Wheeler',   price: 950   },
  { name: 'Trampliner XL',       tyre_type: 'Radial',    vehicle_type: 'Off Road',      price: 15000 },
  { name: 'Vredestein Quatrac',  tyre_type: 'Radial',    vehicle_type: 'Passenger Car', price: 7800  },
  { name: 'Vredestein Ultrac',   tyre_type: 'Radial',    vehicle_type: 'Passenger Car', price: 8900  },
  { name: 'Acti ZIP F3',         tyre_type: 'Tubeless',  vehicle_type: 'Two Wheeler',   price: 1100  },
  { name: 'EnduMile HD',         tyre_type: 'Bias',      vehicle_type: 'Truck',         price: 11000 },
  { name: 'Apterra HP',          tyre_type: 'Radial',    vehicle_type: 'Off Road',      price: 9800  },
  { name: 'Amazer XP',           tyre_type: 'Tubeless',  vehicle_type: 'Passenger Car', price: 4200  },
  { name: 'Acti Grip S1',        tyre_type: 'Tube-type', vehicle_type: 'Two Wheeler',   price: 850   },
];

const PLANTS       = ['Chennai Plant', 'Gujarat Plant', 'Hungary Plant', 'Netherlands Plant'];
const WAREHOUSES   = ['Chennai Warehouse', 'Gujarat Warehouse', 'Mumbai Warehouse', 'Delhi Warehouse', 'Budapest Warehouse'];
const REGIONS      = ['North India', 'South India', 'West India', 'East India', 'Europe', 'Middle East', 'Southeast Asia'];
const DEPARTMENTS  = ['Production', 'Sales', 'Finance', 'HR', 'R&D', 'Quality', 'Logistics', 'IT'];
const CUSTOMERS    = ['Tata Motors', 'Mahindra', 'Maruti Suzuki', 'Ashok Leyland', 'Bajaj Auto', 'Hero MotoCorp', 'TVS Motor', 'Hyundai India', 'Kia India', 'MG Motor', 'Toyota India', 'Honda Cars', 'Ford India', 'Renault India', 'Volkswagen India'];

// ─── Detect if table has old generic seeded data ──────────────────────────────
function hasGenericProducts() {
  const row = db.prepare("SELECT COUNT(*) as c FROM products WHERE product_name LIKE 'Product %'").get();
  return row.c > 0;
}

// ─── Clear only the 5 tables (leaves employees & users untouched) ─────────────
function clearDataTables() {
  db.exec(`
    DELETE FROM finance_transactions;
    DELETE FROM sales_orders;
    DELETE FROM inventory;
    DELETE FROM production;
    DELETE FROM products;
  `);
  // Reset autoincrement counters
  db.exec(`
    DELETE FROM sqlite_sequence WHERE name IN ('finance_transactions','sales_orders','inventory','production','products');
  `);
}

function seedDataTables(adminId, managerId, employeeId) {
  const insertProduct  = db.prepare('INSERT INTO products (product_name, tyre_type, vehicle_type, price) VALUES (?, ?, ?, ?)');
  const insertProd     = db.prepare('INSERT INTO production (product_id, plant, machine_id, quantity, scrap, date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertInv      = db.prepare('INSERT INTO inventory (product_id, warehouse, stock_level, reorder_level, updated_by) VALUES (?, ?, ?, ?, ?)');
  const insertSales    = db.prepare('INSERT INTO sales_orders (product_id, customer_name, quantity, total_amount, region, date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertFinance  = db.prepare('INSERT INTO finance_transactions (type, amount, department, date) VALUES (?, ?, ?, ?)');

  const tx = db.transaction(() => {
    // Insert 20 Apollo Tyres products
    const productIds = [];
    for (const p of APOLLO_PRODUCTS) {
      const info = insertProduct.run(p.name, p.tyre_type, p.vehicle_type, p.price);
      productIds.push({ id: info.lastInsertRowid, price: p.price });
    }

    // 100 production records (deterministic)
    for (let i = 0; i < 100; i++) {
      const seed   = i * 7 + 1;
      const pidx   = Math.floor(seededRand(seed)     * productIds.length);
      const p      = productIds[pidx];
      const qty    = deterministicInt(100, 2000,      seed * 3);
      const scrap  = deterministicInt(1, Math.max(1, Math.floor(qty * 0.08)), seed * 5);
      const plant  = deterministicPick(PLANTS,        seed * 11);
      const machId = `M${deterministicInt(1, 20,      seed * 13)}`;
      const date   = deterministicDate(2024, 2025,    seed * 17);
      const creator = [adminId, managerId, employeeId][i % 3];
      insertProd.run(p.id, plant, machId, qty, scrap, date, creator);
    }

    // 40 inventory records (deterministic)
    for (let i = 0; i < 40; i++) {
      const seed     = i * 11 + 3;
      const p        = productIds[i % productIds.length];
      const warehouse= deterministicPick(WAREHOUSES, seed * 7);
      const stock    = deterministicInt(10, 5000,     seed * 13);
      const reorder  = deterministicInt(50, 500,      seed * 17);
      const updater  = [adminId, managerId, employeeId][i % 3];
      insertInv.run(p.id, warehouse, stock, reorder, updater);
    }

    // 100 sales records (deterministic)
    for (let i = 0; i < 100; i++) {
      const seed     = i * 13 + 5;
      const pidx     = Math.floor(seededRand(seed)    * productIds.length);
      const p        = productIds[pidx];
      const customer = deterministicPick(CUSTOMERS,   seed * 3);
      const qty      = deterministicInt(10, 500,       seed * 7);
      const total    = qty * p.price;
      const region   = deterministicPick(REGIONS,     seed * 11);
      const date     = deterministicDate(2024, 2025,  seed * 17);
      const creator  = [adminId, managerId][i % 2];
      insertSales.run(p.id, customer, qty, total, region, date, creator);
    }

    // 80 finance transactions (deterministic)
    for (let i = 0; i < 80; i++) {
      const seed   = i * 17 + 7;
      const type   = seededRand(seed) > 0.4 ? 'revenue' : 'expense';
      const amount = deterministicInt(50000, 5000000, seed * 3);
      const dept   = deterministicPick(DEPARTMENTS,   seed * 7);
      const date   = deterministicDate(2024, 2025,    seed * 13);
      insertFinance.run(type, amount, dept, date);
    }
  });

  tx();
}

export function seedDatabase() {
  // Always ensure admin exists
  const adminCount = db.prepare('SELECT COUNT(*) as c FROM admin').get().c;
  if (adminCount === 0) {
    db.prepare('INSERT INTO admin (username, password) VALUES (?, ?)').run('admin', 'admin123');
  }

  // Always ensure core users exist
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  let adminId, managerId, employeeId;

  if (userCount === 0) {
    const firstNames = ['Rajesh','Priya','Amit','Sunita','Vikram','Neha','Ravi','Anita','Suresh','Kavita','Deepak','Meera','Arun','Pooja','Manoj','Sita','Karan','Divya','Nitin','Lakshmi','Sanjay','Geeta','Rohit','Anjali','Vijay','Rekha','Ashok','Swati','Gopal','Rina','Hemant','Usha','Pankaj','Nisha','Tarun','Bhavna','Ajay','Sneha','Dinesh','Pallavi','Mukesh','Shruti','Naveen','Jyoti','Ramesh','Seema','Yogesh','Komal','Harsh','Tanvi'];
    const lastNames  = ['Kumar','Sharma','Patel','Singh','Gupta','Reddy','Joshi','Mehta','Shah','Verma','Rao','Mishra','Chauhan','Nair','Pillai'];
    const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');

    adminId    = insertUser.run('Admin User',   'admin@apollotyres.com',    'admin123',    'admin').lastInsertRowid;
    managerId  = insertUser.run('Rajesh Kumar', 'manager@apollotyres.com',  'manager123',  'manager').lastInsertRowid;
    employeeId = insertUser.run('Priya Sharma', 'employee@apollotyres.com', 'employee123', 'employee').lastInsertRowid;

    // Additional users
    const roles = ['manager','employee'];
    for (let i = 0; i < 5; i++) {
      const name  = `${firstNames[i + 3]} ${lastNames[i % lastNames.length]}`;
      const email = `user${i + 1}@apollotyres.com`;
      insertUser.run(name, email, 'password123', roles[i % 2]);
    }

    // 50 employees (HR page)
    const insertEmp = db.prepare('INSERT INTO employees (name, department, salary, join_date) VALUES (?, ?, ?, ?)');
    for (let i = 0; i < 50; i++) {
      const seed   = i * 19 + 2;
      const name   = `${firstNames[i]} ${deterministicPick(lastNames, seed)}`;
      const dept   = deterministicPick(DEPARTMENTS, seed * 3);
      const salary = deterministicInt(30000, 150000, seed * 7);
      const jdate  = deterministicDate(2015, 2024, seed * 11);
      insertEmp.run(name, dept, salary, jdate);
    }
  } else {
    // Fetch existing user IDs for foreign keys
    const admin    = db.prepare("SELECT user_id FROM users WHERE email = 'admin@apollotyres.com'").get();
    const manager  = db.prepare("SELECT user_id FROM users WHERE email = 'manager@apollotyres.com'").get();
    const employee = db.prepare("SELECT user_id FROM users WHERE email = 'employee@apollotyres.com'").get();
    adminId    = admin    ? admin.user_id    : 1;
    managerId  = manager  ? manager.user_id  : 2;
    employeeId = employee ? employee.user_id : 3;
  }

  // ── Seed the 5 data tables ──────────────────────────────────────────────────
  // Check if products table is empty OR has old generic data
  const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const needsReseed  = productCount === 0 || hasGenericProducts();

  if (needsReseed) {
    clearDataTables();
    seedDataTables(adminId, managerId, employeeId);
    // eslint-disable-next-line no-console
    console.log('[DB] Seeded products, production, inventory, sales & finance with Apollo Tyres data.');
  }
}
