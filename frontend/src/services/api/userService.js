import { axiosInstance } from "@/api";
import { API } from "@/constants/api";

export const userService = {
  getProfile: () =>
    axiosInstance.get(API.USERS.PROFILE).then((res) => res.data),

  updateProfile: (payload) =>
    axiosInstance.put(API.USERS.UPDATE_PROFILE, payload).then((res) => res.data),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return axiosInstance
      .post(API.USERS.AVATAR, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  adminGetAll: (params = {}) =>
    axiosInstance.get(API.USERS.ADMIN_ALL, { params }).then((res) => res.data),

  // Latest users for the dashboard. Reuses the admin endpoint and normalizes
  // the paginated envelope (`res.data.data` is the array) to a predictable
  // `{ data: [...] }` shape so the consumer never reaches into nested keys.
  adminGetRecent: (params = {}) =>
    axiosInstance
      .get(API.USERS.ADMIN_ALL, { params })
      .then((res) => ({ data: res.data?.data || [] })),

  adminToggle: (userId) =>
    axiosInstance.patch(`${API.USERS.ADMIN_TOGGLE}/${userId}/toggle`).then((res) => res.data),
};

export default userService;
