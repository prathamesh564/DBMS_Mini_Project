import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { verifyToken, TokenPayload } from '../config/jwt';
import { AuthUser, UserRole } from '../types';

interface DecodedToken extends TokenPayload {
  sub?: string;
  id?: number;
}

/**
 * Middleware to verify JWT token and attach user profile to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
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

    // Verify token using centralized JWT configuration
    let decoded: DecodedToken;

    try {
      decoded = verifyToken(token) as DecodedToken;
    } catch (jwtErr: any) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or expired token.',
        code: jwtErr.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
        details: jwtErr.message,
      });
    }

    const userId = decoded.userId || decoded.sub || decoded.id;
    const email = decoded.email;

    // Retrieve user profile from database
    const userRes = await query<{ user_id: number; email: string; role: UserRole; auth_id: string }>(
      `SELECT user_id, email, role, auth_id 
       FROM women_skill_portal.user_profiles 
       WHERE user_id = $1 OR email = $2 OR auth_id = $3
       LIMIT 1`,
      [isNaN(Number(userId)) ? -1 : parseInt(String(userId), 10), email || '', String(userId)]
    );

    if (userRes.rows.length === 0) {
      // If user profile isn't in DB yet, fallback to decoded JWT role or return 401
      if (decoded.role && ['woman', 'training_provider', 'admin'].includes(decoded.role)) {
        req.user = {
          userId: Number(decoded.userId || decoded.id || 0),
          email: decoded.email || '',
          role: decoded.role,
          womanId: decoded.womanId || null,
          entityId: decoded.entityId || null,
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'User profile not found for this account. Please register your profile.',
      });
    }

    const user = userRes.rows[0];

    // Find linked woman entity if candidate, auto-provision if missing
    let womanId: number | null = null;

    if (user.role === 'woman') {
      const wRes = await query<{ woman_id: number }>(
        `SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1 OR email = $2 LIMIT 1`,
        [user.user_id, user.email]
      );
      if (wRes.rows.length > 0) {
        womanId = wRes.rows[0].woman_id;
      } else {
        const insRes = await query<{ woman_id: number }>(
          `INSERT INTO women_skill_portal.women (user_id, full_name, email)
           VALUES ($1, $2, $3)
           RETURNING woman_id`,
          [user.user_id, user.email.split('@')[0], user.email]
        );
        womanId = insRes.rows[0].woman_id;
      }
    }

    req.user = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      womanId,
      entityId: user.role === 'woman' ? womanId : user.user_id,
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
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token) as DecodedToken;
    const userId = decoded.userId || decoded.sub || decoded.id;

    const userRes = await query<{ user_id: number; email: string; role: UserRole }>(
      `SELECT user_id, email, role FROM women_skill_portal.user_profiles WHERE user_id = $1 OR email = $2 LIMIT 1`,
      [isNaN(Number(userId)) ? -1 : parseInt(String(userId), 10), decoded.email || '']
    );

    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      let womanId: number | null = null;
      if (user.role === 'woman') {
        const wRes = await query<{ woman_id: number }>(
          `SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1 LIMIT 1`,
          [user.user_id]
        );
        if (wRes.rows.length > 0) womanId = wRes.rows[0].woman_id;
      }

      req.user = {
        userId: user.user_id,
        email: user.email,
        role: user.role,
        womanId,
        entityId: user.role === 'woman' ? womanId : user.user_id,
      };
    }
  } catch {
    // Non-blocking for optional authentication
  }

  next();
};
