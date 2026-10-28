const { query } = require('../config/database');

/**
 * List training programs with filters and provider info
 */
const getAllPrograms = async ({ category, search, providerId, status, limit = 20, offset = 0 }) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (category) {
    conditions.push(`tp.category ILIKE $${idx++}`);
    params.push(`%${category}%`);
  }

  if (status) {
    conditions.push(`tp.status = $${idx++}`);
    params.push(status);
  }

  if (providerId) {
    conditions.push(`tp.provider_id = $${idx++}`);
    params.push(parseInt(providerId, 10));
  }

  if (search) {
    conditions.push(`(tp.program_name ILIKE $${idx} OR tp.description ILIKE $${idx} OR prov.provider_name ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(parseInt(limit, 10));
  const limitIdx = idx++;
  params.push(parseInt(offset, 10));
  const offsetIdx = idx++;

  const listSql = `
    SELECT tp.program_id, tp.provider_id, tp.program_name, tp.category, tp.duration_weeks,
           tp.course_fee, tp.description, tp.mode, tp.status, tp.created_at,
           prov.provider_name, prov.email AS provider_email, prov.phone AS provider_phone,
           COUNT(e.enrollment_id) AS enrolled_count
    FROM women_skill_portal.training_programs tp
    JOIN women_skill_portal.training_providers prov ON tp.provider_id = prov.provider_id
    LEFT JOIN women_skill_portal.enrollments e ON tp.program_id = e.program_id
    ${whereClause}
    GROUP BY tp.program_id, prov.provider_name, prov.email, prov.phone
    ORDER BY tp.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx};
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM women_skill_portal.training_programs tp
    JOIN women_skill_portal.training_providers prov ON tp.provider_id = prov.provider_id
    ${whereClause};
  `;

  const [listRes, countRes] = await Promise.all([
    query(listSql, params),
    query(countSql, params.slice(0, limitIdx - 1)),
  ]);

  return {
    total: parseInt(countRes.rows[0].total, 10),
    programs: listRes.rows,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };
};

/**
 * Get single program details by ID
 */
const getProgramById = async (programId) => {
  const sql = `
    SELECT tp.*, prov.provider_name, prov.email AS provider_email, prov.phone AS provider_phone,
           prov.address AS provider_address, prov.website AS provider_website,
           COUNT(e.enrollment_id) AS total_enrolled
    FROM women_skill_portal.training_programs tp
    JOIN women_skill_portal.training_providers prov ON tp.provider_id = prov.provider_id
    LEFT JOIN women_skill_portal.enrollments e ON tp.program_id = e.program_id
    WHERE tp.program_id = $1
    GROUP BY tp.program_id, prov.provider_name, prov.email, prov.phone, prov.address, prov.website;
  `;

  const res = await query(sql, [programId]);
  if (res.rows.length === 0) {
    throw new Error(`Training program with ID ${programId} not found.`);
  }

  return res.rows[0];
};

/**
 * Create a new training program
 */
const createProgram = async (providerId, { programName, category, durationWeeks, courseFee, description, mode, status }) => {
  // Verify provider exists
  const provCheck = await query(
    `SELECT provider_id FROM women_skill_portal.training_providers WHERE provider_id = $1`,
    [providerId]
  );
  if (provCheck.rows.length === 0) {
    throw new Error(`Training provider with ID ${providerId} does not exist.`);
  }

  const res = await query(
    `INSERT INTO women_skill_portal.training_programs 
      (provider_id, program_name, category, duration_weeks, course_fee, description, mode, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      providerId,
      programName.trim(),
      category || 'General',
      parseInt(durationWeeks, 10),
      courseFee !== undefined ? parseFloat(courseFee) : 0.0,
      description || null,
      mode || 'Online',
      status || 'Active',
    ]
  );

  return getProgramById(res.rows[0].program_id);
};

/**
 * Update an existing program
 */
