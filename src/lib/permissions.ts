import { UserRole } from '@/contexts/AuthContext';

export interface ModulePermission {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

type ModuleName = 'dashboard' | 'production' | 'inventory' | 'sales' | 'finance' | 'hr' | 'products' | 'about' | 'users';

const permissions: Record<UserRole, Record<ModuleName, ModulePermission>> = {
  admin: {
    dashboard: { view: true, add: true, edit: true, delete: true },
    production: { view: true, add: true, edit: true, delete: true },
    inventory: { view: true, add: true, edit: true, delete: true },
    sales: { view: true, add: true, edit: true, delete: true },
    finance: { view: true, add: true, edit: true, delete: true },
    hr: { view: true, add: true, edit: true, delete: true },
    products: { view: true, add: true, edit: true, delete: true },
    about: { view: true, add: false, edit: false, delete: false },
    users: { view: true, add: true, edit: true, delete: true },
  },
  manager: {
    dashboard: { view: true, add: false, edit: false, delete: false },
    production: { view: true, add: true, edit: true, delete: false },
    inventory: { view: true, add: true, edit: true, delete: false },
    sales: { view: true, add: true, edit: true, delete: false },
    finance: { view: true, add: false, edit: false, delete: false },
    hr: { view: false, add: false, edit: false, delete: false },
    products: { view: true, add: false, edit: false, delete: false },
    about: { view: true, add: false, edit: false, delete: false },
    users: { view: false, add: false, edit: false, delete: false },
  },
  employee: {
    dashboard: { view: true, add: false, edit: false, delete: false },
    production: { view: true, add: true, edit: false, delete: false },
    inventory: { view: true, add: false, edit: false, delete: false },
    sales: { view: false, add: false, edit: false, delete: false },
    finance: { view: false, add: false, edit: false, delete: false },
    hr: { view: false, add: false, edit: false, delete: false },
    products: { view: true, add: false, edit: false, delete: false },
    about: { view: true, add: false, edit: false, delete: false },
    users: { view: false, add: false, edit: false, delete: false },
  },
};

export function getPermission(role: UserRole, module: ModuleName): ModulePermission {
  return permissions[role][module];
}

export function canViewModule(role: UserRole, module: ModuleName): boolean {
  return permissions[role][module].view;
}

export function getNavItems(role: UserRole) {
  const allItems: { title: string; url: string; icon: string; module: ModuleName }[] = [
    { title: 'Dashboard', url: '/', icon: 'LayoutDashboard', module: 'dashboard' },
    { title: 'Production', url: '/production', icon: 'Factory', module: 'production' },
    { title: 'Inventory', url: '/inventory', icon: 'Package', module: 'inventory' },
    { title: 'Sales', url: '/sales', icon: 'ShoppingCart', module: 'sales' },
    { title: 'Finance', url: '/finance', icon: 'DollarSign', module: 'finance' },
    { title: 'Human Resources', url: '/hr', icon: 'Users', module: 'hr' },
    { title: 'Products', url: '/products', icon: 'Box', module: 'products' },
    { title: 'User Management', url: '/users', icon: 'Shield', module: 'users' },
    { title: 'About', url: '/about', icon: 'Info', module: 'about' },
  ];
  return allItems.filter(item => canViewModule(role, item.module));
}
