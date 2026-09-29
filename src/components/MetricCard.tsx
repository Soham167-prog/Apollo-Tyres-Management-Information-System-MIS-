import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
}

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  destructive: 'bg-destructive/10 text-destructive',
};

export function MetricCard({ title, value, icon: Icon, trend, trendUp, color = 'primary' }: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-start gap-3">
      <div className={`rounded-md p-2 ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
        <p className="text-2xl font-display font-bold text-card-foreground mt-0.5">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
    </div>
  );
}
