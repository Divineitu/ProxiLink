import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Eager load critical landing pages
import Index from "./pages/Index";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load dashboard and feature pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const ServiceCreate = lazy(() => import("./pages/ServiceCreate"));
const ServiceList = lazy(() => import("./pages/ServiceList"));
const ApiKeyDiagnostic = lazy(() => import("./pages/ApiKeyDiagnostic"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ServiceProfile = lazy(() => import("./pages/ServiceProfile"));
const Profile = lazy(() => import("./pages/Profile"));
const Payments = lazy(() => import("./pages/Payments"));
const Orders = lazy(() => import("./pages/Orders"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const Messages = lazy(() => import("./pages/Messages"));
const About = lazy(() => import("./pages/About"));
const Support = lazy(() => import("./pages/Support"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/splash" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/vendor/dashboard" element={<ProtectedRoute requiredRole="vendor"><VendorDashboard /></ProtectedRoute>} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/service/create" element={<ProtectedRoute requiredRole="vendor"><ServiceCreate /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<Support />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/service/:id" element={<ServiceProfile />} />
            <Route path="/api-diagnostic" element={<ApiKeyDiagnostic />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
