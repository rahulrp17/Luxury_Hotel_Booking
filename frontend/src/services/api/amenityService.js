import { axiosInstance } from "@/api";
import { API } from "@/constants/api";
import { buildQueryString } from "@/utils/helpers";

export const amenityService = {
  getAll: (params = {}) =>
    axiosInstance.get(`${API.AMENITIES.LIST}${buildQueryString(params)}`).then((res) => res.data),

  getById: (id) =>
    axiosInstance.get(`${API.AMENITIES.DETAIL}/${id}`).then((res) => res.data),

  adminCreate: (payload) =>
    axiosInstance.post(API.AMENITIES.CREATE, payload).then((res) => res.data),

  adminUpdate: (id, payload) =>
    axiosInstance.put(`${API.AMENITIES.UPDATE}/${id}`, payload).then((res) => res.data),

  adminDelete: (id) =>
    axiosInstance.delete(`${API.AMENITIES.DELETE}/${id}`).then((res) => res.data),
};

export default amenityService;