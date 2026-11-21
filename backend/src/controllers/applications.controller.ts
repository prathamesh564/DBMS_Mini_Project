import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

/**
 * Get personal job applications for logged-in woman
 */
export const getMyApplications = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
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

    const sql = `
      SELECT ja.application_id, ja.job_id, ja.application_date, ja.application_status, ja.cover_note,
             jp.job_title, jp.salary, COALESCE(jp.location, jp.job_location) AS job_location,
             jp.employment_type, jp.company_name
      FROM women_skill_portal.job_applications ja
      JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
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
 * List all job applications (Admin only)
 */
export const listAllApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, jobId, limit = 50, offset = 0 } = req.query;
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (status && status !== 'all') {
      conditions.push(`ja.application_status = $${idx++}`);
      params.push(status);
    }

    if (jobId) {
      conditions.push(`ja.job_id = $${idx++}`);
      params.push(parseInt(String(jobId), 10));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(parseInt(String(limit), 10));
    const limitIdx = idx++;
    params.push(parseInt(String(offset), 10));
    const offsetIdx = idx++;

    const sql = `
      SELECT ja.application_id, ja.job_id, ja.application_date, ja.application_status, ja.cover_note,
             w.woman_id, w.full_name AS candidate_name, w.email AS candidate_email, w.phone AS candidate_phone,
             w.education_level,
             jp.job_title, jp.company_name, COALESCE(jp.location, jp.job_location) AS job_location
      FROM women_skill_portal.job_applications ja
      JOIN women_skill_portal.women w ON ja.woman_id = w.woman_id
      JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
      ${whereClause}
      ORDER BY ja.application_date DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const result = await query(sql, params);
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single application by ID
 */
export const getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const applicationId = parseInt(req.params.id, 10);
    const sql = `
      SELECT ja.*,
             w.full_name, w.email AS woman_email, w.phone AS woman_phone, w.education_level, w.address AS woman_address,
             jp.job_title, jp.job_description, jp.salary, COALESCE(jp.location, jp.job_location) AS job_location,
             jp.employment_type, jp.company_name
      FROM women_skill_portal.job_applications ja
      JOIN women_skill_portal.women w ON ja.woman_id = w.woman_id
      JOIN women_skill_portal.job_postings jp ON ja.job_id = jp.job_id
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

    res.status(200).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
};

/**
 * Update application status (Admin only)
 */
export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const applicationId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const currentRes = await query<{ application_id: number }>(
      `SELECT application_id FROM women_skill_portal.job_applications WHERE application_id = $1`,
      [applicationId]
    );

    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
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
