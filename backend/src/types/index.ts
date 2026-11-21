import { Request } from 'express';

export type UserRole = 'woman' | 'training_provider' | 'admin';

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type ProgramMode = 'Online' | 'Offline' | 'Hybrid';

export type ProgramStatus = 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';

export type CompletionStatus = 'Enrolled' | 'In Progress' | 'Completed' | 'Dropped';

export type JobStatus = 'Open' | 'Closed' | 'Draft' | 'Paused';

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Internship' | 'Contract' | 'Remote';

export type ApplicationStatus =
  | 'Applied'
  | 'Reviewed'
  | 'Shortlisted'
  | 'Interviewing'
  | 'Rejected'
  | 'Offered'
  | 'Accepted';

export interface AuthUser {
  userId: number;
  email: string;
  role: UserRole;
  womanId?: number | null;
  entityId?: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface UserProfile {
  user_id: number;
  email: string;
  password_hash?: string;
  role: UserRole;
  auth_id?: string | null;
  created_at: Date | string;
  updated_at?: Date | string;
}

export interface Woman {
  woman_id: number;
  user_id?: number | null;
  full_name: string;
  email: string;
  phone?: string | null;
  education_level?: string | null;
  address?: string | null;
  bio?: string | null;
  resume_url?: string | null;
  created_at: Date | string;
  updated_at?: Date | string;
}

export interface Skill {
  skill_id: number;
  skill_name: string;
  category: string;
  description?: string | null;
  created_at: Date | string;
}

export interface WomanSkill {
  woman_id: number;
  skill_id: number;
  proficiency_level: ProficiencyLevel;
  years_experience: number;
  added_at: Date | string;
}

export interface TrainingProgram {
  program_id: number;
  program_name: string;
  category: string;
  duration_weeks: number;
  course_fee: number;
  description?: string | null;
  mode: ProgramMode;
  status: ProgramStatus;
  provider_name: string;
  created_by?: number | null;
  user_id?: number | null;
  created_at: Date | string;
  updated_at?: Date | string;
}

export interface Enrollment {
  enrollment_id: number;
  woman_id: number;
  program_id: number;
  enrollment_date: Date | string;
  completion_status: CompletionStatus;
  completion_date?: Date | string | null;
  score?: number | null;
  assessment_score?: number | null;
}

export interface JobPosting {
  job_id: number;
  job_title: string;
  job_description: string;
  salary?: number | null;
  location?: string | null;
  job_location?: string | null;
  employment_type?: EmploymentType | null;
  posted_date: Date | string;
  deadline?: Date | string | null;
  status: JobStatus;
  company_name: string;
  posted_by?: number | null;
  user_id?: number | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface JobApplication {
  application_id: number;
  woman_id: number;
  job_id: number;
  application_date: Date | string;
  application_status: ApplicationStatus;
  cover_note?: string | null;
}

export interface DashboardStatistics {
  totalWomen: number;
  totalSkills: number;
  totalTrainingPrograms: number;
  totalEnrollments: number;
  totalOpenJobs: number;
  totalJobsAll: number;
  totalApplications: number;
  totalUsers: number;
  totalTrainingProviders: number;
}
