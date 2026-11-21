import { query } from '../config/database';
import { JobPosting, JobStatus, EmploymentType, UserRole } from '../types';

export interface GetAllJobsParams {
  search?: string;
  location?: string;
  employmentType?: string;
  status?: string;
  companyName?: string;
  limit?: number | string;
  offset?: number | string;
}

export interface CreateJobParams {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  salary?: number | string;
  location?: string;
  jobLocation?: string;
  employmentType?: EmploymentType;
  deadline?: string | null;
  status?: JobStatus;
}

export interface UpdateJobParams {
  jobTitle?: string;
  jobDescription?: string;
  companyName?: string;
  salary?: number | string;
  location?: string;
  jobLocation?: string;
  employmentType?: EmploymentType;
  deadline?: string | null;
  status?: JobStatus;
}

/**
 * List job postings with search, location, employment_type filters, and pagination
 */
export const getAllJobs = async ({
  search,
  location,
  employmentType,
  status = 'Open',
  companyName,
  limit = 20,
  offset = 0,
}: GetAllJobsParams): Promise<any> => {
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (status && status !== 'all') {
    conditions.push(`jp.status = $${idx++}`);
    params.push(status);
  }

  if (location) {
    conditions.push(`(jp.location ILIKE $${idx} OR jp.job_location ILIKE $${idx})`);
    params.push(`%${location}%`);
    idx++;
  }

  if (employmentType) {
    conditions.push(`jp.employment_type = $${idx++}`);
    params.push(employmentType);
  }

  if (companyName) {
    conditions.push(`jp.company_name ILIKE $${idx++}`);
    params.push(`%${companyName}%`);
  }

  if (search) {
    conditions.push(`(jp.job_title ILIKE $${idx} OR jp.job_description ILIKE $${idx} OR jp.company_name ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(parseInt(String(limit), 10));
  const limitIdx = idx++;
  params.push(parseInt(String(offset), 10));
  const offsetIdx = idx++;

  const sql = `
    SELECT jp.job_id, jp.job_title, jp.job_description, jp.salary,
           COALESCE(jp.location, jp.job_location) AS location,
           COALESCE(jp.location, jp.job_location) AS job_location,
           jp.employment_type, jp.posted_date, jp.deadline, jp.status,
           jp.company_name, jp.posted_by,
           COUNT(ja.application_id) AS applications_count
    FROM women_skill_portal.job_postings jp
    LEFT JOIN women_skill_portal.job_applications ja ON jp.job_id = ja.job_id
    ${whereClause}
    GROUP BY jp.job_id
    ORDER BY jp.posted_date DESC, jp.job_id DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx};
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM women_skill_portal.job_postings jp
    ${whereClause};
  `;

  const [listRes, countRes] = await Promise.all([
    query(sql, params),
    query<{ total: string }>(countSql, params.slice(0, limitIdx - 1)),
  ]);

  return {
    total: parseInt(countRes.rows[0].total, 10),
    jobs: listRes.rows,
    limit: parseInt(String(limit), 10),
    offset: parseInt(String(offset), 10),
  };
};

/**
 * Get single job posting by ID
 */
export const getJobById = async (jobId: number): Promise<any> => {
  const sql = `
    SELECT jp.job_id, jp.job_title, jp.job_description, jp.salary,
           COALESCE(jp.location, jp.job_location) AS location,
           COALESCE(jp.location, jp.job_location) AS job_location,
           jp.employment_type, jp.posted_date, jp.deadline, jp.status,
           jp.company_name, jp.posted_by,
           COUNT(ja.application_id) AS total_applicants
    FROM women_skill_portal.job_postings jp
    LEFT JOIN women_skill_portal.job_applications ja ON jp.job_id = ja.job_id
    WHERE jp.job_id = $1
    GROUP BY jp.job_id;
  `;

  const res = await query(sql, [jobId]);
  if (res.rows.length === 0) {
    throw new Error(`Job posting with ID ${jobId} not found.`);
  }

  return res.rows[0];
};

/**
 * Publish a new job (Admin only)
 */
export const createJob = async (
  userId: number,
  { jobTitle, jobDescription, companyName, salary, location, jobLocation, employmentType, deadline, status }: CreateJobParams
): Promise<any> => {
  const finalLocation = location || jobLocation || 'Remote';

  const res = await query<JobPosting>(
    `INSERT INTO women_skill_portal.job_postings
      (job_title, job_description, company_name, salary, location, job_location, employment_type, deadline, status, posted_by, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      jobTitle.trim(),
      jobDescription.trim(),
      companyName?.trim() || 'EmpowerHer Partner',
      salary !== undefined && salary !== null ? parseFloat(String(salary)) : null,
      finalLocation,
      finalLocation,
      employmentType || 'Full-Time',
      deadline || null,
      status || 'Open',
      userId,
      userId,
    ]
  );

  return getJobById(res.rows[0].job_id);
};

