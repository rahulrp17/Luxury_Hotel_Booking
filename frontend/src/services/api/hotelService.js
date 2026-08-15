import { axiosInstance } from "@/api";
import { API } from "@/constants/api";
import { buildQueryString } from "@/utils/helpers";

export const hotelService = {
  getHotels: (params = {}) =>
    axiosInstance.get(`${API.HOTELS.LIST}${buildQueryString(params)}`).then((res) => res.data),

  /** Admin hotel list — includes inactive/soft-deleted hotels, uncached. */
  adminGetAll: (params = {}) =>
    axiosInstance.get(`${API.HOTELS.ADMIN_ALL}${buildQueryString(params)}`).then((res) => res.data),

  // NOTE: featured reads go through react-query (dedup + TTL). The server also
  // caches /hotels/featured in Redis, so there is no need for a module-level
  // promise cache here (it previously held resolved payloads for the whole
  // session and could go stale after admin edits).
  getFeaturedHotels: (params = {}) =>
    axiosInstance.get(`${API.HOTELS.FEATURED}${buildQueryString(params)}`).then((res) => res.data),
  getHotel: (id) =>
    axiosInstance.get(`${API.HOTELS.DETAIL}/${id}`).then((res) => res.data),

  searchHotels: (params = {}) =>
    axiosInstance.get(`${API.HOTELS.SEARCH}${buildQueryString(params)}`).then((res) => res.data),

  getFeatured: (limit = 6) =>
    axiosInstance.get(`${API.HOTELS.FEATURED}?limit=${limit}`).then((res) => res.data),

  getNearby: (params = {}) =>
    axiosInstance.get(`${API.HOTELS.NEARBY}${buildQueryString(params)}`).then((res) => res.data),

  adminCreate: (payload) =>
    axiosInstance.post(API.HOTELS.CREATE, payload).then((res) => res.data),

  adminUpdate: (id, payload) =>
    axiosInstance.put(`${API.HOTELS.UPDATE}/${id}`, payload).then((res) => res.data),

  adminDelete: (id) =>
    axiosInstance.delete(`${API.HOTELS.DELETE}/${id}`).then((res) => res.data),

  adminAddImages: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return axiosInstance
      .post(`${API.HOTELS.IMAGES}/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  adminRemoveImage: (id, imageId) =>
    axiosInstance.delete(`${API.HOTELS.IMAGES}/${id}/images/${encodeURIComponent(imageId)}`).then((res) => res.data),

  adminSetPrimary: (id, imageId) =>
    axiosInstance.patch(`${API.HOTELS.IMAGES}/${id}/images/${encodeURIComponent(imageId)}/primary`).then((res) => res.data),
};

export default hotelService;
