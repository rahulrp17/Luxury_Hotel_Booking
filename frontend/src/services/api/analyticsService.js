import { axiosInstance } from "@/api";
import { API } from "@/constants/api";

export const analyticsService = {
  overview: () =>
    axiosInstance.get(API.ANALYTICS.OVERVIEW).then((res) => res.data),

  revenue: () =>
    axiosInstance.get(API.ANALYTICS.REVENUE).then((res) => res.data),

  occupancy: () =>
    axiosInstance.get(API.ANALYTICS.OCCUPANCY).then((res) => res.data),

  topHotels: () =>
    axiosInstance.get(API.ANALYTICS.TOP_HOTELS).then((res) => res.data),

  bookingSummary: () =>
    axiosInstance.get(API.ANALYTICS.BOOKING_SUMMARY).then((res) => res.data),
};

export default analyticsService;