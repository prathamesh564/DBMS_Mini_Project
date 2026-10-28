/**
 * Validation middlewares for request validation
 */

/**
 * Validate that required fields exist and are non-empty in request body
 * @param {string[]} fields
 */
const validateBody = (fields = []) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a valid JSON object.',
      });
    }

    const missing = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || String(req.body[field]).trim() === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missing.join(', ')}`,
        missingFields: missing,
      });
    }

    next();
  };
};

/**
 * Validate email format
 * @param {string} field - Field name (defaults to 'email')
 */
const validateEmail = (field = 'email') => {
  return (req, res, next) => {
    const value = req.body[field];
    if (value !== undefined && value !== null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value).trim())) {
        return res.status(400).json({
          success: false,
          message: `Invalid email address format for field '${field}'.`,
        });
      }
    }
    next();
  };
};

/**
 * Validate ID param is a valid positive integer
 * @param {string} paramName - Name of the URL parameter
 */
const validateIntParam = (paramName = 'id') => {
  return (req, res, next) => {
    const value = req.params[paramName];
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed <= 0) {
      return res.status(400).json({
        success: false,
        message: `Parameter '${paramName}' must be a valid positive integer. Received: '${value}'.`,
      });
    }
    next();
  };
};

/**
 * Validate field value against allowed enum values
 * @param {string} field - Field name
 * @param {string[]} allowedValues - Array of allowed values
 */
const validateEnum = (field, allowedValues = []) => {
  return (req, res, next) => {
    const val = req.body[field];
    if (val !== undefined && val !== null && !allowedValues.includes(val)) {
      return res.status(400).json({
        success: false,
        message: `Invalid value for field '${field}'. Allowed values: [${allowedValues.join(', ')}]. Received: '${val}'.`,
      });
    }
    next();
  };
};

module.exports = {
  validateBody,
  validateEmail,
  validateIntParam,
  validateEnum,
};
