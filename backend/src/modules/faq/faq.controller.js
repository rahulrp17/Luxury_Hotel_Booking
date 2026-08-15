const faqService = require("./faq.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const getFaqs = asyncHandler(async (req, res) => {
  const { faqs, pagination } = await faqService.getFaqs(req.query);
  return ApiResponse.paginated(res, "FAQs fetched.", faqs, pagination);
});

const getPublicFaqs = asyncHandler(async (req, res) => {
  const { faqs } = await faqService.getPublicFaqs(req.query);
  return ApiResponse.success(res, "FAQs fetched.", faqs);
});

const getFaqById = asyncHandler(async (req, res) => {
  const item = await faqService.getFaqById(req.params.id);
  return ApiResponse.success(res, "FAQ fetched.", item);
});

const createFaq = asyncHandler(async (req, res) => {
  const item = await faqService.createFaq(req.body);
  return ApiResponse.created(res, "FAQ created.", item);
});

const updateFaq = asyncHandler(async (req, res) => {
  const item = await faqService.updateFaq(req.params.id, req.body);
  return ApiResponse.success(res, "FAQ updated.", item);
});

const deleteFaq = asyncHandler(async (req, res) => {
  await faqService.deleteFaq(req.params.id);
  return ApiResponse.success(res, "FAQ deleted.");
});

module.exports = {
  getFaqs,
  getPublicFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
};