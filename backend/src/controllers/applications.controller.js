const { query } = require('../config/database');

/**
 * Get personal job applications for logged-in woman
 */
const getMyApplications = async (req, res, next) => {
  try {
    let womanId = req.user.womanId;
    if (!womanId) {
      const w = await query(`SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1`, [req.user.userId]);
      if (w.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Woman profile not found for this account.' });
      }
      womanId = w.rows[0].woman_id;
    }

    const sql = `
      SELECT ja.application_id, ja.job_id, ja.application_date, ja.application_status, ja.cover_note,
             jp.job_title, jp.salary, jp.job_location, jp.employment_type,
             emp.company_name, emp.industry, emp.email AS employer_email,
             i.interview_id, i.interview_date, i.interview_mode, i.interview_status, i.location_or_link
      FROM women_skill_portal.job_applications ja
      JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
      JOIN women_skill_portal.employers emp ON jp.employer_id = emp.employer_id
      LEFT JOIN women_skill_portal.interviews i ON ja.application_id = i.application_id
      WHERE ja.woman_id = $1
      ORDER BY ja.application_date DESC;
    `;

    const result = await query(sql, [womanId]);
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single application by ID
 */
const getApplicationById = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    const sql = `
      SELECT ja.*,
             w.full_name, w.email AS woman_email, w.phone AS woman_phone, w.education_level, w.address AS woman_address,
             jp.job_title, jp.job_description, jp.salary, jp.job_location, jp.employment_type, jp.employer_id,
             emp.company_name, emp.email AS employer_email,
             i.interview_id, i.interview_date, i.interview_mode, i.interview_status, i.notes AS interview_notes
      FROM women_skill_portal.job_applications ja
      JOIN women_skill_portal.women w ON ja.woman_id = w.woman_id
      JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
      JOIN women_skill_portal.employers emp ON jp.employer_id = emp.employer_id
      LEFT JOIN women_skill_portal.interviews i ON ja.application_id = i.application_id
      WHERE ja.application_id = $1;
    `;

    const result = await query(sql, [applicationId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    const app = result.rows[0];

    // Authorization check
    if (req.user.role === 'woman' && app.woman_id !== req.user.womanId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only view your own applications.' });
    }
    if (req.user.role === 'employer' && app.employer_id !== req.user.employerId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only view applications for your jobs.' });
    }

    res.status(200).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
};

/**
 * Update application status (employer, admin)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const currentRes = await query(
      `SELECT ja.*, jp.employer_id 
       FROM women_skill_portal.job_applications ja
       JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
       WHERE ja.application_id = $1`,
      [applicationId]
    );

    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    const app = currentRes.rows[0];
    if (req.user.role !== 'admin' && app.employer_id !== req.user.employerId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only update applications for your jobs.' });
    }

    const updated = await query(
      `UPDATE women_skill_portal.job_applications
       SET application_status = $1
       WHERE application_id = $2
       RETURNING *`,
      [status, applicationId]
    );

    res.status(200).json({ success: true, message: 'Application status updated.', data: updated.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
};
