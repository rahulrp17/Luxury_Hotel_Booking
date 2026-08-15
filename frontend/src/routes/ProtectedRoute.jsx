import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { ROUTES } from "@/constants/routes";

/**
 * Guard for authenticated user routes. Renders the nested <Outlet /> when the
 * user is logged in, otherwise redirects to login while remembering where they
 * were headed so they can be returned after login.
 */
const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
