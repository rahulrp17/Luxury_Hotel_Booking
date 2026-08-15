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
};

export default offerService;