import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { MetricCard } from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Shield, Plus, Trash2 } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';

export interface SystemUser {
  user_id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  created_at: string;
  status: 'active' | 'inactive';
}

const initialUsers: SystemUser[] = [
  { user_id: 'U001', username: 'admin', name: 'Admin User', role: 'admin', email: 'admin@apollotyres.com', created_at: '2023-01-15', status: 'active' },
  { user_id: 'U002', username: 'manager', name: 'Rajesh Kumar', role: 'manager', email: 'rajesh.kumar@apollotyres.com', created_at: '2023-03-20', status: 'active' },
  { user_id: 'U003', username: 'employee', name: 'Priya Sharma', role: 'employee', email: 'priya.sharma@apollotyres.com', created_at: '2023-06-10', status: 'active' },
  { user_id: 'U004', username: 'mgr_ops', name: 'Vikram Singh', role: 'manager', email: 'vikram.singh@apollotyres.com', created_at: '2023-08-05', status: 'active' },
  { user_id: 'U005', username: 'emp_prod', name: 'Neha Patel', role: 'employee', email: 'neha.patel@apollotyres.com', created_at: '2024-01-12', status: 'active' },
  { user_id: 'U006', username: 'emp_qa', name: 'Amit Joshi', role: 'employee', email: 'amit.joshi@apollotyres.com', created_at: '2024-02-28', status: 'inactive' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [open, setOpen] = useState(false);

  const admins = users.filter(u => u.role === 'admin').length;
  const managers = users.filter(u => u.role === 'manager').length;
  const emps = users.filter(u => u.role === 'employee').length;

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newUser: SystemUser = {
      user_id: `U${String(users.length + 1).padStart(3, '0')}`,
      username: fd.get('username') as string,
      name: fd.get('name') as string,
      role: fd.get('role') as UserRole,
      email: fd.get('email') as string,
      created_at: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setUsers([newUser, ...users]);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.user_id !== id));
  };

  const roleColor = (role: UserRole) => {
    if (role === 'admin') return 'bg-destructive/10 text-destructive';
    if (role === 'manager') return 'bg-warning/10 text-warning';
    return 'bg-info/10 text-info';
  };

  return (
    <AppLayout title="User Management">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Users" value={users.length} icon={Users} color="primary" />
        <MetricCard title="Admins" value={admins} icon={Shield} color="destructive" />
        <MetricCard title="Managers" value={managers} icon={Users} color="warning" />
        <MetricCard title="Employees" value={emps} icon={Users} color="info" />
      </div>

      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add User</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div><Label className="text-xs">Username</Label><Input name="username" required className="mt-1" /></div>
              <div><Label className="text-xs">Full Name</Label><Input name="name" required className="mt-1" /></div>
              <div><Label className="text-xs">Email</Label><Input name="email" type="email" required className="mt-1" /></div>
              <div><Label className="text-xs">Role</Label>
                <select name="role" className="w-full rounded border bg-background px-3 py-2 text-sm mt-1" required>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </select></div>
              <Button type="submit" className="w-full">Create User</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Username</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Email</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Role</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Created</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{u.user_id}</td>
                  <td className="px-3 py-2 font-medium">{u.username}</td>
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${roleColor(u.role)}`}>{u.role}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${u.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{u.status}</span>
                  </td>
                  <td className="px-3 py-2">{u.created_at}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleDelete(u.user_id)} className="text-destructive hover:text-destructive/80 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
