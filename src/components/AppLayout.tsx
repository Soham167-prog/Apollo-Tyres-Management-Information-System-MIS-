import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';

export function AppLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <img
                src="/apollo_tyres logo.jpg"
                alt="Apollo Tyres logo"
                className="h-8 w-auto object-contain"
              />
              <SidebarTrigger />
              <h1 className="font-display font-semibold text-lg text-foreground">{title}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="capitalize font-medium text-foreground">{user?.name}</span>
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">{user?.role}</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
