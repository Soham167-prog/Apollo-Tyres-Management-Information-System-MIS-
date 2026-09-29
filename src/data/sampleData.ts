// ===== PRODUCTS =====
export interface Product {
  product_id: string;
  product_name: string;
  tyre_type: string;
  vehicle_type: string;
  price: number;
}

const tyreTypes = ['Radial', 'Bias', 'Tubeless', 'Tube-type'];
const vehicleTypes = ['Passenger Car', 'Truck', 'Two Wheeler', 'Off Road'];
const plants = ['Chennai Plant', 'Gujarat Plant', 'Hungary Plant', 'Netherlands Plant'];
const regions = ['North India', 'South India', 'West India', 'East India', 'Europe', 'Middle East', 'Southeast Asia'];
const departments = ['Production', 'Sales', 'Finance', 'HR', 'R&D', 'Quality', 'Logistics', 'IT'];
const positions = ['Manager', 'Engineer', 'Analyst', 'Supervisor', 'Technician', 'Executive', 'Director', 'Associate'];
const warehouses = ['Chennai Warehouse', 'Gujarat Warehouse', 'Mumbai Warehouse', 'Delhi Warehouse', 'Budapest Warehouse'];

const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Neha', 'Ravi', 'Anita', 'Suresh', 'Kavita', 'Deepak', 'Meera', 'Arun', 'Pooja', 'Manoj', 'Sita', 'Karan', 'Divya', 'Nitin', 'Lakshmi', 'Sanjay', 'Geeta', 'Rohit', 'Anjali', 'Vijay', 'Rekha', 'Ashok', 'Swati', 'Gopal', 'Rina', 'Hemant', 'Usha', 'Pankaj', 'Nisha', 'Tarun', 'Bhavna', 'Ajay', 'Sneha', 'Dinesh', 'Pallavi', 'Mukesh', 'Shruti', 'Naveen', 'Jyoti', 'Ramesh', 'Seema', 'Yogesh', 'Komal', 'Harsh', 'Tanvi'];
const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Gupta', 'Reddy', 'Joshi', 'Mehta', 'Shah', 'Verma', 'Rao', 'Mishra', 'Chauhan', 'Nair', 'Pillai'];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }
function dateInRange(startYear: number, endYear: number) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start)).toISOString().split('T')[0];
}

export const products: Product[] = [
  { product_id: 'P001', product_name: 'Alnac 4G', tyre_type: 'Radial', vehicle_type: 'Passenger Car', price: 4500 },
  { product_id: 'P002', product_name: 'Amazer 4G Life', tyre_type: 'Tubeless', vehicle_type: 'Passenger Car', price: 3800 },
  { product_id: 'P003', product_name: 'Aspire 4G', tyre_type: 'Radial', vehicle_type: 'Passenger Car', price: 5200 },
  { product_id: 'P004', product_name: 'Alnac 4G Plus', tyre_type: 'Tubeless', vehicle_type: 'Passenger Car', price: 5800 },
  { product_id: 'P005', product_name: 'Apterra HT2', tyre_type: 'Radial', vehicle_type: 'Off Road', price: 8500 },
  { product_id: 'P006', product_name: 'Apterra AT2', tyre_type: 'Radial', vehicle_type: 'Off Road', price: 9200 },
  { product_id: 'P007', product_name: 'EnduRace RT', tyre_type: 'Radial', vehicle_type: 'Truck', price: 12000 },
  { product_id: 'P008', product_name: 'EnduRace RD', tyre_type: 'Bias', vehicle_type: 'Truck', price: 11500 },
  { product_id: 'P009', product_name: 'EnduMile LM', tyre_type: 'Bias', vehicle_type: 'Truck', price: 10800 },
  { product_id: 'P010', product_name: 'EnduRace RA', tyre_type: 'Radial', vehicle_type: 'Truck', price: 13500 },
  { product_id: 'P011', product_name: 'Acti ZIP R3', tyre_type: 'Tubeless', vehicle_type: 'Two Wheeler', price: 1200 },
  { product_id: 'P012', product_name: 'Acti Grip R4', tyre_type: 'Tube-type', vehicle_type: 'Two Wheeler', price: 950 },
  { product_id: 'P013', product_name: 'Trampliner XL', tyre_type: 'Radial', vehicle_type: 'Off Road', price: 15000 },
  { product_id: 'P014', product_name: 'Vredestein Quatrac', tyre_type: 'Radial', vehicle_type: 'Passenger Car', price: 7800 },
  { product_id: 'P015', product_name: 'Vredestein Ultrac', tyre_type: 'Radial', vehicle_type: 'Passenger Car', price: 8900 },
  { product_id: 'P016', product_name: 'Acti ZIP F3', tyre_type: 'Tubeless', vehicle_type: 'Two Wheeler', price: 1100 },
  { product_id: 'P017', product_name: 'EnduMile HD', tyre_type: 'Bias', vehicle_type: 'Truck', price: 11000 },
  { product_id: 'P018', product_name: 'Apterra HP', tyre_type: 'Radial', vehicle_type: 'Off Road', price: 9800 },
  { product_id: 'P019', product_name: 'Amazer XP', tyre_type: 'Tubeless', vehicle_type: 'Passenger Car', price: 4200 },
  { product_id: 'P020', product_name: 'Acti Grip S1', tyre_type: 'Tube-type', vehicle_type: 'Two Wheeler', price: 850 },
];