const updateProgram = async (programId, providerId, role, updates) => {
  const current = await getProgramById(programId);

  // If not admin, check if user is the provider owner
  if (role !== 'admin' && current.provider_id !== providerId) {
    throw new Error('Forbidden: You can only update training programs offered by your institution.');
  }

  const fields = [];
  const params = [];
  let idx = 1;

  if (updates.programName) {
    fields.push(`program_name = $${idx++}`);
    params.push(updates.programName.trim());
  }
  if (updates.category) {
    fields.push(`category = $${idx++}`);
    params.push(updates.category.trim());
  }
  if (updates.durationWeeks !== undefined) {
    fields.push(`duration_weeks = $${idx++}`);
    params.push(parseInt(updates.durationWeeks, 10));
  }
  if (updates.courseFee !== undefined) {
    fields.push(`course_fee = $${idx++}`);
    params.push(parseFloat(updates.courseFee));
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${idx++}`);
    params.push(updates.description);
  }
  if (updates.mode) {
    fields.push(`mode = $${idx++}`);
    params.push(updates.mode);
  }
  if (updates.status) {
    fields.push(`status = $${idx++}`);
    params.push(updates.status);
  }

  if (fields.length === 0) {
    return current;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(programId);

  const sql = `
    UPDATE women_skill_portal.training_programs
    SET ${fields.join(', ')}
    WHERE program_id = $${idx}
    RETURNING *;
  `;

  await query(sql, params);
  return getProgramById(programId);
};

/**
 * Enroll a woman in a training program
 */
const enrollInProgram = async (womanId, programId) => {
  // 1. Verify program exists and is active
  const progRes = await query(
    `SELECT program_id, program_name, status FROM women_skill_portal.training_programs WHERE program_id = $1`,
    [programId]
  );
  if (progRes.rows.length === 0) {
    throw new Error(`Training program with ID ${programId} not found.`);
  }

  if (progRes.rows[0].status !== 'Active' && progRes.rows[0].status !== 'Upcoming') {
    throw new Error(`Cannot enroll: Program status is currently '${progRes.rows[0].status}'.`);
  }

  // 2. Check for duplicate enrollment (per Unique Constraint)
  const existing = await query(
    `SELECT enrollment_id, completion_status FROM women_skill_portal.enrollments 
     WHERE woman_id = $1 AND program_id = $2`,
    [womanId, programId]
  );

  if (existing.rows.length > 0) {
    throw new Error(`You are already enrolled in this training program (Status: ${existing.rows[0].completion_status}).`);
  }

  // 3. Insert enrollment
  const res = await query(
    `INSERT INTO women_skill_portal.enrollments (woman_id, program_id, enrollment_date, completion_status)
     VALUES ($1, $2, CURRENT_DATE, 'Enrolled')
     RETURNING *`,
    [womanId, programId]
  );

  return res.rows[0];
};

/**
 * Get personal enrollments for a woman
 */
const getPersonalEnrollments = async (womanId) => {
  const sql = `
    SELECT e.enrollment_id, e.program_id, e.enrollment_date, e.completion_status, e.completion_date, e.score,
           tp.program_name, tp.category, tp.duration_weeks, tp.mode, tp.course_fee,
           prov.provider_name, prov.email AS provider_email,
           c.certification_id, c.certificate_number, c.issue_date AS cert_issue_date
    FROM women_skill_portal.enrollments e
    JOIN women_skill_portal.training_programs tp ON e.program_id = tp.program_id
    JOIN women_skill_portal.training_providers prov ON tp.provider_id = prov.provider_id
    LEFT JOIN women_skill_portal.certifications c ON c.woman_id = e.woman_id AND c.program_id = e.program_id
    WHERE e.woman_id = $1
    ORDER BY e.enrollment_date DESC;
  `;

  const res = await query(sql, [womanId]);
  return res.rows;
};

/**
 * List enrollments for a provider or admin
 */
const getEnrollments = async ({ providerId, programId, status, limit = 50, offset = 0 }) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (providerId) {
    conditions.push(`tp.provider_id = $${idx++}`);
    params.push(parseInt(providerId, 10));
  }

  if (programId) {
    conditions.push(`e.program_id = $${idx++}`);
    params.push(parseInt(programId, 10));
  }

  if (status) {
    conditions.push(`e.completion_status = $${idx++}`);
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(parseInt(limit, 10));
  const limitIdx = idx++;
  params.push(parseInt(offset, 10));
  const offsetIdx = idx++;

  const sql = `
    SELECT e.enrollment_id, e.enrollment_date, e.completion_status, e.completion_date, e.score,
           w.woman_id, w.full_name, w.email AS woman_email, w.phone AS woman_phone,
           tp.program_id, tp.program_name, tp.duration_weeks,
           prov.provider_id, prov.provider_name
    FROM women_skill_portal.enrollments e
    JOIN women_skill_portal.women w ON e.woman_id = w.woman_id
    JOIN women_skill_portal.training_programs tp ON e.program_id = tp.program_id
    JOIN women_skill_portal.training_providers prov ON tp.provider_id = prov.provider_id
    ${whereClause}
    ORDER BY e.enrollment_date DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx};
  `;

  const res = await query(sql, params);
  return res.rows;
};

/**
 * Update enrollment progress, completion status, and score
 */
const updateEnrollment = async (enrollmentId, { completionStatus, score, completionDate }) => {
  const currentRes = await query(
    `SELECT * FROM women_skill_portal.enrollments WHERE enrollment_id = $1`,
    [enrollmentId]
  );

  if (currentRes.rows.length === 0) {
    throw new Error(`Enrollment record with ID ${enrollmentId} not found.`);
  }

  const fields = [];
  const params = [];
  let idx = 1;

  if (completionStatus) {
    fields.push(`completion_status = $${idx++}`);
    params.push(completionStatus);

    if (completionStatus === 'Completed' && !completionDate) {
      fields.push(`completion_date = CURRENT_DATE`);
    }
  }

  if (score !== undefined) {
    fields.push(`score = $${idx++}`);
    params.push(parseFloat(score));
  }

  if (completionDate) {
    fields.push(`completion_date = $${idx++}`);
    params.push(completionDate);
  }

  if (fields.length === 0) {
    return currentRes.rows[0];
  }

  params.push(enrollmentId);
  const sql = `
    UPDATE women_skill_portal.enrollments
    SET ${fields.join(', ')}
    WHERE enrollment_id = $${idx}
    RETURNING *;
  `;

  const res = await query(sql, params);
  return res.rows[0];
};

module.exports = {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  enrollInProgram,
  getPersonalEnrollments,
  getEnrollments,
  updateEnrollment,
};
