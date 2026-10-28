const jobsService = require('../services/jobs.service');
const { query } = require('../config/database');

const listJobs = async (req, res, next) => {
  try {
    const { search, location, employmentType, status, employerId, limit, offset } = req.query;
    const result = await jobsService.getAllJobs({ search, location, employmentType, status, employerId, limit, offset });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    const job = await jobsService.getJobById(jobId);
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

const createJob = async (req, res, next) => {
  try {
    let employerId = req.user.employerId;

    if (!employerId && req.user.role === 'admin') {
      employerId = req.body.employerId;
      if (!employerId) {
        return res.status(400).json({ success: false, message: 'employerId is required when creating job as admin.' });
      }
    } else if (!employerId) {
      const e = await query(`SELECT employer_id FROM women_skill_portal.employers WHERE user_id = $1`, [req.user.userId]);
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

const updateJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    let employerId = req.user.employerId;

    if (!employerId && req.user.role === 'employer') {
      const e = await query(`SELECT employer_id FROM women_skill_portal.employers WHERE user_id = $1`, [req.user.userId]);
      if (e.rows.length > 0) employerId = e.rows[0].employer_id;
    }

    const updated = await jobsService.updateJob(jobId, employerId, req.user.role, req.body);
    res.status(200).json({ success: true, message: 'Job updated successfully.', data: updated });
  } catch (err) {
    next(err);
  }
};

const applyForJob = async (req, res, next) => {
  try {
    let womanId = req.user.womanId;
    if (!womanId) {
      const w = await query(`SELECT woman_id FROM women_skill_portal.women WHERE user_id = $1`, [req.user.userId]);
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

const getApplicationsForJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    let employerId = req.user.employerId;

    if (!employerId && req.user.role === 'employer') {
      const e = await query(`SELECT employer_id FROM women_skill_portal.employers WHERE user_id = $1`, [req.user.userId]);
      if (e.rows.length > 0) employerId = e.rows[0].employer_id;
    }

    const applications = await jobsService.getJobApplications(jobId, employerId, req.user.role);
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listJobs,
  getJob,
  createJob,
  updateJob,
  applyForJob,
  getApplicationsForJob,
};
