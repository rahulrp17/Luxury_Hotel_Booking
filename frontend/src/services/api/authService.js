import { axiosInstance } from "@/api";
import { API } from "@/constants/api";

/**
 * Auth API service. Each method resolves to the backend's `ApiResponse`
 * envelope: { success, statusCode, message, data }.
 */
export const authService = {
  register: (payload) =>
    axiosInstance.post(API.AUTH.REGISTER, payload).then((res) => res.data),

  login: (credentials) =>
    axiosInstance.post(API.AUTH.LOGIN, credentials).then((res) => res.data),

  logout: () => axiosInstance.post(API.AUTH.LOGOUT).then((res) => res.data),

  getMe: () => axiosInstance.get(API.AUTH.ME).then((res) => res.data),

  verifyEmail: (token) =>
    axiosInstance.get(`${API.AUTH.VERIFY_EMAIL}/${token}`).then((res) => res.data),

  resendVerification: (email) =>
    axiosInstance.post(API.AUTH.RESEND_VERIFICATION, { email }).then((res) => res.data),

  forgotPassword: (email) =>
    axiosInstance.post(API.AUTH.FORGOT_PASSWORD, { email }).then((res) => res.data),

  resetPassword: (token, password, confirmPassword) =>
    axiosInstance
      .post(`${API.AUTH.RESET_PASSWORD}/${token}`, { password, confirmPassword })
      .then((res) => res.data),

  changePassword: (payload) =>
    axiosInstance.patch(API.AUTH.CHANGE_PASSWORD, payload).then((res) => res.data),
};

export default authService;
