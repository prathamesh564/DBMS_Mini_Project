import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../types';

export interface TokenPayload extends JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  entityId?: number | null;
  womanId?: number | null;
}

/**
 * Safely retrieve the JWT secret from environment configuration
 * Never logs or exposes the secret string.
 */
export const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'women_skill_portal_super_secret_jwt_key_2025_secure';
};

export const JWT_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

/**
 * Sign a new JWT token using the centralized configuration
 */
export const signToken = (
  payload: { userId: number; email: string; role: UserRole; entityId?: number | null; womanId?: number | null },
  options?: SignOptions
): string => {
  const secret = getJwtSecret();
  const signOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
    ...options,
  };
  return jwt.sign(payload, secret, signOptions);
};

/**
 * Verify and decode an existing JWT token using the centralized configuration
 */
export const verifyToken = (token: string, options?: VerifyOptions): TokenPayload => {
  const secret = getJwtSecret();
  const verifyOptions: VerifyOptions = {
    algorithms: ['HS256'],
    ...options,
  };
  return jwt.verify(token, secret, verifyOptions) as TokenPayload;
};
