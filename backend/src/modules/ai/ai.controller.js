const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const aiService = require("./ai.service");

const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const result = await aiService.handleChat(message);
  return ApiResponse.success(res, "AI concierge response.", result);
});

module.exports = { chat };