import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

/**
 * View personal employment records for logged-in woman
 */
export const getMyEmployment = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
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
        return res.status(400).json({ success: false, message: 'Woman profile not found for this account.' });
      }
      womanId = w.rows[0].woman_id;
    }

    const sql = `
      SELECT er.*, jp.job_title, jp.employment_type, jp.job_location,
             emp.company_name, emp.industry, emp.email AS employer_email
      FROM women_skill_portal.employment_records er
      JOIN women_skill_portal.job_postings jp ON er.job_id = jp.job_id
      JOIN women_skill_portal.employers emp ON jp.employer_id = emp.employer_id
      WHERE er.woman_id = $1
      ORDER BY er.joining_date DESC;
    `;

    const result = await query(sql, [womanId]);
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Record a verified placement
 */
export const recordPlacement = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { womanId, jobId, joiningDate, salary, employmentStatus } = req.body;

    // Verify job belongs to employer if caller is employer
    if (req.user.role === 'employer') {
      const jobCheck = await query<{ employer_id: number }>(
        `SELECT employer_id FROM women_skill_portal.job_postings WHERE job_id = $1`,
        [jobId]
      );
      if (jobCheck.rows.length === 0 || jobCheck.rows[0].employer_id !== req.user.employerId) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only record placements for your own job postings.' });
      }
    }

    const result = await query(
      `INSERT INTO women_skill_portal.employment_records
        (woman_id, job_id, joining_date, salary, employment_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        womanId,
        jobId,
        joiningDate || new Date().toISOString().slice(0, 10),
        parseFloat(salary),
        employmentStatus || 'Active',
      ]
    );

    // Also update application status if exists
    await query(
      `UPDATE women_skill_portal.job_applications
       SET application_status = 'Accepted'
       WHERE woman_id = $1 AND job_id = $2`,
      [womanId, jobId]
    );

    res.status(201).json({
      success: true,
      message: 'Employment placement recorded successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get employment record by ID
 */
export const getEmploymentById = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const empId = parseInt(req.params.id, 10);
    const sql = `
      SELECT er.*,
             w.full_name, w.email AS woman_email, w.phone AS woman_phone,
             jp.job_title, jp.employment_type, jp.job_location,
             emp.company_name, emp.industry, emp.email AS employer_email
      FROM women_skill_portal.employment_records er
      JOIN women_skill_portal.women w ON er.woman_id = w.woman_id
      JOIN women_skill_portal.job_postings jp ON er.job_id = jp.job_id
      JOIN women_skill_portal.employers emp ON jp.employer_id = emp.employer_id
      WHERE er.employment_id = $1;
    `;

    const result = await query(sql, [empId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employment record not found.' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Update employment status (active, probation, resigned, terminated)
 */
export const updateEmploymentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const empId = parseInt(req.params.id, 10);
    const { employmentStatus, salary } = req.body;

    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (employmentStatus) {
      fields.push(`employment_status = $${idx++}`);
      params.push(employmentStatus);
    }
    if (salary !== undefined) {
      fields.push(`salary = $${idx++}`);
      params.push(parseFloat(salary));
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(empId);

    const sql = `
      UPDATE women_skill_portal.employment_records
      SET ${fields.join(', ')}
      WHERE employment_id = $${idx}
      RETURNING *;
    `;

    const result = await query(sql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employment record not found.' });
    }

    res.status(200).json({ success: true, message: 'Employment record updated.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
