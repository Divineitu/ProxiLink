import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        checkRole(session.user.id);
      } else {
        setHasRequiredRole(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [requiredRole]);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsAuthenticated(true);
        if (requiredRole) {
          await checkRole(session.user.id);
        } else {
          setHasRequiredRole(true);
          setLoading(false);
        }
      } else {
        setIsAuthenticated(false);
        setHasRequiredRole(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const checkRole = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (roleData) {
        const userRole = roleData.role;
        const allowedRoles = Array.isArray(requiredRole)
          ? requiredRole
          : [requiredRole];

        if (requiredRole && !allowedRoles.includes(userRole)) {
          setHasRequiredRole(false);
          toast.error("You don't have permission to access this page");
        } else {
          setHasRequiredRole(true);
        }
      } else {
        setHasRequiredRole(false);
      }
    } catch (error) {
      console.error("Role check error:", error);
      setHasRequiredRole(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
