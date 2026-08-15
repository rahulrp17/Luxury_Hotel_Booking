import { axiosInstance } from "@/api";
import { API } from "@/constants/api";
import { buildQueryString } from "@/utils/helpers";

export const roomService = {
  getRooms: (params = {}) =>
    axiosInstance
      .get(`${API.ROOMS.LIST}${buildQueryString(params)}`)
      .then((res) => res.data),

  // Featured reads go through react-query (dedup + TTL); the server caches
  // /rooms/featured in Redis. A module-level promise cache previously kept
  // resolved payloads alive for the session and could go stale after edits.
  getFeaturedRooms: (params = {}) =>
    axiosInstance
      .get(`${API.ROOMS.FEATURED}${buildQueryString(params)}`)
      .then((res) => res.data),

  getByHotel: (hotelId, params = {}) =>
    axiosInstance
      .get(
        `${API.ROOMS.BY_HOTEL}/${hotelId}${buildQueryString(params)}`
      )
      .then((res) => res.data),

  getRoom: (id) =>
    axiosInstance
      .get(`${API.ROOMS.DETAIL}/${id}`)
      .then((res) => res.data),

  getAvailability: (id, params = {}) =>
    axiosInstance
      .get(
        `${API.ROOMS.AVAILABILITY}/${id}/availability${buildQueryString(
          params
        )}`
      )
      .then((res) => res.data),

  getBlockedDates: (id, params = {}) =>
    axiosInstance
      .get(
        `${API.ROOMS.BLOCKED_DATES}/${id}/blocked-dates${buildQueryString(
          params
        )}`
      )
      .then((res) => res.data),

  // ADMIN
  adminCreate: (payload) =>
    axiosInstance
      .post(API.ROOMS.CREATE, payload)
      .then((res) => res.data),

  adminUpdate: (id, payload) =>
    axiosInstance
      .put(`${API.ROOMS.UPDATE}/${id}`, payload)
      .then((res) => res.data),

  adminDelete: (id) =>
    axiosInstance
      .delete(`${API.ROOMS.DELETE}/${id}`)
      .then((res) => res.data),

  // ADD MULTIPLE IMAGES
  adminAddImages: async (id, files) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    const res = await axiosInstance.post(
      `${API.ROOMS.IMAGES}/${id}/images`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data;
  },

  // REMOVE IMAGE
  adminRemoveImage: (id, imageId) =>
    axiosInstance
      .delete(`${API.ROOMS.IMAGES}/${id}/images/${encodeURIComponent(imageId)}`)
      .then((res) => res.data),
};

export default roomService;