import { axiosInstance } from "@/api";
import { API } from "@/constants/api";
import { buildQueryString } from "@/utils/helpers";

export const offerService = {
  getActive: (params = {}) =>
    axiosInstance.get(`${API.OFFERS.ACTIVE}${buildQueryString(params)}`).then((res) => res.data),

  validate: (code, amount, hotelId, roomId) =>
    axiosInstance
      .post(API.OFFERS.VALIDATE, { code, amount, hotelId, roomId })
      .then((res) => res.data),

  adminGetAll: (params = {}) =>
    axiosInstance.get(`${API.OFFERS.ADMIN_ALL}${buildQueryString(params)}`).then((res) => res.data),

  adminCreate: (payload) =>
    axiosInstance.post(API.OFFERS.CREATE, payload).then((res) => res.data),

  adminUpdate: (id, payload) =>
    axiosInstance.put(`${API.OFFERS.UPDATE}/${id}`, payload).then((res) => res.data),

  adminUploadBanner: (id, file, onProgress) => {
    const formData = new FormData();
    formData.append("banner", file);
    return axiosInstance
      .post(`${API.OFFERS.BANNER}/${id}/banner`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: onProgress,
      })
      .then((res) => res.data);
  },

  adminRemoveBanner: (id) =>
    axiosInstance.delete(`${API.OFFERS.BANNER}/${id}/banner`).then((res) => res.data),
};

export default offerService;