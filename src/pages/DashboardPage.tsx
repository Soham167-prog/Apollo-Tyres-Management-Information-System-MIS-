import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { MetricCard } from '@/components/MetricCard';
import { ChartCard } from '@/components/ChartCard';
import { useAuth } from '@/contexts/AuthContext';
import { Factory, DollarSign, Package, Users, ShoppingCart, Gauge, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '@/lib/api';

const COLORS = ['hsl(270,76%,40%)', 'hsl(160,84%,39%)', 'hsl(217,91%,60%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)', 'hsl(270,76%,60%)', 'hsl(160,60%,50%)'];

interface DashboardSummary {
  totals: {
    totalProduction: number;
    totalScrap: number;
    totalRevenue: number;
    totalExpense: number;
    employees: number;
    activeOrders: number;
    inventoryLevel: number;
  };
  productionTrend: { month: string; production: number }[];
  salesByRegion: { region: string; revenue: number }[];
  inventoryByWarehouse: { name: string; value: number }[];
  revenueExpensesByMonth: { month: string; revenue: number; expense: number }[];
  employeesByDepartment: { name: string; value: number }[];
  productionByPlant: { plant: string; qty: number }[];
}

function AdminDashboard({ data }: { data: DashboardSummary }) {
  const { totals, productionTrend, salesByRegion, inventoryByWarehouse, revenueExpensesByMonth, employeesByDepartment, productionByPlant } = data;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <MetricCard title="Total Production" value={totals.totalProduction.toLocaleString()} icon={Factory} trend="Live from MIS" trendUp color="primary" />
        <MetricCard title="Sales Revenue" value={`₹${(totals.totalRevenue / 1e6).toFixed(1)}M`} icon={DollarSign} trend="Live from MIS" trendUp color="success" />
        <MetricCard title="Inventory Level" value={totals.inventoryLevel.toLocaleString()} icon={Package} trend="Live from MIS" trendUp color="info" />
        <MetricCard title="Employees" value={totals.employees} icon={Users} color="warning" />
        <MetricCard title="Active Orders" value={totals.activeOrders} icon={ShoppingCart} trend="Live from MIS" trendUp color="primary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Production Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={productionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="production" stroke="hsl(270,76%,40%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Sales by Region">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByRegion}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="region" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `₹${(v / 1e6).toFixed(2)}M`} />
              <Bar dataKey="revenue" fill="hsl(270,76%,40%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Inventory Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={inventoryByWarehouse} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {inventoryByWarehouse.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Revenue vs Expenses">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueExpensesByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `₹${(v / 1e6).toFixed(2)}M`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="hsl(160,84%,39%)" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="hsl(0,84%,60%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Employee Distribution by Department">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={employeesByDepartment} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={10}>
                {employeesByDepartment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'employee';
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<DashboardSummary>('/dashboard/summary')
      .then((data) => {
        setSummary(data);
        setError(null);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load dashboard summary', err);
        setError('Unable to load dashboard data from MIS backend.');
      });
  }, []);

  const title = `Dashboard — ${role.charAt(0).toUpperCase() + role.slice(1)} View`;

  return (
    <AppLayout title={title}>
      {!summary && !error && (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          Loading dashboard data...
        </div>
      )}
      {error && (
        <div className="mb-4 rounded border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}
      {summary && <AdminDashboard data={summary} />}
    </AppLayout>
  );
}
