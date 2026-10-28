const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, getClient } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'women_skill_portal_super_secret_jwt_key_2025_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user and create their role-specific entity
 */
const registerUser = async ({ email, password, role, fullName, companyName, providerName, phone, address, educationLevel, industry }) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Check if email already exists in user_profiles
    const existing = await client.query(
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
    const userRes = await client.query(
      `INSERT INTO women_skill_portal.user_profiles (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING user_id, email, role, created_at`,
      [email.toLowerCase().trim(), passwordHash, role]
    );

    const newUser = userRes.rows[0];
    let entityId = null;

    // 4. Create role-specific entity
    if (role === 'woman') {
      const womanRes = await client.query(
        `INSERT INTO women_skill_portal.women (user_id, full_name, email, phone, education_level, address)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING woman_id`,
        [newUser.user_id, fullName || 'Unnamed User', newUser.email, phone || null, educationLevel || null, address || null]
      );
      entityId = womanRes.rows[0].woman_id;
    } else if (role === 'training_provider') {
      const provRes = await client.query(
        `INSERT INTO women_skill_portal.training_providers (user_id, provider_name, email, phone, address)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING provider_id`,
        [newUser.user_id, providerName || fullName || 'Training Institute', newUser.email, phone || null, address || null]
      );
      entityId = provRes.rows[0].provider_id;
    } else if (role === 'employer') {
      const empRes = await client.query(
        `INSERT INTO women_skill_portal.employers (user_id, company_name, industry, email, phone, address)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING employer_id`,
        [newUser.user_id, companyName || 'Company', industry || 'Technology', newUser.email, phone || null, address || null]
      );
      entityId = empRes.rows[0].employer_id;
    }

    await client.query('COMMIT');

    // 5. Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.user_id,
        email: newUser.email,
        role: newUser.role,
        entityId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

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
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const userRes = await query(
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
  let entityId = null;
  if (user.role === 'woman') {
    const w = await query(`SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1`, [user.user_id]);
    if (w.rows.length > 0) entityId = w.rows[0].woman_id;
  } else if (user.role === 'training_provider') {
    const p = await query(`SELECT provider_id FROM women_skill_portal.training_providers WHERE user_id = $1`, [user.user_id]);
    if (p.rows.length > 0) entityId = p.rows[0].provider_id;
  } else if (user.role === 'employer') {
    const e = await query(`SELECT employer_id FROM women_skill_portal.employers WHERE user_id = $1`, [user.user_id]);
    if (e.rows.length > 0) entityId = e.rows[0].employer_id;
  }

  const token = jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      entityId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

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
const getCurrentUserProfile = async (user) => {
  let profileData = null;

  if (user.role === 'woman') {
    const res = await query(
      `SELECT * FROM women_skill_portal.women WHERE user_id = $1 OR woman_id = $2`,
      [user.userId, user.womanId || -1]
    );
    profileData = res.rows[0] || null;
  } else if (user.role === 'training_provider') {
    const res = await query(
      `SELECT * FROM women_skill_portal.training_providers WHERE user_id = $1 OR provider_id = $2`,
      [user.userId, user.providerId || -1]
    );
    profileData = res.rows[0] || null;
  } else if (user.role === 'employer') {
    const res = await query(
      `SELECT * FROM women_skill_portal.employers WHERE user_id = $1 OR employer_id = $2`,
      [user.userId, user.employerId || -1]
    );
    profileData = res.rows[0] || null;
  }

  return {
    ...user,
    profile: profileData,
  };
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUserProfile,
};
