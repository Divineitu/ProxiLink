import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import VendorDashboard from "./pages/VendorDashboard";
import ServiceCreate from "./pages/ServiceCreate";
import ServiceList from "./pages/ServiceList";
import ApiKeyDiagnostic from "./pages/ApiKeyDiagnostic";
import AdminDashboard from "./pages/AdminDashboard";
import ServiceProfile from "./pages/ServiceProfile";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Payments from "./pages/Payments";
import Orders from "./pages/Orders";
import NotificationsPage from "./pages/NotificationsPage";
import About from "./pages/About";
import Support from "./pages/Support";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/services" element={<ServiceList />} />
          <Route path="/service/create" element={<ServiceCreate />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/service/:id" element={<ServiceProfile />} />
          <Route path="/api-diagnostic" element={<ApiKeyDiagnostic />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
