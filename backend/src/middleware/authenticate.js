const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * Middleware to verify JWT token and attach user profile to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No Bearer token provided in Authorization header.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token format.',
      });
    }

    // Attempt token verification with app JWT_SECRET or SUPABASE_JWT_SECRET
    const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'women_skill_portal_super_secret_jwt_key_2025_secure';
    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      // In case Supabase token is signed differently or token expired
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or expired token.',
        details: jwtErr.message,
      });
    }

    const userId = decoded.userId || decoded.sub || decoded.id;
    const email = decoded.email;

    // Retrieve user profile from database
    const userRes = await query(
      `SELECT user_id, email, role, auth_id 
       FROM women_skill_portal.user_profiles 
       WHERE user_id = $1 OR email = $2 OR auth_id = $3
       LIMIT 1`,
      [isNaN(userId) ? -1 : parseInt(userId, 10), email || '', String(userId)]
    );

    if (userRes.rows.length === 0) {
      // If user profile isn't in DB yet, fallback to decoded JWT role or return 401
      if (decoded.role) {
        req.user = {
          userId: decoded.userId || decoded.id,
          email: decoded.email,
          role: decoded.role,
          womanId: decoded.womanId || null,
          providerId: decoded.providerId || null,
          employerId: decoded.employerId || null,
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'User profile not found for this account. Please register your profile.',
      });
    }

    const user = userRes.rows[0];

    // Find linked role entities
    let womanId = null;
    let providerId = null;
    let employerId = null;

    if (user.role === 'woman') {
      const wRes = await query(
        `SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1 OR email = $2 LIMIT 1`,
        [user.user_id, user.email]
      );
      if (wRes.rows.length > 0) {
        womanId = wRes.rows[0].woman_id;
      }
    } else if (user.role === 'training_provider') {
      const pRes = await query(
        `SELECT provider_id FROM women_skill_portal.training_providers WHERE user_id = $1 OR email = $2 LIMIT 1`,
        [user.user_id, user.email]
      );
      if (pRes.rows.length > 0) {
        providerId = pRes.rows[0].provider_id;
      }
    } else if (user.role === 'employer') {
      const eRes = await query(
        `SELECT employer_id FROM women_skill_portal.employers WHERE user_id = $1 OR email = $2 LIMIT 1`,
        [user.user_id, user.email]
      );
      if (eRes.rows.length > 0) {
        employerId = eRes.rows[0].employer_id;
      }
    }

    req.user = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      womanId,
      providerId,
      employerId,
    };

    next();
  } catch (err) {
    console.error('Authentication middleware error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication verification.',
    });
  }
};

/**
 * Optional authentication middleware: attaches req.user if token is present, does not reject if missing
 */
const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};
