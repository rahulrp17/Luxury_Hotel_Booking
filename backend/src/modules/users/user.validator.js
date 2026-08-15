const { body } = require("express-validator");

const updateProfileValidator = [
  body("name").optional().trim().isLength({ min: 2, max: 50 }),
  body("phone").optional().trim().matches(/^[+]?[\d\s\-()]{7,15}$/),
  body("address.street").optional().trim(),
  body("address.city").optional().trim(),
  body("address.state").optional().trim(),
  body("address.pincode").optional().trim(),
  body("preferences.currency").optional().isString(),
  body("preferences.language").optional().isString(),
  body("preferences.notifications.email").optional().isBoolean(),
  body("preferences.notifications.sms").optional().isBoolean(),
  body("preferences.notifications.inApp").optional().isBoolean(),
];

module.exports = { updateProfileValidator };
