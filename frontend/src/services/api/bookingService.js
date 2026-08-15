import { axiosInstance } from "@/api";
import { API } from "@/constants/api";
import { buildQueryString } from "@/utils/helpers";

export const bookingService = {
  create: (payload) =>
    axiosInstance.post(API.BOOKINGS.CREATE, payload).then((res) => res.data),

  getMyBookings: (params = {}) =>
    axiosInstance.get(`${API.BOOKINGS.LIST}${buildQueryString(params)}`).then((res) => res.data),

  getById: (id) =>
    axiosInstance.get(`${API.BOOKINGS.DETAIL}/${id}`).then((res) => res.data),

  cancel: (id, reason = "") =>
    axiosInstance.patch(`${API.BOOKINGS.CANCEL}/${id}/cancel`, { reason }).then((res) => res.data),

  adminGetAll: (params = {}) =>
    axiosInstance.get(`${API.BOOKINGS.ADMIN_ALL}${buildQueryString(params)}`).then((res) => res.data),

  // Latest bookings for the dashboard. Reuses the admin endpoint and normalizes
  // the paginated envelope (`res.data.data` is the array) to a predictable
  // `{ data: [...] }` shape so the consumer never reaches into nested keys.
  adminGetRecent: (params = {}) =>
    axiosInstance
      .get(`${API.BOOKINGS.ADMIN_ALL}${buildQueryString(params)}`)
      .then((res) => ({ data: res.data?.data || [] })),

  adminUpdateStatus: (id, status) =>
    axiosInstance
      .patch(`${API.BOOKINGS.ADMIN_STATUS}/${id}/status`, { status })
      .then((res) => res.data),
};

export default bookingService;
