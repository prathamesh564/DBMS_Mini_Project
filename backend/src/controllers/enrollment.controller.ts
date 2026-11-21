import { Request, Response, NextFunction } from 'express';
import * as trainingService from '../services/training.service';
import { query } from '../config/database';

export const listEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isProvider = req.user?.role === 'training_provider';
    const providerUserId = isProvider ? req.user?.userId : req.query.providerUserId;

    const { programId, status, limit, offset } = req.query;
    const enrollments = await trainingService.getEnrollments({
      providerUserId: providerUserId as string,
      programId: programId as string,
      status: status as string,
      limit: limit as string,
      offset: offset as string,
    });
    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) {
    next(err);
  }
};

export const getEnrollmentById = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const enrollmentId = parseInt(req.params.id, 10);
    const sql = `
      SELECT e.*, COALESCE(e.assessment_score, e.score) AS score,
             w.full_name, w.email AS woman_email, w.phone AS woman_phone,
             tp.program_name, tp.duration_weeks, tp.provider_name
      FROM women_skill_portal.enrollments e
      JOIN women_skill_portal.women w ON e.woman_id = w.woman_id
      JOIN women_skill_portal.training_programs tp ON e.program_id = tp.program_id
      WHERE e.enrollment_id = $1;
    `;
    const result = await query(sql, [enrollmentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found.' });
    }

    const enrollment = result.rows[0];

    // Enforce ownership: Candidate women can only view their own enrollment records
    if (req.user?.role === 'woman' && req.user.womanId && enrollment.woman_id !== req.user.womanId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own enrollment records.',
      });
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
};

export const updateEnrollmentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const enrollmentId = parseInt(req.params.id, 10);
    const { completionStatus, score, assessmentScore, completionDate } = req.body;
    const updated = await trainingService.updateEnrollment(enrollmentId, {
      completionStatus,
      score,
      assessmentScore,
      completionDate,
    });
    res.status(200).json({ success: true, message: 'Enrollment status updated.', data: updated });
  } catch (err) {
    next(err);
  }
};
