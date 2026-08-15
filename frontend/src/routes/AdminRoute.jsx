import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectUser } from "@/store/slices/authSlice";
import { USER_ROLES } from "@/constants/enums";
import { ROUTES } from "@/constants/routes";

/**
 * Guard for admin-only routes. Renders the nested <Outlet /> only for
 * authenticated ADMIN users; everyone else is redirected.
 */
const AdminRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (!isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;