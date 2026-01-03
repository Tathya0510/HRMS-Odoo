import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Employee Pages
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeAttendance from "./pages/employee/Attendance";
import EmployeeLeave from "./pages/employee/Leave";
import EmployeePayroll from "./pages/employee/Payroll";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEmployees from "./pages/admin/Employees";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminLeave from "./pages/admin/AdminLeave";
import AdminPayroll from "./pages/admin/AdminPayroll";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Employee Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeLeave />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeePayroll />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEmployees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leave"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLeave />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payroll"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPayroll />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