/**
 * Update an existing job (Admin only)
 */
export const updateJob = async (
  jobId: number,
  updates: UpdateJobParams
): Promise<any> => {
  await getJobById(jobId);

  const fields: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (updates.jobTitle) {
    fields.push(`job_title = $${idx++}`);
    params.push(updates.jobTitle.trim());
  }
  if (updates.jobDescription) {
    fields.push(`job_description = $${idx++}`);
    params.push(updates.jobDescription.trim());
  }
  if (updates.companyName) {
    fields.push(`company_name = $${idx++}`);
    params.push(updates.companyName.trim());
  }
  if (updates.salary !== undefined) {
    fields.push(`salary = $${idx++}`);
    params.push(updates.salary ? parseFloat(String(updates.salary)) : null);
  }
  const finalLocation = updates.location || updates.jobLocation;
  if (finalLocation !== undefined) {
    fields.push(`location = $${idx++}`);
    params.push(finalLocation);
    fields.push(`job_location = $${idx++}`);
    params.push(finalLocation);
  }
  if (updates.employmentType) {
    fields.push(`employment_type = $${idx++}`);
    params.push(updates.employmentType);
  }
  if (updates.deadline !== undefined) {
    fields.push(`deadline = $${idx++}`);
    params.push(updates.deadline);
  }
  if (updates.status) {
    fields.push(`status = $${idx++}`);
    params.push(updates.status);
  }

  if (fields.length === 0) {
    return getJobById(jobId);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(jobId);

  const sql = `
    UPDATE women_skill_portal.job_postings
    SET ${fields.join(', ')}
    WHERE job_id = $${idx}
    RETURNING *;
  `;

  await query(sql, params);
  return getJobById(jobId);
};

/**
 * Delete a job (Admin only)
 */
export const deleteJob = async (jobId: number): Promise<boolean> => {
  await getJobById(jobId);
  await query(`DELETE FROM women_skill_portal.job_postings WHERE job_id = $1`, [jobId]);
  return true;
};

/**
 * Apply for a job (Woman only)
 */
export const applyForJob = async (womanId: number, jobId: number, coverNote?: string): Promise<any> => {
  // 1. Check job status
  const job = await getJobById(jobId);
  if (job.status !== 'Open') {
    throw new Error(`Cannot apply: This job is currently ${job.status}.`);
  }

  // 2. Check duplicate application (uniqueness constraint)
  const existing = await query<{ application_id: number; application_status: string }>(
    `SELECT application_id, application_status FROM women_skill_portal.job_applications 
     WHERE woman_id = $1 AND job_id = $2`,
    [womanId, jobId]
  );

  if (existing.rows.length > 0) {
    throw new Error(`You have already applied for this job (Status: ${existing.rows[0].application_status}).`);
  }

  // 3. Insert application
  const res = await query(
    `INSERT INTO women_skill_portal.job_applications (woman_id, job_id, application_date, application_status, cover_note)
     VALUES ($1, $2, CURRENT_DATE, 'Applied', $3)
     RETURNING *`,
    [womanId, jobId, coverNote || null]
  );

  return res.rows[0];
};

/**
 * Get applications for a specific job (Admin only)
 */
export const getJobApplications = async (jobId: number): Promise<any[]> => {
  await getJobById(jobId);

  const sql = `
    SELECT ja.application_id, ja.job_id, ja.application_date, ja.application_status, ja.cover_note,
           w.woman_id, w.full_name, w.email AS woman_email, w.phone AS woman_phone,
           w.education_level, w.address
    FROM women_skill_portal.job_applications ja
    JOIN women_skill_portal.women w ON ja.woman_id = w.woman_id
    WHERE ja.job_id = $1
    ORDER BY ja.application_date DESC;
  `;

  const res = await query(sql, [jobId]);
  return res.rows;
};
