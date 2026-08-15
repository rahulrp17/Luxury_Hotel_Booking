import { axiosInstance } from "@/api";
import { API } from "@/constants/api";

export const paymentService = {
  createOrder: (bookingId) =>
    axiosInstance.post(API.PAYMENTS.CREATE_ORDER, { bookingId }).then((res) => res.data),

  verify: (payload) =>
    axiosInstance.post(API.PAYMENTS.VERIFY, payload).then((res) => res.data),

  getById: (id) =>
    axiosInstance.get(`${API.PAYMENTS.DETAIL}/${id}`).then((res) => res.data),

  adminRefund: (id, payload = {}) =>
    axiosInstance.post(`${API.PAYMENTS.REFUND}/${id}/refund`, payload).then((res) => res.data),
};

export default paymentService;