// ===== EMPLOYEES =====
export interface Employee {
  employee_id: string;
  employee_name: string;
  department: string;
  position: string;
  salary: number;
  join_date: string;
}

export const employees: Employee[] = Array.from({ length: 50 }, (_, i) => ({
  employee_id: `E${String(i + 1).padStart(3, '0')}`,
  employee_name: `${firstNames[i]} ${pick(lastNames)}`,
  department: pick(departments),
  position: pick(positions),
  salary: rand(30000, 150000),
  join_date: dateInRange(2015, 2024),
}));

// ===== PRODUCTION =====
export interface ProductionRecord {
  production_id: string;
  product_id: string;
  plant: string;
  machine_id: string;
  quantity_produced: number;
  scrap_quantity: number;
  production_date: string;
}

export const productionRecords: ProductionRecord[] = Array.from({ length: 100 }, (_, i) => {
  const qty = rand(100, 2000);
  return {
    production_id: `PR${String(i + 1).padStart(3, '0')}`,
    product_id: pick(products).product_id,
    plant: pick(plants),
    machine_id: `M${rand(1, 20)}`,
    quantity_produced: qty,
    scrap_quantity: rand(1, Math.floor(qty * 0.08)),
    production_date: dateInRange(2024, 2025),
  };
});

// ===== INVENTORY =====
export interface InventoryItem {
  inventory_id: string;
  product_id: string;
  warehouse_location: string;
  stock_quantity: number;
  reorder_level: number;
  last_updated: string;
}

export const inventoryItems: InventoryItem[] = Array.from({ length: 40 }, (_, i) => ({
  inventory_id: `INV${String(i + 1).padStart(3, '0')}`,
  product_id: products[i % products.length].product_id,
  warehouse_location: pick(warehouses),
  stock_quantity: rand(10, 5000),
  reorder_level: rand(50, 500),
  last_updated: dateInRange(2024, 2025),
}));

// ===== SALES =====
export interface SalesOrder {
  order_id: string;
  customer_name: string;
  product_id: string;
  quantity: number;
  price: number;
  total_amount: number;
  region: string;
  order_date: string;
}

const customerNames = ['Tata Motors', 'Mahindra', 'Maruti Suzuki', 'Ashok Leyland', 'Bajaj Auto', 'Hero MotoCorp', 'TVS Motor', 'Hyundai India', 'Kia India', 'MG Motor', 'Toyota India', 'Honda Cars', 'Ford India', 'Renault India', 'Volkswagen India'];

export const salesOrders: SalesOrder[] = Array.from({ length: 100 }, (_, i) => {
  const product = pick(products);
  const qty = rand(10, 500);
  return {
    order_id: `SO${String(i + 1).padStart(3, '0')}`,
    customer_name: pick(customerNames),
    product_id: product.product_id,
    quantity: qty,
    price: product.price,
    total_amount: qty * product.price,
    region: pick(regions),
    order_date: dateInRange(2024, 2025),
  };
});

// ===== FINANCE =====
export interface FinanceTransaction {
  transaction_id: string;
  transaction_type: 'revenue' | 'expense';
  amount: number;
  department: string;
  transaction_date: string;
}

export const financeTransactions: FinanceTransaction[] = Array.from({ length: 80 }, (_, i) => ({
  transaction_id: `FT${String(i + 1).padStart(3, '0')}`,
  transaction_type: Math.random() > 0.4 ? 'revenue' : 'expense',
  amount: rand(50000, 5000000),
  department: pick(departments),
  transaction_date: dateInRange(2024, 2025),
}));

// ===== HELPERS =====
export function getProductName(id: string) {
  return products.find(p => p.product_id === id)?.product_name ?? id;
}
