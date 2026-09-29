import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ChartCard } from '@/components/ChartCard';
import { MetricCard } from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Factory, Plus, AlertTriangle, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getPermission } from '@/lib/permissions';
import { api } from '@/lib/api';

interface ProductionRow {
  production_id: number;
  product_id: number;
  plant: string;
  machine_id: string;
  quantity: number;
  scrap: number;
  date: string;
}

interface ProductionRecord {
  production_id: number;
  product_id: number;
  plant: string;
  machine_id: string;
  quantity_produced: number;
  scrap_quantity: number;
  production_date: string;
}

interface Product {
  product_id: number;
  product_name: string;
}

export default function ProductionPage() {
  const { user } = useAuth();
  const perms = getPermission(user!.role, 'production');
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api
      .get<ProductionRow[]>('/production')
      .then((rows) =>
        setRecords(
          rows.map((r) => ({
            production_id: r.production_id,
            product_id: r.product_id,
            plant: r.plant,
            machine_id: r.machine_id,
            quantity_produced: r.quantity,
            scrap_quantity: r.scrap,
            production_date: r.date,
          })),
        ),
      )
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load production', err);
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

  const totalQty = records.reduce((s, r) => s + r.quantity_produced, 0);
  const totalScrap = records.reduce((s, r) => s + r.scrap_quantity, 0);
  const scrapRate = ((totalScrap / totalQty) * 100).toFixed(1);

  const byPlant: Record<string, number> = {};
  records.forEach(r => { byPlant[r.plant] = (byPlant[r.plant] || 0) + r.quantity_produced; });
  const plantData = Object.entries(byPlant).map(([plant, qty]) => ({ plant, qty }));

  const byMachine: Record<string, number> = {};
  records.forEach(r => { byMachine[r.machine_id] = (byMachine[r.machine_id] || 0) + r.quantity_produced; });
  const machineData = Object.entries(byMachine).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, qty]) => ({ id, qty }));

  const scrapByPlant: Record<string, { qty: number; scrap: number }> = {};
  records.forEach(r => {
    if (!scrapByPlant[r.plant]) scrapByPlant[r.plant] = { qty: 0, scrap: 0 };
    scrapByPlant[r.plant].qty += r.quantity_produced;
    scrapByPlant[r.plant].scrap += r.scrap_quantity;
  });
  const scrapData = Object.entries(scrapByPlant).map(([plant, v]) => ({ plant, rate: +((v.scrap / v.qty) * 100).toFixed(1) }));

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      product_id: Number(fd.get('product_id')),
      plant: fd.get('plant') as string,
      machine_id: fd.get('machine_id') as string,
      quantity: Number(fd.get('quantity')),
      scrap: Number(fd.get('scrap')),
      date: fd.get('date') as string,
    };

    try {
      const created = await api.post<ProductionRow>('/production', payload);
      const mapped: ProductionRecord = {
        production_id: created.production_id,
        product_id: created.product_id,
        plant: created.plant,
        machine_id: created.machine_id,
        quantity_produced: created.quantity,
        scrap_quantity: created.scrap,
        production_date: created.date,
      };
      setRecords((prev) => [mapped, ...prev]);
      setOpen(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to add production record', err);
    }
  };

  return (
    <AppLayout title="Production Management">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Output" value={totalQty.toLocaleString()} icon={Factory} color="primary" />
        <MetricCard title="Total Scrap" value={totalScrap.toLocaleString()} icon={AlertTriangle} color="destructive" />
        <MetricCard title="Scrap Rate" value={`${scrapRate}%`} icon={Gauge} color="warning" />
        <MetricCard title="Records" value={records.length} icon={Factory} color="info" />
      </div>

      {perms.add && (
        <div className="flex justify-end mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Record</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Production Record</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-3">
                <div><Label className="text-xs">Product</Label>
                  <select name="product_id" className="w-full rounded border bg-background px-3 py-2 text-sm mt-1" required>
                    {products.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name}
                      </option>
                    ))}
                  </select></div>
                <div><Label className="text-xs">Plant</Label>
                  <select name="plant" className="w-full rounded border bg-background px-3 py-2 text-sm mt-1" required>
                    {['Chennai Plant', 'Gujarat Plant', 'Hungary Plant', 'Netherlands Plant'].map(p => <option key={p}>{p}</option>)}
                  </select></div>
                <div><Label className="text-xs">Machine ID</Label><Input name="machine_id" placeholder="M1" required className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Quantity</Label><Input name="quantity" type="number" required className="mt-1" /></div>
                  <div><Label className="text-xs">Scrap</Label><Input name="scrap" type="number" required className="mt-1" /></div>
                </div>
                <div><Label className="text-xs">Date</Label><Input name="date" type="date" required className="mt-1" /></div>
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Output per Plant">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={plantData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="plant" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="qty" fill="hsl(270,76%,40%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Machine Utilization (Top 10)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={machineData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="id" type="category" tick={{ fontSize: 11 }} width={40} />
              <Tooltip />
              <Bar dataKey="qty" fill="hsl(217,91%,60%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Scrap Rate by Plant">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scrapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="plant" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Bar dataKey="rate" fill="hsl(0,84%,60%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Product</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Plant</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Machine</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Qty</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Scrap</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
            </tr></thead>
            <tbody>
              {records.slice(0, 20).map(r => (
                <tr key={r.production_id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{r.production_id}</td>
                  <td className="px-3 py-2">{getProductName(r.product_id)}</td>
                  <td className="px-3 py-2">{r.plant}</td>
                  <td className="px-3 py-2">{r.machine_id}</td>
                  <td className="px-3 py-2 text-right">{r.quantity_produced.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{r.scrap_quantity}</td>
                  <td className="px-3 py-2">{r.production_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
