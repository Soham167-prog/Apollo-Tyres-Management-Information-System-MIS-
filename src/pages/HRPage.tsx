import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ChartCard } from '@/components/ChartCard';
import { MetricCard } from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, UserPlus, IndianRupee } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getPermission } from '@/lib/permissions';
import { api } from '@/lib/api';

interface EmployeeRow {
  employee_id: number;
  name: string;
  department: string;
  salary: number;
  join_date: string;
}

interface Employee {
  employee_id: number;
  employee_name: string;
  department: string;
  position: string;
  salary: number;
  join_date: string;
}

const COLORS = ['hsl(270,76%,40%)', 'hsl(160,84%,39%)', 'hsl(217,91%,60%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)', 'hsl(270,76%,60%)', 'hsl(160,60%,50%)', 'hsl(30,80%,55%)'];

export default function HRPage() {
  const { user } = useAuth();
  const perms = getPermission(user!.role, 'hr');
  const [emps, setEmps] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const avgSalary = emps.reduce((s, e) => s + e.salary, 0) / emps.length;

  const byDept: Record<string, number> = {};
  emps.forEach(e => { byDept[e.department] = (byDept[e.department] || 0) + 1; });
  const deptData = Object.entries(byDept).map(([name, value]) => ({ name, value }));

  const salaryBuckets = [
    { range: '<50K', count: emps.filter(e => e.salary < 50000).length },
    { range: '50-80K', count: emps.filter(e => e.salary >= 50000 && e.salary < 80000).length },
    { range: '80-100K', count: emps.filter(e => e.salary >= 80000 && e.salary < 100000).length },
    { range: '100-130K', count: emps.filter(e => e.salary >= 100000 && e.salary < 130000).length },
    { range: '130K+', count: emps.filter(e => e.salary >= 130000).length },
  ];

  const byYear: Record<string, number> = {};
  emps.forEach(e => { const y = e.join_date.slice(0, 4); byYear[y] = (byYear[y] || 0) + 1; });
  let cumulative = 0;
  const growthData = Object.entries(byYear).sort().map(([year, count]) => { cumulative += count; return { year, total: cumulative }; });

  useEffect(() => {
    api
      .get<EmployeeRow[]>('/employees')
      .then((rows) =>
        setEmps(
          rows.map((r) => ({
            employee_id: r.employee_id,
            employee_name: r.name,
            department: r.department,
            // backend has no "position" column – keep simple label
            position: 'Employee',
            salary: r.salary,
            join_date: r.join_date,
          })),
        ),
      )
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load employees', err);
      });
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name') as string,
      department: fd.get('department') as string,
      salary: Number(fd.get('salary')),
      join_date: fd.get('date') as string,
    };

    try {
      const created = await api.post<EmployeeRow>('/employees', body);
      const mapped: Employee = {
        employee_id: created.employee_id,
        employee_name: created.name,
        department: created.department,
        position: fd.get('position') as string,
        salary: created.salary,
        join_date: created.join_date,
      };
      setEmps((prev) => [mapped, ...prev]);
      setOpen(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to add employee', err);
    }
  };

  return (
    <AppLayout title="Human Resource Management">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Employees" value={emps.length} icon={Users} color="primary" />
        <MetricCard title="Departments" value={Object.keys(byDept).length} icon={Users} color="info" />
        <MetricCard title="Avg Salary" value={`₹${(avgSalary / 1e3).toFixed(0)}K`} icon={IndianRupee} color="success" />
        <MetricCard title="New This Year" value={emps.filter(e => e.join_date.startsWith('2024')).length} icon={UserPlus} color="warning" />
      </div>

      {perms.add && (
        <div className="flex justify-end mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Employee</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-3">
                <div><Label className="text-xs">Name</Label><Input name="name" required className="mt-1" /></div>
                <div><Label className="text-xs">Department</Label>
                  <select name="department" className="w-full rounded border bg-background px-3 py-2 text-sm mt-1" required>
                    {['Production', 'Sales', 'Finance', 'HR', 'R&D', 'Quality', 'Logistics', 'IT'].map(d => <option key={d}>{d}</option>)}
                  </select></div>
                <div><Label className="text-xs">Position</Label><Input name="position" required className="mt-1" /></div>
                <div><Label className="text-xs">Salary (₹)</Label><Input name="salary" type="number" required className="mt-1" /></div>
                <div><Label className="text-xs">Join Date</Label><Input name="date" type="date" required className="mt-1" /></div>
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Department Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={deptData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={10}>
                {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Salary Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salaryBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(270,76%,40%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Employee Growth">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="hsl(160,84%,39%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Department</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Position</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Salary</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Join Date</th>
            </tr></thead>
            <tbody>
              {emps.map(e => (
                <tr key={e.employee_id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{e.employee_id}</td>
                  <td className="px-3 py-2 font-medium">{e.employee_name}</td>
                  <td className="px-3 py-2">{e.department}</td>
                  <td className="px-3 py-2">{e.position}</td>
                  <td className="px-3 py-2 text-right">₹{e.salary.toLocaleString()}</td>
                  <td className="px-3 py-2">{e.join_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
