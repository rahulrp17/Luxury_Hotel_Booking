import { axiosInstance } from "@/api";
import { API } from "@/constants/api";
import { buildQueryString } from "@/utils/helpers";

const appendFormValue = (formData, key, value) => {
  if (value === undefined || value === null) return;
  if (typeof value === "object") {
    formData.append(key, JSON.stringify(value)); // e.g. rating object
  } else {
    formData.append(key, String(value));
  }
};

export const reviewService = {
  getByHotel: (hotelId, params = {}) =>
    axiosInstance
      .get(`${API.REVIEWS.BY_HOTEL}/${hotelId}${buildQueryString(params)}`)
      .then((res) => res.data),

  create: (payload) => {
    const { images = [], ...rest } = payload;
    const formData = new FormData();
    Object.entries(rest).forEach(([key, value]) => appendFormValue(formData, key, value));
    images.forEach((file) => formData.append("images", file));
    return axiosInstance
      .post(API.REVIEWS.CREATE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  update: (id, payload) =>
    axiosInstance.put(`${API.REVIEWS.UPDATE}/${id}`, payload).then((res) => res.data),

  remove: (id) =>
    axiosInstance.delete(`${API.REVIEWS.DELETE}/${id}`).then((res) => res.data),

  toggleHelpful: (id) =>
    axiosInstance.patch(`${API.REVIEWS.HELPFUL}/${id}/helpful`).then((res) => res.data),

  respond: (id, text) =>
    axiosInstance.post(`${API.REVIEWS.RESPOND}/${id}/respond`, { text }).then((res) => res.data),
};

export default reviewService;