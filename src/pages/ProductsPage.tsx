import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { MetricCard } from '@/components/MetricCard';
import { Box, Car, Truck } from 'lucide-react';
import { api } from '@/lib/api';

interface Product {
  product_id: number;
  product_name: string;
  tyre_type: string;
  vehicle_type: string;
  price: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api
      .get<Product[]>('/products')
      .then(setProducts)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load products', err);
      });
  }, []);

  const byType: Record<string, number> = {};
  products.forEach((p) => {
    byType[p.vehicle_type] = (byType[p.vehicle_type] || 0) + 1;
  });

  return (
    <AppLayout title="Product Catalog">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Products" value={products.length} icon={Box} color="primary" />
        <MetricCard title="Passenger Car" value={byType['Passenger Car'] || 0} icon={Car} color="info" />
        <MetricCard title="Truck" value={byType['Truck'] || 0} icon={Truck} color="warning" />
        <MetricCard title="Two Wheeler" value={byType['Two Wheeler'] || 0} icon={Box} color="success" />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Product ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Product Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Tyre Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Vehicle Type</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Price (₹)</th>
            </tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.product_id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{p.product_id}</td>
                  <td className="px-3 py-2 font-medium">{p.product_name}</td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">{p.tyre_type}</span>
                  </td>
                  <td className="px-3 py-2">{p.vehicle_type}</td>
                  <td className="px-3 py-2 text-right font-medium">₹{p.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
