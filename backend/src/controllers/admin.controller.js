const { query } = require('../config/database');

/**
 * Retrieve authorized dashboard statistics
 * Implements FR-09: Statistics calculated from database queries without stored duplicate values
 */
const getStatistics = async (req, res, next) => {
  try {
    const statsSql = `
      SELECT
        (SELECT COUNT(*) FROM women_skill_portal.women) AS total_women,
        (SELECT COUNT(*) FROM women_skill_portal.skills) AS total_skills,
        (SELECT COUNT(*) FROM women_skill_portal.training_programs) AS total_training_programs,
        (SELECT COUNT(*) FROM women_skill_portal.enrollments) AS total_enrollments,
        (SELECT COUNT(*) FROM women_skill_portal.employers) AS total_employers,
        (SELECT COUNT(*) FROM women_skill_portal.job_postings WHERE status = 'Open') AS total_open_jobs,
        (SELECT COUNT(*) FROM women_skill_portal.job_postings) AS total_jobs_all,
        (SELECT COUNT(*) FROM women_skill_portal.job_applications) AS total_applications,
        (SELECT COUNT(*) FROM women_skill_portal.interviews) AS total_interviews,
        (SELECT COUNT(*) FROM women_skill_portal.certifications) AS total_certifications,
        (SELECT COUNT(*) FROM women_skill_portal.employment_records) AS total_placements;
    `;

    const result = await query(statsSql);
    const row = result.rows[0];

    const statistics = {
      totalWomen: parseInt(row.total_women, 10),
      totalSkills: parseInt(row.total_skills, 10),
      totalTrainingPrograms: parseInt(row.total_training_programs, 10),
      totalEnrollments: parseInt(row.total_enrollments, 10),
      totalEmployers: parseInt(row.total_employers, 10),
      totalOpenJobs: parseInt(row.total_open_jobs, 10),
      totalJobsAll: parseInt(row.total_jobs_all, 10),
      totalApplications: parseInt(row.total_applications, 10),
      totalInterviews: parseInt(row.total_interviews, 10),
      totalCertifications: parseInt(row.total_certifications, 10),
      totalPlacements: parseInt(row.total_placements, 10),
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics calculated successfully.',
      data: statistics,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List all users with roles
 */
const listUsers = async (req, res, next) => {
  try {
    const { role, limit = 50, offset = 0 } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (role) {
      conditions.push(`role = $${idx++}`);
      params.push(role);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parseInt(limit, 10));
    const limitIdx = idx++;
    params.push(parseInt(offset, 10));
    const offsetIdx = idx++;

    const sql = `
      SELECT user_id, email, role, created_at, updated_at
      FROM women_skill_portal.user_profiles
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const result = await query(sql, params);
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user role (admin only)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    const result = await query(
      `UPDATE women_skill_portal.user_profiles
       SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING user_id, email, role, updated_at`,
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: 'User role updated successfully.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStatistics,
  listUsers,
  updateUserRole,
};
