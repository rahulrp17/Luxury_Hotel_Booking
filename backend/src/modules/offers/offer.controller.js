const offerService = require("./offer.service");
const pricingService = require("../../services/pricing.service");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

const validateOffer = asyncHandler(async (req, res) => {
  const { code, amount, hotelId, roomId } = req.body;
  if (!code || !amount) {
    throw ApiError.badRequest("Offer code and booking amount are required.");
  }

  const offer = await offerService.validateOffer(code, amount, hotelId, roomId);
  const discountAmount = pricingService.calculateOfferDiscount(offer, amount);

  return ApiResponse.success(res, "Offer applied successfully.", {
    offerCode: offer.code,
    discountAmount,
    offerDetails: {
      title: offer.title,
      type: offer.type,
      value: offer.value,
    }
  });
});

const getActiveOffers = asyncHandler(async (req, res) => {
  const { offers, pagination } = await offerService.getActiveOffers(req.query);
  return ApiResponse.paginated(res, "Active offers fetched.", offers, pagination);
});

// Admin Controllers
const getAllOffers = asyncHandler(async (req, res) => {
  const { offers, pagination } = await offerService.getAllOffers(req.query);
  return ApiResponse.paginated(res, "All offers fetched.", offers, pagination);
});

const createOffer = asyncHandler(async (req, res) => {
  const offer = await offerService.createOffer(req.body);
  return ApiResponse.created(res, "Offer created successfully.", offer);
});

const updateOffer = asyncHandler(async (req, res) => {
  const offer = await offerService.updateOffer(req.params.id, req.body);
  return ApiResponse.success(res, "Offer updated successfully.", offer);
});

module.exports = {
  validateOffer,
  getActiveOffers,
  getAllOffers,
  createOffer,
  updateOffer,
};
