-- =====================================================================
-- EmpowerHer - Women Skill Development & Employment Portal
-- PostgreSQL Database Schema: women_skill_portal
-- 8 Essential Relational Tables + User Profiles + Permissions + Constraints
-- =====================================================================

-- 1. Create Schema
CREATE SCHEMA IF NOT EXISTS women_skill_portal;

-- 2. Grant Permissions for Supabase Roles
GRANT USAGE ON SCHEMA women_skill_portal TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA women_skill_portal TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA women_skill_portal TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA women_skill_portal TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA women_skill_portal GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA women_skill_portal GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- Set search path for current session
SET search_path TO women_skill_portal, public;

-- =====================================================================
-- TABLE CREATION (Exactly 8 Relational Tables)
-- =====================================================================

-- Table 1: user_profiles (Auth & Role Mapping)
CREATE TABLE IF NOT EXISTS women_skill_portal.user_profiles (
    user_id SERIAL PRIMARY KEY,
    auth_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('woman', 'training_provider', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: women (Candidate Profiles)
CREATE TABLE IF NOT EXISTS women_skill_portal.women (
    woman_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    education_level VARCHAR(100),
    address TEXT,
    bio TEXT,
    resume_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: skills (Skill Master List)
CREATE TABLE IF NOT EXISTS women_skill_portal.skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: women_skills (Composite Primary Key: woman_id, skill_id)
CREATE TABLE IF NOT EXISTS women_skill_portal.women_skills (
    woman_id INT NOT NULL REFERENCES women_skill_portal.women(woman_id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES women_skill_portal.skills(skill_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) NOT NULL DEFAULT 'Beginner' CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    years_experience NUMERIC(3, 1) DEFAULT 0.0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (woman_id, skill_id)
);

-- Table 5: training_programs (Provider Information Stored Directly)
CREATE TABLE IF NOT EXISTS women_skill_portal.training_programs (
    program_id SERIAL PRIMARY KEY,
    program_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    duration_weeks INT NOT NULL CHECK (duration_weeks > 0),
    course_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (course_fee >= 0),
    description TEXT,
    mode VARCHAR(50) DEFAULT 'Online' CHECK (mode IN ('Online', 'Offline', 'Hybrid')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Upcoming', 'Completed', 'Cancelled')),
    provider_name VARCHAR(200) NOT NULL DEFAULT 'EmpowerHer Academy',
    created_by INT REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
    user_id INT REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 6: enrollments (Candidate Course Enrollment & Progress)
CREATE TABLE IF NOT EXISTS women_skill_portal.enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    woman_id INT NOT NULL REFERENCES women_skill_portal.women(woman_id) ON DELETE CASCADE,
    program_id INT NOT NULL REFERENCES women_skill_portal.training_programs(program_id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_status VARCHAR(50) NOT NULL DEFAULT 'Enrolled' CHECK (completion_status IN ('Enrolled', 'In Progress', 'Completed', 'Dropped')),
    completion_date DATE,
    score NUMERIC(5, 2) CHECK (score >= 0 AND score <= 100),
    assessment_score NUMERIC(5, 2) CHECK (assessment_score >= 0 AND assessment_score <= 100),
    CONSTRAINT unique_woman_program UNIQUE (woman_id, program_id)
);

-- Table 7: job_postings (Company Information Stored Directly - Admin Managed)
CREATE TABLE IF NOT EXISTS women_skill_portal.job_postings (
    job_id SERIAL PRIMARY KEY,
    job_title VARCHAR(200) NOT NULL,
    job_description TEXT NOT NULL,
    salary NUMERIC(12, 2) CHECK (salary >= 0),
    location VARCHAR(150),
    job_location VARCHAR(150),
    employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-Time' CHECK (employment_type IN ('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote')),
    posted_date DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed', 'Paused', 'Draft')),
    company_name VARCHAR(200) NOT NULL DEFAULT 'EmpowerHer Partner',
    posted_by INT REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
    user_id INT REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 8: job_applications (Application Tracking)
CREATE TABLE IF NOT EXISTS women_skill_portal.job_applications (
    application_id SERIAL PRIMARY KEY,
    woman_id INT NOT NULL REFERENCES women_skill_portal.women(woman_id) ON DELETE CASCADE,
    job_id INT NOT NULL REFERENCES women_skill_portal.job_postings(job_id) ON DELETE CASCADE,
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    application_status VARCHAR(50) NOT NULL DEFAULT 'Applied' CHECK (application_status IN ('Applied', 'Reviewed', 'Shortlisted', 'Interviewing', 'Rejected', 'Offered', 'Accepted')),
    cover_note TEXT,
    CONSTRAINT unique_woman_job UNIQUE (woman_id, job_id)
);

-- =====================================================================
-- PERFORMANCE INDEXES (8 Tables)
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_women_email ON women_skill_portal.women(email);
CREATE INDEX IF NOT EXISTS idx_women_user_id ON women_skill_portal.women(user_id);
CREATE INDEX IF NOT EXISTS idx_women_skills_skill ON women_skill_portal.women_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_status ON women_skill_portal.training_programs(status);
CREATE INDEX IF NOT EXISTS idx_training_programs_created_by ON women_skill_portal.training_programs(created_by);
CREATE INDEX IF NOT EXISTS idx_enrollments_woman ON women_skill_portal.enrollments(woman_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_program ON women_skill_portal.enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON women_skill_portal.enrollments(completion_status);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON women_skill_portal.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_by ON women_skill_portal.job_postings(posted_by);
CREATE INDEX IF NOT EXISTS idx_job_applications_woman ON women_skill_portal.job_applications(woman_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON women_skill_portal.job_applications(job_id);
