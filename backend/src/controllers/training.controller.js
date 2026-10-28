const trainingService = require('../services/training.service');
const { query } = require('../config/database');

const listPrograms = async (req, res, next) => {
  try {
    const { category, search, providerId, status, limit, offset } = req.query;
    const result = await trainingService.getAllPrograms({ category, search, providerId, status, limit, offset });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getProgram = async (req, res, next) => {
  try {
    const programId = parseInt(req.params.id, 10);
    const program = await trainingService.getProgramById(programId);
    res.status(200).json({ success: true, data: program });
  } catch (err) {
    next(err);
  }
};

const createProgram = async (req, res, next) => {
  try {
    let providerId = req.user.providerId;

    if (!providerId && req.user.role === 'admin') {
      providerId = req.body.providerId;
      if (!providerId) {
        return res.status(400).json({ success: false, message: 'Provider ID required when creating program as admin.' });
      }
    } else if (!providerId) {
      // Find provider ID by user ID
      const p = await query(`SELECT provider_id FROM women_skill_portal.training_providers WHERE user_id = $1`, [req.user.userId]);
      if (p.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'No training provider profile found for this user.' });
      }
      providerId = p.rows[0].provider_id;
    }

    const { programName, category, durationWeeks, courseFee, description, mode, status } = req.body;
    const newProgram = await trainingService.createProgram(providerId, {
      programName,
      category,
      durationWeeks,
      courseFee,
      description,
      mode,
      status,
    });

    res.status(201).json({ success: true, message: 'Training program created successfully.', data: newProgram });
  } catch (err) {
    next(err);
  }
};

const updateProgram = async (req, res, next) => {
  try {
    const programId = parseInt(req.params.id, 10);
    let providerId = req.user.providerId;
    if (!providerId && req.user.role === 'training_provider') {
      const p = await query(`SELECT provider_id FROM women_skill_portal.training_providers WHERE user_id = $1`, [req.user.userId]);
      if (p.rows.length > 0) providerId = p.rows[0].provider_id;
    }

    const updated = await trainingService.updateProgram(programId, providerId, req.user.role, req.body);
    res.status(200).json({ success: true, message: 'Training program updated successfully.', data: updated });
  } catch (err) {
    next(err);
  }
};

const enroll = async (req, res, next) => {
  try {
    let womanId = req.user.womanId;
    if (!womanId) {
      const w = await query(`SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1`, [req.user.userId]);
      if (w.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Woman profile not found for this account.' });
      }
      womanId = w.rows[0].woman_id;
    }

    const programId = parseInt(req.params.id, 10);
    const enrollment = await trainingService.enrollInProgram(womanId, programId);

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in training program.',
      data: enrollment,
    });
  } catch (err) {
    next(err);
  }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    let womanId = req.user.womanId;
    if (!womanId) {
      const w = await query(`SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1`, [req.user.userId]);
      if (w.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Woman profile not found for this account.' });
      }
      womanId = w.rows[0].woman_id;
    }

    const enrollments = await trainingService.getPersonalEnrollments(womanId);
    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPrograms,
  getProgram,
  createProgram,
  updateProgram,
  enroll,
  getMyEnrollments,
};
