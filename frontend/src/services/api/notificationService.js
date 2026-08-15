import { axiosInstance } from "@/api";
import { API } from "@/constants/api";
import { buildQueryString } from "@/utils/helpers";

export const notificationService = {
  getMyNotifications: (params = {}) =>
    axiosInstance
      .get(`${API.NOTIFICATIONS.LIST}${buildQueryString(params)}`)
      .then((res) => res.data),

  markAllRead: () =>
    axiosInstance.patch(API.NOTIFICATIONS.READ_ALL).then((res) => res.data),

  markRead: (id) =>
    axiosInstance.patch(`${API.NOTIFICATIONS.READ}/${id}/read`).then((res) => res.data),

  remove: (id) =>
    axiosInstance.delete(`${API.NOTIFICATIONS.DELETE}/${id}`).then((res) => res.data),
};

export default notificationService;