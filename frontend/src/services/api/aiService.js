import { axiosInstance } from "@/api";
import { API } from "@/constants/api";

export const aiService = {
  /**
   * Send a message to the AureliaStay AI Concierge.
   * @param {string} message
   * @returns {Promise<{success: boolean, data: object}>}
   */
  chat: (message) =>
    axiosInstance.post(API.AI.CHAT, { message }).then((res) => res.data),
};

export default aiService;