import { Request, Response, NextFunction } from 'express';

/**
 * Validate that required fields exist and are non-empty in request body
 * @param fields - Array of required field names
 */
export const validateBody = (fields: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a valid JSON object.',
      });
    }

    const missing: string[] = [];
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
 * @param field - Field name (defaults to 'email')
 */
export const validateEmail = (field: string = 'email') => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
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
 * @param paramName - Name of the URL parameter
 */
export const validateIntParam = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
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
 * Automatically normalizes case-insensitive or hyphenated variants
 * @param field - Field name
 * @param allowedValues - Array of allowed values
 */
export const validateEnum = (field: string, allowedValues: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const val = req.body[field];
    if (val !== undefined && val !== null) {
      if (allowedValues.includes(val)) {
        return next();
      }

      // Normalization check: case-insensitive, hyphen-to-space, or space-to-hyphen
      const strVal = String(val).trim().toLowerCase();
      const matched = allowedValues.find((allowed) => {
        const strAllowed = allowed.toLowerCase();
        return (
          strAllowed === strVal ||
          strAllowed.replace(/\s+/g, '-') === strVal ||
          strAllowed === strVal.replace(/-/g, ' ')
        );
      });

      if (matched) {
        req.body[field] = matched;
        return next();
      }

      return res.status(400).json({
        success: false,
        message: `Invalid value for field '${field}'. Allowed values: [${allowedValues.join(', ')}]. Received: '${val}'.`,
      });
    }
    next();
  };
};
