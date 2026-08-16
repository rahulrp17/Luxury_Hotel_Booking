const { body } = require("express-validator");

const chatValidator = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
];

module.exports = { chatValidator };