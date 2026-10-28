const { query } = require('../config/database');

/**
 * Get woman profile with associated skills, enrollments, certifications, and application count
 * @param {number} womanId
 */
const getWomanProfileById = async (womanId) => {
  // 1. Base profile
  const womanRes = await query(
    `SELECT woman_id, user_id, full_name, email, phone, education_level, address, bio, created_at, updated_at
     FROM women_skill_portal.women
     WHERE woman_id = $1`,
    [womanId]
  );

  if (womanRes.rows.length === 0) {
    throw new Error(`Woman profile not found with ID ${womanId}.`);
  }

  const woman = womanRes.rows[0];

  // 2. Fetch skills
  const skillsRes = await query(
    `SELECT s.skill_id, s.skill_name, s.category, s.description, ws.proficiency_level, ws.years_experience, ws.added_at
     FROM women_skill_portal.women_skills ws
     JOIN women_skill_portal.skills s ON ws.skill_id = s.skill_id
     WHERE ws.woman_id = $1
     ORDER BY s.skill_name ASC`,
    [womanId]
  );

  // 3. Fetch training enrollments
  const enrollmentsRes = await query(
    `SELECT e.enrollment_id, e.program_id, e.enrollment_date, e.completion_status, e.completion_date, e.score,
            tp.program_name, tp.duration_weeks, prov.provider_name
     FROM women_skill_portal.enrollments e
     JOIN women_skill_portal.training_programs tp ON e.program_id = tp.program_id
     JOIN women_skill_portal.training_providers prov ON tp.provider_id = prov.provider_id
     WHERE e.woman_id = $1
     ORDER BY e.enrollment_date DESC`,
    [womanId]
  );

  // 4. Fetch certifications
  const certsRes = await query(
    `SELECT c.certification_id, c.certificate_name, c.certificate_number, c.issue_date,
            tp.program_name
     FROM women_skill_portal.certifications c
     JOIN women_skill_portal.training_programs tp ON c.program_id = tp.program_id
     WHERE c.woman_id = $1
     ORDER BY c.issue_date DESC`,
    [womanId]
  );

  // 5. Fetch job applications count & recent applications
  const appsRes = await query(
    `SELECT ja.application_id, ja.application_date, ja.application_status,
            jp.job_id, jp.job_title, emp.company_name
     FROM women_skill_portal.job_applications ja
     JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
     JOIN women_skill_portal.employers emp ON jp.employer_id = emp.employer_id
     WHERE ja.woman_id = $1
     ORDER BY ja.application_date DESC
     LIMIT 5`,
    [womanId]
  );

  return {
    ...woman,
    skills: skillsRes.rows,
    enrollments: enrollmentsRes.rows,
    certifications: certsRes.rows,
    recentApplications: appsRes.rows,
  };
};

/**
 * Get profile by user_id
 * @param {number} userId
 */
const getWomanByUserId = async (userId) => {
  const res = await query(
    `SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1`,
    [userId]
  );
  if (res.rows.length === 0) {
    throw new Error('Woman profile does not exist for this account.');
  }
  return getWomanProfileById(res.rows[0].woman_id);
};

/**
 * Update woman profile
 */
const updateWomanProfile = async (womanId, { fullName, phone, educationLevel, address, bio }) => {
  const fields = [];
  const params = [];
  let idx = 1;

  if (fullName !== undefined) {
    fields.push(`full_name = $${idx++}`);
    params.push(fullName);
  }
  if (phone !== undefined) {
    fields.push(`phone = $${idx++}`);
    params.push(phone);
  }
  if (educationLevel !== undefined) {
    fields.push(`education_level = $${idx++}`);
    params.push(educationLevel);
  }
  if (address !== undefined) {
    fields.push(`address = $${idx++}`);
    params.push(address);
  }
  if (bio !== undefined) {
    fields.push(`bio = $${idx++}`);
    params.push(bio);
  }

  if (fields.length === 0) {
    return getWomanProfileById(womanId);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(womanId);

  const sql = `
    UPDATE women_skill_portal.women
    SET ${fields.join(', ')}
    WHERE woman_id = $${idx}
    RETURNING *;
  `;

  const res = await query(sql, params);
  if (res.rows.length === 0) {
    throw new Error(`Failed to update. Woman profile with ID ${womanId} not found.`);
  }

  return getWomanProfileById(womanId);
};

/**
 * List all registered women (for employers or admin)
 */
const getAllWomen = async ({ limit = 20, offset = 0, educationLevel, search }) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (educationLevel) {
    conditions.push(`w.education_level ILIKE $${idx++}`);
    params.push(`%${educationLevel}%`);
  }

  if (search) {
    conditions.push(`(w.full_name ILIKE $${idx} OR w.email ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(parseInt(limit, 10));
  const limitIdx = idx++;
  params.push(parseInt(offset, 10));
  const offsetIdx = idx++;

  const listSql = `
    SELECT w.woman_id, w.full_name, w.email, w.phone, w.education_level, w.address, w.created_at,
           COUNT(DISTINCT ws.skill_id) AS total_skills,
           COUNT(DISTINCT c.certification_id) AS total_certifications
    FROM women_skill_portal.women w
    LEFT JOIN women_skill_portal.women_skills ws ON w.woman_id = ws.woman_id
    LEFT JOIN women_skill_portal.certifications c ON w.woman_id = c.woman_id
    ${whereClause}
    GROUP BY w.woman_id
    ORDER BY w.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx};
  `;

  const countSql = `
    SELECT COUNT(*) AS total FROM women_skill_portal.women w ${whereClause};
  `;

  const [listRes, countRes] = await Promise.all([
    query(listSql, params),
    query(countSql, params.slice(0, limitIdx - 1)),
  ]);

  return {
    total: parseInt(countRes.rows[0].total, 10),
    women: listRes.rows,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };
};

/**
 * Add skill to woman's profile
 */
const addSkillToWoman = async (womanId, { skillId, proficiencyLevel = 'Beginner', yearsExperience = 0 }) => {
  // Check if skill exists
  const skillRes = await query(`SELECT skill_id FROM women_skill_portal.skills WHERE skill_id = $1`, [skillId]);
  if (skillRes.rows.length === 0) {
    throw new Error(`Skill with ID ${skillId} does not exist.`);
  }

  const res = await query(
    `INSERT INTO women_skill_portal.women_skills (woman_id, skill_id, proficiency_level, years_experience)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (woman_id, skill_id) DO UPDATE
     SET proficiency_level = EXCLUDED.proficiency_level,
         years_experience = EXCLUDED.years_experience
     RETURNING *`,
    [womanId, skillId, proficiencyLevel, yearsExperience]
  );

  return res.rows[0];
};

/**
 * Remove skill from woman's profile
 */
const removeSkillFromWoman = async (womanId, skillId) => {
  const res = await query(
    `DELETE FROM women_skill_portal.women_skills
     WHERE woman_id = $1 AND skill_id = $2
     RETURNING *`,
    [womanId, skillId]
  );

  if (res.rows.length === 0) {
    throw new Error(`Skill with ID ${skillId} is not associated with woman ID ${womanId}.`);
  }

  return { success: true, message: 'Skill removed successfully.' };
};

module.exports = {
  getWomanProfileById,
  getWomanByUserId,
  updateWomanProfile,
  getAllWomen,
  addSkillToWoman,
  removeSkillFromWoman,
};
