import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Applications from "./pages/dashboard/Applications";
import ApplicationDetail from "./pages/dashboard/ApplicationDetail";
import Distress from "./pages/dashboard/Distress";
import Analytics from "./pages/dashboard/Analytics";
import Placeholder from "./pages/dashboard/Placeholder";
import { AuthProvider, RequireAuth } from "./lib/auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
              <Route index element={<Overview />} />
              <Route path="applications" element={<Applications />} />
              <Route path="applications/:id" element={<ApplicationDetail />} />
              <Route path="distress" element={<Distress />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="map" element={<Placeholder title="Map View" subtitle="Geographic distribution of applications" />} />
              <Route path="reports" element={<Placeholder title="Reports" subtitle="Regulatory exports & summaries" />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
