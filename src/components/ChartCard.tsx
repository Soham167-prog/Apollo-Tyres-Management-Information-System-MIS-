import { ReactNode } from 'react';

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-display font-semibold text-sm text-card-foreground mb-3">{title}</h3>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
}
