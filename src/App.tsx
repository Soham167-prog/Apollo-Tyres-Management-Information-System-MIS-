import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { canViewModule } from "@/lib/permissions";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductionPage from "./pages/ProductionPage";
import InventoryPage from "./pages/InventoryPage";
import SalesPage from "./pages/SalesPage";
import FinancePage from "./pages/FinancePage";
import HRPage from "./pages/HRPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ module, children }: { module: string; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  if (!canViewModule(user.role, module as any)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/production" element={<ProtectedRoute module="production"><ProductionPage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute module="inventory"><InventoryPage /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute module="sales"><SalesPage /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute module="finance"><FinancePage /></ProtectedRoute>} />
      <Route path="/hr" element={<ProtectedRoute module="hr"><HRPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute module="products"><ProductsPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute module="users"><UsersPage /></ProtectedRoute>} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
