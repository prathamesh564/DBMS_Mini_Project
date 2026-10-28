const { query } = require('../config/database');

/**
 * View personal certificates for logged-in woman
 */
const getMyCertificates = async (req, res, next) => {
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
      SELECT c.*, tp.program_name, tp.category, tp.duration_weeks,
             prov.provider_name, prov.email AS provider_email
      FROM women_skill_portal.certifications c
      JOIN women_skill_portal.training_programs tp ON c.program_id = tp.program_id
      JOIN women_skill_portal.training_providers prov ON tp.provider_id = prov.provider_id
      WHERE c.woman_id = $1
      ORDER BY c.issue_date DESC;
    `;

    const result = await query(sql, [womanId]);
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Record an authorized certificate
 * Enforces FR-04: Business rule preventing certificates from being issued for incomplete training
 */
const recordCertificate = async (req, res, next) => {
  try {
    const { womanId, programId, certificateName, certificateNumber, issueDate } = req.body;

    // 1. Verify training completion in enrollments table (FR-04 requirement)
    const enrollCheck = await query(
      `SELECT enrollment_id, completion_status 
       FROM women_skill_portal.enrollments
       WHERE woman_id = $1 AND program_id = $2`,
      [womanId, programId]
    );

    if (enrollCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot issue certificate: No enrollment found for this woman in the specified program.',
      });
    }

    if (enrollCheck.rows[0].completion_status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot issue certificate: Training is not completed (Current status: '${enrollCheck.rows[0].completion_status}').`,
      });
    }

    // 2. Generate certificate number if not provided
    const certNum = certificateNumber || `CERT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Insert certificate
    const result = await query(
      `INSERT INTO women_skill_portal.certifications 
        (woman_id, program_id, certificate_name, certificate_number, issue_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [womanId, programId, certificateName.trim(), certNum, issueDate || new Date().toISOString().slice(0, 10)]
    );

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get certificate by ID
 */
const getCertificateById = async (req, res, next) => {
  try {
    const certId = parseInt(req.params.id, 10);
    const sql = `
      SELECT c.*,
             w.full_name, w.email AS woman_email,
             tp.program_name, tp.category, tp.duration_weeks,
             prov.provider_name, prov.email AS provider_email, prov.website AS provider_website
      FROM women_skill_portal.certifications c
      JOIN women_skill_portal.women w ON c.woman_id = w.woman_id
      JOIN women_skill_portal.training_programs tp ON c.program_id = tp.program_id
      JOIN women_skill_portal.training_providers prov ON tp.provider_id = prov.provider_id
      WHERE c.certification_id = $1;
    `;

    const result = await query(sql, [certId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyCertificates,
  recordCertificate,
  getCertificateById,
};
