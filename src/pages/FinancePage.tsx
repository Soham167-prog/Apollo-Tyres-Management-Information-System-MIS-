import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ChartCard } from '@/components/ChartCard';
import { MetricCard } from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getPermission } from '@/lib/permissions';
import { api } from '@/lib/api';

interface FinanceRow {
  transaction_id: number;
  type: 'revenue' | 'expense';
  amount: number;
  department: string;
  date: string;
}

interface FinanceTransaction {
  transaction_id: number;
  transaction_type: 'revenue' | 'expense';
  amount: number;
  department: string;
  transaction_date: string;
}

const COLORS = ['hsl(270,76%,40%)', 'hsl(160,84%,39%)', 'hsl(217,91%,60%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)', 'hsl(270,76%,60%)', 'hsl(160,60%,50%)'];

export default function FinancePage() {
  const { user } = useAuth();
  const perms = getPermission(user!.role, 'finance');
  const [txns, setTxns] = useState<FinanceTransaction[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api
      .get<FinanceRow[]>('/finance')
      .then((rows) =>
        setTxns(
          rows.map((r) => ({
            transaction_id: r.transaction_id,
            transaction_type: r.type,
            amount: r.amount,
            department: r.department,
            transaction_date: r.date,
          })),
        ),
      )
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load finance transactions', err);
      });
  }, []);

  const totalRevenue = txns.filter(t => t.transaction_type === 'revenue').reduce((s, t) => s + t.amount, 0);
  const totalExpense = txns.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + t.amount, 0);
  const profit = totalRevenue - totalExpense;

  const byMonth: Record<string, { revenue: number; expense: number }> = {};
  txns.forEach(t => {
    const m = t.transaction_date.slice(0, 7);
    if (!byMonth[m]) byMonth[m] = { revenue: 0, expense: 0 };
    if (t.transaction_type === 'revenue') byMonth[m].revenue += t.amount;
    else byMonth[m].expense += t.amount;
  });
  const monthlyData = Object.entries(byMonth).sort().map(([month, v]) => ({ month, ...v, profit: v.revenue - v.expense }));

  const costByDept: Record<string, number> = {};
  txns.filter(t => t.transaction_type === 'expense').forEach(t => { costByDept[t.department] = (costByDept[t.department] || 0) + t.amount; });
  const costData = Object.entries(costByDept).map(([name, value]) => ({ name, value }));

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      type: fd.get('type') as 'revenue' | 'expense',
      amount: Number(fd.get('amount')),
      department: fd.get('department') as string,
      date: fd.get('date') as string,
    };

    try {
      const created = await api.post<FinanceRow>('/finance', body);
      const mapped: FinanceTransaction = {
        transaction_id: created.transaction_id,
        transaction_type: created.type,
        amount: created.amount,
        department: created.department,
        transaction_date: created.date,
      };
      setTxns((prev) => [mapped, ...prev]);
      setOpen(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to record transaction', err);
    }
  };

  return (
    <AppLayout title="Finance Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Revenue" value={`₹${(totalRevenue / 1e6).toFixed(1)}M`} icon={TrendingUp} color="success" />
        <MetricCard title="Total Expenses" value={`₹${(totalExpense / 1e6).toFixed(1)}M`} icon={TrendingDown} color="destructive" />
        <MetricCard title="Net Profit" value={`₹${(profit / 1e6).toFixed(1)}M`} icon={DollarSign} color={profit > 0 ? 'success' : 'destructive'} />
        <MetricCard title="Transactions" value={txns.length} icon={DollarSign} color="info" />
      </div>

      {perms.add && (
        <div className="flex justify-end mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Record Transaction</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Transaction</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-3">
                <div><Label className="text-xs">Type</Label>
                  <select name="type" className="w-full rounded border bg-background px-3 py-2 text-sm mt-1" required>
                    <option value="revenue">Revenue</option><option value="expense">Expense</option>
                  </select></div>
                <div><Label className="text-xs">Amount (₹)</Label><Input name="amount" type="number" required className="mt-1" /></div>
                <div><Label className="text-xs">Department</Label>
                  <select name="department" className="w-full rounded border bg-background px-3 py-2 text-sm mt-1" required>
                    {['Production', 'Sales', 'Finance', 'HR', 'R&D', 'Quality', 'Logistics', 'IT'].map(d => <option key={d}>{d}</option>)}
                  </select></div>
                <div><Label className="text-xs">Date</Label><Input name="date" type="date" required className="mt-1" /></div>
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Revenue vs Expenses">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
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
        <ChartCard title="Cost Breakdown by Department">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={costData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {costData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `₹${(v / 1e6).toFixed(2)}M`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Profit Trend">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `₹${(v / 1e6).toFixed(2)}M`} />
              <Bar dataKey="profit" fill="hsl(270,76%,40%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Department</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
            </tr></thead>
            <tbody>
              {txns.slice(0, 20).map(t => (
                <tr key={t.transaction_id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{t.transaction_id}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${t.transaction_type === 'revenue' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {t.transaction_type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-medium">₹{t.amount.toLocaleString()}</td>
                  <td className="px-3 py-2">{t.department}</td>
                  <td className="px-3 py-2">{t.transaction_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
