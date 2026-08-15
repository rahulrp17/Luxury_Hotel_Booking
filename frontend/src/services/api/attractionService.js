import { axiosInstance } from "@/api";
import { API } from "@/constants/api";
import { buildQueryString } from "@/utils/helpers";

/**
 * Attractions service — consumes the public /attractions endpoints (nearby
 * points of interest surfaced on the Hotel Details "nearby places" section).
 * All methods resolve the API envelope (`res.data`) so callers read
 * `result.data` / `result.pagination` exactly like the other list services.
 */
export const attractionService = {
  getNearby: (params = {}) =>
    axiosInstance.get(`${API.ATTRACTIONS.NEARBY}${buildQueryString(params)}`).then((res) => res.data),

  getFeatured: (params = {}) =>
    axiosInstance.get(`${API.ATTRACTIONS.FEATURED}${buildQueryString(params)}`).then((res) => res.data),

  getAttractions: (params = {}) =>
    axiosInstance.get(`${API.ATTRACTIONS.LIST}${buildQueryString(params)}`).then((res) => res.data),

  getAttraction: (id) =>
    axiosInstance.get(`${API.ATTRACTIONS.DETAIL}/${id}`).then((res) => res.data),
};

export default attractionService;
