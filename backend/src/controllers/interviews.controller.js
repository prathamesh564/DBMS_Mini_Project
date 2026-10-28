const { query } = require('../config/database');

/**
 * Schedule an interview for an application
 */
const scheduleInterview = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    const { interviewDate, interviewMode, locationOrLink, notes } = req.body;

    // Check application exists
    const appRes = await query(
      `SELECT ja.*, jp.employer_id, jp.job_title
       FROM women_skill_portal.job_applications ja
       JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
       WHERE ja.application_id = $1`,
      [applicationId]
    );

    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const app = appRes.rows[0];
    if (req.user.role !== 'admin' && app.employer_id !== req.user.employerId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only schedule interviews for your own job postings.' });
    }

    // Insert interview
    const result = await query(
      `INSERT INTO women_skill_portal.interviews 
        (application_id, interview_date, interview_mode, interview_status, location_or_link, notes)
       VALUES ($1, $2, $3, 'Scheduled', $4, $5)
       RETURNING *`,
      [applicationId, interviewDate, interviewMode, locationOrLink || null, notes || null]
    );

    // Also update application status to 'Interviewing'
    await query(
      `UPDATE women_skill_portal.job_applications
       SET application_status = 'Interviewing'
       WHERE application_id = $1`,
      [applicationId]
    );

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get authorized interviews for current user
 */
const getMyInterviews = async (req, res, next) => {
  try {
    let sql = '';
    let params = [];

    if (req.user.role === 'woman') {
      let womanId = req.user.womanId;
      if (!womanId) {
        const w = await query(`SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1`, [req.user.userId]);
        if (w.rows.length > 0) womanId = w.rows[0].woman_id;
      }

      sql = `
        SELECT i.*, ja.job_id, ja.application_status,
               jp.job_title, jp.job_location, emp.company_name, emp.email AS employer_email
        FROM women_skill_portal.interviews i
        JOIN women_skill_portal.job_applications ja ON i.application_id = ja.application_id
        JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
        JOIN women_skill_portal.employers emp ON jp.employer_id = emp.employer_id
        WHERE ja.woman_id = $1
        ORDER BY i.interview_date ASC;
      `;
      params = [womanId];
    } else if (req.user.role === 'employer') {
      let employerId = req.user.employerId;
      if (!employerId) {
        const e = await query(`SELECT employer_id FROM women_skill_portal.employers WHERE user_id = $1`, [req.user.userId]);
        if (e.rows.length > 0) employerId = e.rows[0].employer_id;
      }

      sql = `
        SELECT i.*, ja.job_id, ja.application_status,
               w.woman_id, w.full_name AS candidate_name, w.email AS candidate_email, w.phone AS candidate_phone,
               jp.job_title
        FROM women_skill_portal.interviews i
        JOIN women_skill_portal.job_applications ja ON i.application_id = ja.application_id
        JOIN women_skill_portal.women w ON ja.woman_id = w.woman_id
        JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
        WHERE jp.employer_id = $1
        ORDER BY i.interview_date ASC;
      `;
      params = [employerId];
    } else {
      // Admin
      sql = `
        SELECT i.*, ja.job_id, ja.application_status,
               w.full_name AS candidate_name, emp.company_name, jp.job_title
        FROM women_skill_portal.interviews i
        JOIN women_skill_portal.job_applications ja ON i.application_id = ja.application_id
        JOIN women_skill_portal.women w ON ja.woman_id = w.woman_id
        JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
        JOIN women_skill_portal.employers emp ON jp.employer_id = emp.employer_id
        ORDER BY i.interview_date DESC;
      `;
    }

    const result = await query(sql, params);
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Get interview by ID
 */
const getInterviewById = async (req, res, next) => {
  try {
    const interviewId = parseInt(req.params.id, 10);
    const sql = `
      SELECT i.*, ja.job_id, ja.woman_id, ja.application_status,
             w.full_name, w.email AS candidate_email, w.phone AS candidate_phone,
             jp.job_title, jp.employer_id, emp.company_name, emp.email AS employer_email
      FROM women_skill_portal.interviews i
      JOIN women_skill_portal.job_applications ja ON i.application_id = ja.application_id
      JOIN women_skill_portal.women w ON ja.woman_id = w.woman_id
      JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
      JOIN women_skill_portal.employers emp ON jp.employer_id = emp.employer_id
      WHERE i.interview_id = $1;
    `;

    const result = await query(sql, [interviewId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Interview record not found.' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Update interview details, status, or feedback
 */
const updateInterview = async (req, res, next) => {
  try {
    const interviewId = parseInt(req.params.id, 10);
    const { interviewDate, interviewMode, interviewStatus, locationOrLink, notes, feedback } = req.body;

    const fields = [];
    const params = [];
    let idx = 1;

    if (interviewDate) {
      fields.push(`interview_date = $${idx++}`);
      params.push(interviewDate);
    }
    if (interviewMode) {
      fields.push(`interview_mode = $${idx++}`);
      params.push(interviewMode);
    }
    if (interviewStatus) {
      fields.push(`interview_status = $${idx++}`);
      params.push(interviewStatus);
    }
    if (locationOrLink !== undefined) {
      fields.push(`location_or_link = $${idx++}`);
      params.push(locationOrLink);
    }
    if (notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      params.push(notes);
    }
    if (feedback !== undefined) {
      fields.push(`feedback = $${idx++}`);
      params.push(feedback);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    params.push(interviewId);
    const sql = `
      UPDATE women_skill_portal.interviews
      SET ${fields.join(', ')}
      WHERE interview_id = $${idx}
      RETURNING *;
    `;

    const result = await query(sql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Interview record not found.' });
    }

    res.status(200).json({ success: true, message: 'Interview updated successfully.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  scheduleInterview,
  getMyInterviews,
  getInterviewById,
  updateInterview,
};
