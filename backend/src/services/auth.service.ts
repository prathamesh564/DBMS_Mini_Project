import bcrypt from 'bcryptjs';
import { query, getClient } from '../config/database';
import { signToken } from '../config/jwt';
import { AuthUser, UserRole } from '../types';

export interface RegisterUserParams {
  email: string;
  password: string;
  role: UserRole;
  fullName?: string;
  providerName?: string;
  phone?: string;
  address?: string;
  educationLevel?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    userId: number;
    email: string;
    role: UserRole;
    entityId: number | null;
  };
}

/**
 * Register a new user and create their role-specific entity
 * Strictly supports only 'woman' and 'training_provider' for public registration.
 */
export const registerUser = async ({
  email,
  password,
  role,
  fullName,
  providerName,
  phone,
  address,
  educationLevel,
}: RegisterUserParams): Promise<AuthResponse> => {
  // Public registration cannot create administrator accounts
  if (role === 'admin') {
    throw new Error('Registration for administrator accounts is not permitted through public registration.');
  }

  if (role !== 'woman' && role !== 'training_provider') {
    throw new Error(`Invalid role '${role}'. Only 'woman' and 'training_provider' can register.`);
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Check if email already exists in user_profiles
    const existing = await client.query<{ user_id: number }>(
      `SELECT user_id FROM women_skill_portal.user_profiles WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (existing.rows.length > 0) {
      throw new Error('An account with this email address already exists.');
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert user profile
    const userRes = await client.query<{ user_id: number; email: string; role: UserRole; created_at: Date }>(
      `INSERT INTO women_skill_portal.user_profiles (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING user_id, email, role, created_at`,
      [email.toLowerCase().trim(), passwordHash, role]
    );

    const newUser = userRes.rows[0];
    let entityId: number | null = null;

    // 4. Create role-specific entity
    if (role === 'woman') {
      const womanRes = await client.query<{ woman_id: number }>(
        `INSERT INTO women_skill_portal.women (user_id, full_name, email, phone, education_level, address)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING woman_id`,
        [newUser.user_id, fullName || 'Candidate', newUser.email, phone || null, educationLevel || null, address || null]
      );
      entityId = womanRes.rows[0].woman_id;
    } else if (role === 'training_provider') {
      // Training provider is managed directly via user_profiles
      entityId = newUser.user_id;
    }

    await client.query('COMMIT');

    // 5. Generate JWT token using centralized configuration
    const token = signToken({
      userId: newUser.user_id,
      email: newUser.email,
      role: newUser.role,
      entityId,
      womanId: role === 'woman' ? entityId : null,
    });

    return {
      token,
      user: {
        userId: newUser.user_id,
        email: newUser.email,
        role: newUser.role,
        entityId,
      },
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Authenticate user login
 */
export const loginUser = async ({ email, password }: { email: string; password: string }): Promise<AuthResponse> => {
  const normalizedEmail = email.toLowerCase().trim();

  const userRes = await query<{ user_id: number; email: string; password_hash: string; role: UserRole }>(
    `SELECT user_id, email, password_hash, role 
     FROM women_skill_portal.user_profiles 
     WHERE email = $1`,
    [normalizedEmail]
  );

  if (userRes.rows.length === 0) {
    throw new Error('Invalid email or password.');
  }

  const user = userRes.rows[0];

  // Verify password
  if (user.password_hash) {
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }
  }

  // Resolve entity ID
  let entityId: number | null = null;
  let womanId: number | null = null;

  if (user.role === 'woman') {
    const w = await query<{ woman_id: number }>(`SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1`, [user.user_id]);
    if (w.rows.length > 0) {
      entityId = w.rows[0].woman_id;
      womanId = w.rows[0].woman_id;
    } else {
      // Auto-provision candidate record if missing
      const insRes = await query<{ woman_id: number }>(
        `INSERT INTO women_skill_portal.women (user_id, full_name, email)
         VALUES ($1, $2, $3)
         RETURNING woman_id`,
        [user.user_id, user.email.split('@')[0], user.email]
      );
      entityId = insRes.rows[0].woman_id;
      womanId = insRes.rows[0].woman_id;
    }
  } else {
    entityId = user.user_id;
  }

  const token = signToken({
    userId: user.user_id,
    email: user.email,
    role: user.role,
    entityId,
    womanId,
  });

  return {
    token,
    user: {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      entityId,
    },
  };
};

/**
 * Get current authenticated user profile
 */
export const getCurrentUserProfile = async (user: AuthUser): Promise<any> => {
  let profileData: any = null;

  if (user.role === 'woman') {
    const res = await query(
      `SELECT * FROM women_skill_portal.women WHERE user_id = $1 OR woman_id = $2`,
      [user.userId, user.womanId || -1]
    );
    profileData = res.rows[0] || null;
  } else {
    const res = await query(
      `SELECT user_id, email, role, created_at, updated_at FROM women_skill_portal.user_profiles WHERE user_id = $1`,
      [user.userId]
    );
    profileData = res.rows[0] || null;
  }

  return {
    ...user,
    profile: profileData,
  };
};
