import { Request, Response, NextFunction } from 'express';
import * as jobsService from '../services/jobs.service';
import { query } from '../config/database';

export const listJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, location, employmentType, status, employerId, limit, offset } = req.query;
    const result = await jobsService.getAllJobs({
      search: search as string,
      location: location as string,
      employmentType: employmentType as string,
      status: status as string,
      employerId: employerId as string,
      limit: limit as string,
      offset: offset as string,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobId = parseInt(req.params.id, 10);
    const job = await jobsService.getJobById(jobId);
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

export const createJob = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let employerId = req.user.employerId;

    if (!employerId && req.user.role === 'admin') {
      employerId = req.body.employerId;
      if (!employerId) {
        return res.status(400).json({ success: false, message: 'employerId is required when creating job as admin.' });
      }
    } else if (!employerId) {
      const e = await query<{ employer_id: number }>(
        `SELECT employer_id FROM women_skill_portal.employers WHERE user_id = $1`,
        [req.user.userId]
      );
      if (e.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Employer profile not found for this account.' });
      }
      employerId = e.rows[0].employer_id;
    }

    const { jobTitle, jobDescription, salary, jobLocation, employmentType, deadline, status } = req.body;
    const newJob = await jobsService.createJob(employerId, {
      jobTitle,
      jobDescription,
      salary,
      jobLocation,
      employmentType,
      deadline,
      status,
    });

    res.status(201).json({ success: true, message: 'Job published successfully.', data: newJob });
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobId = parseInt(req.params.id, 10);
    let employerId = req.user?.employerId;

    if (!employerId && req.user?.role === 'employer') {
      const e = await query<{ employer_id: number }>(
        `SELECT employer_id FROM women_skill_portal.employers WHERE user_id = $1`,
        [req.user.userId]
      );
      if (e.rows.length > 0) employerId = e.rows[0].employer_id;
    }

    const updated = await jobsService.updateJob(jobId, employerId, req.user?.role, req.body);
    res.status(200).json({ success: true, message: 'Job updated successfully.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const applyForJob = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
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

    const jobId = parseInt(req.params.id, 10);
    const { coverNote } = req.body;
    const application = await jobsService.applyForJob(womanId, jobId, coverNote);

    res.status(201).json({
      success: true,
      message: 'Job application submitted successfully.',
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

export const getApplicationsForJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobId = parseInt(req.params.id, 10);
    let employerId = req.user?.employerId;

    if (!employerId && req.user?.role === 'employer') {
      const e = await query<{ employer_id: number }>(
        `SELECT employer_id FROM women_skill_portal.employers WHERE user_id = $1`,
        [req.user.userId]
      );
      if (e.rows.length > 0) employerId = e.rows[0].employer_id;
    }

    const applications = await jobsService.getJobApplications(jobId, employerId, req.user?.role);
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
};
