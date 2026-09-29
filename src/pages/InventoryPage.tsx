import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ChartCard } from '@/components/ChartCard';
import { MetricCard } from '@/components/MetricCard';
import { Package, AlertTriangle, Warehouse } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';

interface InventoryRow {
  inventory_id: number;
  product_id: number;
  warehouse: string;
  stock_level: number;
  reorder_level: number;
}

interface InventoryItem {
  inventory_id: number;
  product_id: number;
  warehouse_location: string;
  stock_quantity: number;
  reorder_level: number;
  last_updated: string;
}

interface Product {
  product_id: number;
  product_name: string;
}

const COLORS = ['hsl(270,76%,40%)', 'hsl(160,84%,39%)', 'hsl(217,91%,60%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)'];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api
      .get<InventoryRow[]>('/inventory')
      .then((rows) =>
        setItems(
          rows.map((r) => ({
            inventory_id: r.inventory_id,
            product_id: r.product_id,
            warehouse_location: r.warehouse,
            stock_quantity: r.stock_level,
            reorder_level: r.reorder_level,
            last_updated: '',
          })),
        ),
      )
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load inventory', err);
      });

    api
      .get<Product[]>('/products')
      .then(setProducts)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load products', err);
      });
  }, []);

  const getProductName = (id: number) =>
    products.find((p) => p.product_id === id)?.product_name ?? String(id);
  const totalStock = items.reduce((s, i) => s + i.stock_quantity, 0);
  const lowStock = items.filter(i => i.stock_quantity < i.reorder_level);

  const byWarehouse: Record<string, number> = {};
  items.forEach(i => { byWarehouse[i.warehouse_location] = (byWarehouse[i.warehouse_location] || 0) + i.stock_quantity; });
  const warehouseData = Object.entries(byWarehouse).map(([name, value]) => ({ name, value }));

  const byProduct: Record<string, number> = {};
  items.forEach(i => { byProduct[getProductName(i.product_id)] = (byProduct[getProductName(i.product_id)] || 0) + i.stock_quantity; });
  const productData = Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, qty]) => ({ name, qty }));

  return (
    <AppLayout title="Inventory Management">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Stock" value={totalStock.toLocaleString()} icon={Package} color="primary" />
        <MetricCard title="Low Stock Alerts" value={lowStock.length} icon={AlertTriangle} color="destructive" />
        <MetricCard title="Warehouses" value={Object.keys(byWarehouse).length} icon={Warehouse} color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Inventory by Warehouse">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={warehouseData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {warehouseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Stock by Product (Top 10)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={80} />
              <Tooltip />
              <Bar dataKey="qty" fill="hsl(270,76%,40%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 mb-6">
          <h3 className="font-display font-semibold text-sm text-destructive mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Low Stock Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStock.map(i => (
              <div key={i.inventory_id} className="rounded border bg-card p-2 text-xs">
                <span className="font-medium">{getProductName(i.product_id)}</span>
                <span className="text-muted-foreground"> — {i.warehouse_location}</span>
                <div className="text-destructive font-medium mt-0.5">Stock: {i.stock_quantity} (Reorder: {i.reorder_level})</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Product</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Warehouse</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Stock</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Reorder Level</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Updated</th>
            </tr></thead>
            <tbody>
              {items.map(i => (
                <tr key={i.inventory_id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{i.inventory_id}</td>
                  <td className="px-3 py-2">{getProductName(i.product_id)}</td>
                  <td className="px-3 py-2">{i.warehouse_location}</td>
                  <td className="px-3 py-2 text-right">{i.stock_quantity.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{i.reorder_level}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${i.stock_quantity < i.reorder_level ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                      {i.stock_quantity < i.reorder_level ? 'Low' : 'OK'}
                    </span>
                  </td>
                  <td className="px-3 py-2">{i.last_updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
