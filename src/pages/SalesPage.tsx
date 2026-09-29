import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ChartCard } from '@/components/ChartCard';
import { MetricCard } from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getPermission } from '@/lib/permissions';
import { api } from '@/lib/api';

interface SalesRow {
  order_id: number;
  product_id: number;
  customer_name: string;
  quantity: number;
  total_amount: number;
  region: string;
  date: string;
}

interface SalesOrder {
  order_id: number;
  customer_name: string;
  product_id: number;
  quantity: number;
  price: number;
  total_amount: number;
  region: string;
  order_date: string;
}

interface Product {
  product_id: number;
  product_name: string;
  price: number;
}

export default function SalesPage() {
  const { user } = useAuth();
  const perms = getPermission(user!.role, 'sales');
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api
      .get<SalesRow[]>('/sales')
      .then((rows) =>
        setOrders(
          rows.map((r) => ({
            order_id: r.order_id,
            customer_name: r.customer_name,
            product_id: r.product_id,
            quantity: r.quantity,
            total_amount: r.total_amount,
            // approximate price from total/qty if needed
            price: r.quantity ? r.total_amount / r.quantity : 0,
            region: r.region,
            order_date: r.date,
          })),
        ),
      )
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load sales orders', err);
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

  const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0);
  const avgOrder = totalRevenue / orders.length;

  const byRegion: Record<string, number> = {};
  orders.forEach(o => { byRegion[o.region] = (byRegion[o.region] || 0) + o.total_amount; });
  const regionData = Object.entries(byRegion).map(([region, revenue]) => ({ region, revenue }));

  const byMonth: Record<string, number> = {};
  orders.forEach(o => { const m = o.order_date.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + o.total_amount; });
  const monthlyData = Object.entries(byMonth).sort().map(([month, revenue]) => ({ month, revenue }));

  const byProduct: Record<string, number> = {};
  orders.forEach(o => { byProduct[getProductName(o.product_id)] = (byProduct[getProductName(o.product_id)] || 0) + o.quantity; });
  const demandData = Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, qty]) => ({ name, qty }));

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const productId = Number(fd.get('product_id'));
    const product = products.find((p) => p.product_id === productId);
    const qty = Number(fd.get('quantity'));
    const body = {
      product_id: productId,
      customer_name: fd.get('customer') as string,
      quantity: qty,
      total_amount: product ? qty * product.price : qty,
      region: fd.get('region') as string,
      date: fd.get('date') as string,
    };

    try {
      const created = await api.post<SalesRow>('/sales', body);
      const mapped: SalesOrder = {
        order_id: created.order_id,
        customer_name: created.customer_name,
        product_id: created.product_id,
        quantity: created.quantity,
        total_amount: created.total_amount,
        price: created.quantity ? created.total_amount / created.quantity : 0,
        region: created.region,
        order_date: created.date,
      };
      setOrders((prev) => [mapped, ...prev]);
      setOpen(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to create sales order', err);
    }
  };

  return (
    <AppLayout title="Sales Management">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Revenue" value={`₹${(totalRevenue / 1e6).toFixed(1)}M`} icon={DollarSign} color="success" />
        <MetricCard title="Total Orders" value={orders.length} icon={ShoppingCart} color="primary" />
        <MetricCard title="Avg Order Value" value={`₹${(avgOrder / 1e3).toFixed(0)}K`} icon={TrendingUp} color="info" />
        <MetricCard title="Regions" value={Object.keys(byRegion).length} icon={ShoppingCart} color="warning" />
      </div>

      {perms.add && (
        <div className="flex justify-end mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />New Order</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Sales Order</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-3">
                <div><Label className="text-xs">Customer</Label><Input name="customer" required className="mt-1" /></div>
                <div><Label className="text-xs">Product</Label>
                  <select name="product_id" className="w-full rounded border bg-background px-3 py-2 text-sm mt-1" required>
                    {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name} — ₹{p.price}</option>)}
                  </select></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Quantity</Label><Input name="quantity" type="number" required className="mt-1" /></div>
                  <div><Label className="text-xs">Region</Label>
                    <select name="region" className="w-full rounded border bg-background px-3 py-2 text-sm mt-1" required>
                      {['North India', 'South India', 'West India', 'East India', 'Europe', 'Middle East', 'Southeast Asia'].map(r => <option key={r}>{r}</option>)}
                    </select></div>
                </div>
                <div><Label className="text-xs">Date</Label><Input name="date" type="date" required className="mt-1" /></div>
                <Button type="submit" className="w-full">Create Order</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Sales by Region">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="region" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `₹${(v / 1e6).toFixed(2)}M`} />
              <Bar dataKey="revenue" fill="hsl(270,76%,40%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `₹${(v / 1e6).toFixed(2)}M`} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(160,84%,39%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Product Demand (Top 8)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demandData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={80} />
              <Tooltip />
              <Bar dataKey="qty" fill="hsl(217,91%,60%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Order ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Customer</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Product</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Qty</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Price</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Total</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Region</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
            </tr></thead>
            <tbody>
              {orders.slice(0, 20).map(o => (
                <tr key={o.order_id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{o.order_id}</td>
                  <td className="px-3 py-2">{o.customer_name}</td>
                  <td className="px-3 py-2">{getProductName(o.product_id)}</td>
                  <td className="px-3 py-2 text-right">{o.quantity}</td>
                  <td className="px-3 py-2 text-right">₹{o.price.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-medium">₹{o.total_amount.toLocaleString()}</td>
                  <td className="px-3 py-2">{o.region}</td>
                  <td className="px-3 py-2">{o.order_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
