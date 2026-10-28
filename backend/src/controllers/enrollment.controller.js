const trainingService = require('../services/training.service');
const { query } = require('../config/database');

const listEnrollments = async (req, res, next) => {
  try {
    let providerId = req.user.role === 'training_provider' ? req.user.providerId : req.query.providerId;

    if (!providerId && req.user.role === 'training_provider') {
      const p = await query(`SELECT provider_id FROM women_skill_portal.training_providers WHERE user_id = $1`, [req.user.userId]);
      if (p.rows.length > 0) providerId = p.rows[0].provider_id;
    }

    const { programId, status, limit, offset } = req.query;
    const enrollments = await trainingService.getEnrollments({ providerId, programId, status, limit, offset });
    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) {
    next(err);
  }
};

const getEnrollmentById = async (req, res, next) => {
  try {
    const enrollmentId = parseInt(req.params.id, 10);
    const sql = `
      SELECT e.*, w.full_name, w.email AS woman_email, w.phone AS woman_phone,
             tp.program_name, tp.duration_weeks, prov.provider_name
      FROM women_skill_portal.enrollments e
      JOIN women_skill_portal.women w ON e.woman_id = w.woman_id
      JOIN women_skill_portal.training_programs tp ON e.program_id = tp.program_id
      JOIN women_skill_portal.training_providers prov ON tp.provider_id = prov.provider_id
      WHERE e.enrollment_id = $1;
    `;
    const result = await query(sql, [enrollmentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found.' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const enrollmentId = parseInt(req.params.id, 10);
    const { completionStatus, score, completionDate } = req.body;
    const updated = await trainingService.updateEnrollment(enrollmentId, { completionStatus, score, completionDate });
    res.status(200).json({ success: true, message: 'Enrollment status updated.', data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listEnrollments,
  getEnrollmentById,
  updateEnrollmentStatus,
};
