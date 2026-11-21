import { Request, Response, NextFunction } from 'express';
import * as trainingService from '../services/training.service';
import { query } from '../config/database';

export const listPrograms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search, providerName, createdBy, status, limit, offset } = req.query;
    const result = await trainingService.getAllPrograms({
      category: category as string,
      search: search as string,
      providerName: providerName as string,
      createdBy: createdBy as string,
      status: status as string,
      limit: limit as string,
      offset: offset as string,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const programId = parseInt(req.params.id, 10);
    const program = await trainingService.getProgramById(programId);
    res.status(200).json({ success: true, data: program });
  } catch (err) {
    next(err);
  }
};

export const createProgram = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { programName, category, durationWeeks, courseFee, description, mode, status, providerName } = req.body;
    const newProgram = await trainingService.createProgram(req.user.userId, req.user.email, {
      programName,
      category,
      durationWeeks,
      courseFee,
      description,
      mode,
      status,
      providerName,
    });

    res.status(201).json({ success: true, message: 'Training program created successfully.', data: newProgram });
  } catch (err) {
    next(err);
  }
};

export const updateProgram = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const programId = parseInt(req.params.id, 10);
    const updated = await trainingService.updateProgram(programId, req.user.userId, req.user.role, req.body);
    res.status(200).json({ success: true, message: 'Training program updated successfully.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteProgram = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const programId = parseInt(req.params.id, 10);
    await trainingService.deleteProgram(programId, req.user.userId, req.user.role);
    res.status(200).json({ success: true, message: 'Training program deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

export const enroll = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let womanId = req.user.womanId;
    if (!womanId) {
      const w = await query<{ woman_id: number }>(
        `SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1`,
        [req.user.userId]
      );
      if (w.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Only registered woman candidate profiles can enroll in training programs.',
        });
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

export const getMyEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let womanId = req.user.womanId;
    if (!womanId) {
      const w = await query<{ woman_id: number }>(
        `SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1`,
        [req.user.userId]
      );
      if (w.rows.length === 0) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      womanId = w.rows[0].woman_id;
    }

    const enrollments = await trainingService.getPersonalEnrollments(womanId);
    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) {
    next(err);
  }
};
