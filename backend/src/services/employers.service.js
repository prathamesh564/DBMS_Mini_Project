const { query } = require('../config/database');

/**
 * Get employer profile with active job count and details
 */
const getEmployerById = async (employerId) => {
  const empRes = await query(
    `SELECT e.*, COUNT(jp.job_id) AS total_jobs_posted
     FROM women_skill_portal.employers e
     LEFT JOIN women_skill_portal.job_postings jp ON e.employer_id = jp.employer_id
     WHERE e.employer_id = $1
     GROUP BY e.employer_id`,
    [employerId]
  );

  if (empRes.rows.length === 0) {
    throw new Error(`Employer profile with ID ${employerId} not found.`);
  }

  // Fetch recent job postings
  const jobsRes = await query(
    `SELECT job_id, job_title, job_location, employment_type, salary, status, posted_date
     FROM women_skill_portal.job_postings
     WHERE employer_id = $1
     ORDER BY posted_date DESC`,
    [employerId]
  );

  return {
    ...empRes.rows[0],
    jobs: jobsRes.rows,
  };
};

/**
 * Get employer by user ID
 */
const getEmployerByUserId = async (userId) => {
  const res = await query(
    `SELECT employer_id FROM women_skill_portal.employers WHERE user_id = $1`,
    [userId]
  );
  if (res.rows.length === 0) {
    throw new Error('Employer profile not found for this account.');
  }
  return getEmployerById(res.rows[0].employer_id);
};

/**
 * Create a new employer profile
 */
const createEmployer = async ({ userId, companyName, industry, email, phone, address, website }) => {
  const res = await query(
    `INSERT INTO women_skill_portal.employers (user_id, company_name, industry, email, phone, address, website)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId || null, companyName.trim(), industry.trim(), email.trim(), phone || null, address || null, website || null]
  );

  return res.rows[0];
};

/**
 * Update employer profile
 */
const updateEmployer = async (employerId, { companyName, industry, phone, address, website }) => {
  const fields = [];
  const params = [];
  let idx = 1;

  if (companyName) {
    fields.push(`company_name = $${idx++}`);
    params.push(companyName.trim());
  }
  if (industry) {
    fields.push(`industry = $${idx++}`);
    params.push(industry.trim());
  }
  if (phone !== undefined) {
    fields.push(`phone = $${idx++}`);
    params.push(phone);
  }
  if (address !== undefined) {
    fields.push(`address = $${idx++}`);
    params.push(address);
  }
  if (website !== undefined) {
    fields.push(`website = $${idx++}`);
    params.push(website);
  }

  if (fields.length === 0) {
    return getEmployerById(employerId);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(employerId);

  const sql = `
    UPDATE women_skill_portal.employers
    SET ${fields.join(', ')}
    WHERE employer_id = $${idx}
    RETURNING *;
  `;

  await query(sql, params);
  return getEmployerById(employerId);
};

/**
 * List all employers
 */
const getAllEmployers = async ({ industry, search, limit = 20, offset = 0 }) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (industry) {
    conditions.push(`industry ILIKE $${idx++}`);
    params.push(`%${industry}%`);
  }

  if (search) {
    conditions.push(`(company_name ILIKE $${idx} OR email ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(parseInt(limit, 10));
  const limitIdx = idx++;
  params.push(parseInt(offset, 10));
  const offsetIdx = idx++;

  const sql = `
    SELECT e.*, COUNT(jp.job_id) AS total_jobs
    FROM women_skill_portal.employers e
    LEFT JOIN women_skill_portal.job_postings jp ON e.employer_id = jp.employer_id
    ${whereClause}
    GROUP BY e.employer_id
    ORDER BY e.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx};
  `;

  const countSql = `SELECT COUNT(*) AS total FROM women_skill_portal.employers ${whereClause};`;

  const [listRes, countRes] = await Promise.all([
    query(sql, params),
    query(countSql, params.slice(0, limitIdx - 1)),
  ]);

  return {
    total: parseInt(countRes.rows[0].total, 10),
    employers: listRes.rows,
  };
};

module.exports = {
  getEmployerById,
  getEmployerByUserId,
  createEmployer,
  updateEmployer,
  getAllEmployers,
};
