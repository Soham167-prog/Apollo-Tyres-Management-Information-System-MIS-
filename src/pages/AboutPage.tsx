import { AppLayout } from '@/components/AppLayout';
import { GraduationCap, Code, Building2, BarChart3 } from 'lucide-react';

export default function AboutPage() {
  return (
    <AppLayout title="About">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-lg border bg-card p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary mx-auto mb-4">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold text-card-foreground mb-1">
            Management Information System Prototype
          </h2>
          <p className="text-lg text-primary font-display font-semibold">Apollo Tyres Ltd.</p>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Student</p>
              <p className="font-display font-semibold text-card-foreground">Soham Santosh Narayankhedkar</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Code className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Course</p>
              <p className="font-display font-semibold text-card-foreground">B.Tech MIS Project</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start gap-3 mb-3">
            <BarChart3 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Project Description</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This project demonstrates a working Management Information System integrating production, inventory, sales, finance, and HR data with interactive dashboards and analytics. It showcases how an MIS supports decision-making and reporting within a large manufacturing company like Apollo Tyres Ltd.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Technology Stack</p>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'TailwindCSS', 'Recharts', 'shadcn/ui', 'Vite'].map(tech => (
              <span key={tech} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{tech}</span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Modules</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['Production', 'Inventory', 'Sales', 'Finance', 'Human Resources', 'Products'].map(m => (
              <div key={m} className="rounded bg-muted px-3 py-2 text-xs font-medium text-foreground text-center">{m}</div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
