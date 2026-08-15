import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  logout,
  selectIsAuthenticated,
  selectUser,
} from "@/store/slices/authSlice";
import { USER_ROLES } from "@/constants/enums";

/**
 * Convenience hook exposing auth state + logout as an object.
 */
const useAuth = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  return {
    isAuthenticated,
    user,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isManager: user?.role === USER_ROLES.HOTEL_MANAGER,
    logout: () => dispatch(logout()),
  };
};

export default useAuth;
