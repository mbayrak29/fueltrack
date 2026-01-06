import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FuelTypeProvider } from "@/contexts/FuelTypeContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EvStations from "./pages/EvStations";
import AddEvStation from "./pages/AddEvStation";
import EvStationDetail from "./pages/EvStationDetail";
import FuelStations from "./pages/FuelStations";
import AddFuelStation from "./pages/AddFuelStation";
import FuelStationDetail from "./pages/FuelStationDetail";
import Compare from "./pages/Compare";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import RouteCostPlanner from "./pages/RouteCostPlanner";
import EvNetworkDemo from "./pages/EvNetworkDemo";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/ev-stations" element={<ProtectedRoute><EvStations /></ProtectedRoute>} />
    <Route path="/ev-stations/add" element={<ProtectedRoute><AddEvStation /></ProtectedRoute>} />
    <Route path="/ev-stations/:id" element={<ProtectedRoute><EvStationDetail /></ProtectedRoute>} />
    <Route path="/fuel-stations" element={<ProtectedRoute><FuelStations /></ProtectedRoute>} />
    <Route path="/fuel-stations/add" element={<ProtectedRoute><AddFuelStation /></ProtectedRoute>} />
    <Route path="/fuel-stations/:id" element={<ProtectedRoute><FuelStationDetail /></ProtectedRoute>} />
    <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
    <Route path="/route-cost-planner" element={<ProtectedRoute><RouteCostPlanner /></ProtectedRoute>} />
    <Route path="/ev-network-demo" element={<ProtectedRoute><EvNetworkDemo /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FuelTypeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </FuelTypeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
