const testimonialService = require("./testimonial.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const getTestimonials = asyncHandler(async (req, res) => {
  const { testimonials, pagination } = await testimonialService.getTestimonials(req.query);
  return ApiResponse.paginated(res, "Testimonials fetched.", testimonials, pagination);
});

const getFeaturedTestimonials = asyncHandler(async (req, res) => {
  const { testimonials } = await testimonialService.getFeaturedTestimonials(req.query);
  return ApiResponse.success(res, "Featured testimonials fetched.", testimonials);
});

const getTestimonialById = asyncHandler(async (req, res) => {
  const item = await testimonialService.getTestimonialById(req.params.id);
  return ApiResponse.success(res, "Testimonial fetched.", item);
});

const createTestimonial = asyncHandler(async (req, res) => {
  const item = await testimonialService.createTestimonial(req.body);
  return ApiResponse.created(res, "Testimonial created.", item);
});

const updateTestimonial = asyncHandler(async (req, res) => {
  const item = await testimonialService.updateTestimonial(req.params.id, req.body);
  return ApiResponse.success(res, "Testimonial updated.", item);
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  await testimonialService.deleteTestimonial(req.params.id);
  return ApiResponse.success(res, "Testimonial deleted.");
});

module.exports = {
  getTestimonials,
  getFeaturedTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};