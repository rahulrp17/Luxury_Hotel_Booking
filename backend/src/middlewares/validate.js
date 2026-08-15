const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Validate request using express-validator results
 * Place this AFTER the validator chain middlewares
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    throw ApiError.unprocessable("Validation failed", errorMessages);
  }

  next();
};

module.exports = validate;
