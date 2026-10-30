-- =====================================================================
-- Women Skill Development & Employment Portal
-- COMPLETE SUPABASE SQL SCRIPT
-- Paste and Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
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
-- TABLE CREATION (12 Normalized Relational Tables + User Profiles)
-- =====================================================================

-- Table 0: User Profiles (Auth & Role Mapping)
CREATE TABLE IF NOT EXISTS women_skill_portal.user_profiles (
    user_id SERIAL PRIMARY KEY,
    auth_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('woman', 'training_provider', 'employer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 1: Women
CREATE TABLE IF NOT EXISTS women_skill_portal.women (
    woman_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    education_level VARCHAR(100),
    address TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Skills
CREATE TABLE IF NOT EXISTS women_skill_portal.skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Women_Skills (Composite Primary Key: woman_id, skill_id)
CREATE TABLE IF NOT EXISTS women_skill_portal.women_skills (
    woman_id INT NOT NULL REFERENCES women_skill_portal.women(woman_id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES women_skill_portal.skills(skill_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) NOT NULL DEFAULT 'Beginner' CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    years_experience NUMERIC(3, 1) DEFAULT 0.0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (woman_id, skill_id)
);

-- Table 4: Training_Providers
CREATE TABLE IF NOT EXISTS women_skill_portal.training_providers (
    provider_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
    provider_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 5: Training_Programs
CREATE TABLE IF NOT EXISTS women_skill_portal.training_programs (
    program_id SERIAL PRIMARY KEY,
    provider_id INT NOT NULL REFERENCES women_skill_portal.training_providers(provider_id) ON DELETE CASCADE,
    program_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    duration_weeks INT NOT NULL CHECK (duration_weeks > 0),
    course_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (course_fee >= 0),
    description TEXT,
    mode VARCHAR(50) DEFAULT 'Online' CHECK (mode IN ('Online', 'Offline', 'Hybrid')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Upcoming', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 6: Enrollments (Unique constraint on woman_id, program_id)
CREATE TABLE IF NOT EXISTS women_skill_portal.enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    woman_id INT NOT NULL REFERENCES women_skill_portal.women(woman_id) ON DELETE CASCADE,
    program_id INT NOT NULL REFERENCES women_skill_portal.training_programs(program_id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_status VARCHAR(50) NOT NULL DEFAULT 'Enrolled' CHECK (completion_status IN ('Enrolled', 'In Progress', 'Completed', 'Dropped')),
    completion_date DATE,
    score NUMERIC(5, 2) CHECK (score >= 0 AND score <= 100),
    CONSTRAINT unique_woman_program UNIQUE (woman_id, program_id)
);

-- Table 7: Employers
CREATE TABLE IF NOT EXISTS women_skill_portal.employers (
    employer_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 8: Job_Postings
CREATE TABLE IF NOT EXISTS women_skill_portal.job_postings (
    job_id SERIAL PRIMARY KEY,
    employer_id INT NOT NULL REFERENCES women_skill_portal.employers(employer_id) ON DELETE CASCADE,
    job_title VARCHAR(200) NOT NULL,
    job_description TEXT NOT NULL,
    salary NUMERIC(12, 2) CHECK (salary >= 0),
    job_location VARCHAR(150),
    employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-Time' CHECK (employment_type IN ('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote')),
    posted_date DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed', 'Paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 9: Job_Applications (Unique constraint on woman_id, job_id)
CREATE TABLE IF NOT EXISTS women_skill_portal.job_applications (
    application_id SERIAL PRIMARY KEY,
    woman_id INT NOT NULL REFERENCES women_skill_portal.women(woman_id) ON DELETE CASCADE,
    job_id INT NOT NULL REFERENCES women_skill_portal.job_postings(job_id) ON DELETE CASCADE,
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    application_status VARCHAR(50) NOT NULL DEFAULT 'Applied' CHECK (application_status IN ('Applied', 'Reviewed', 'Shortlisted', 'Interviewing', 'Rejected', 'Offered', 'Accepted')),
    cover_note TEXT,
    CONSTRAINT unique_woman_job UNIQUE (woman_id, job_id)
);

-- Table 10: Interviews
CREATE TABLE IF NOT EXISTS women_skill_portal.interviews (
    interview_id SERIAL PRIMARY KEY,
    application_id INT NOT NULL REFERENCES women_skill_portal.job_applications(application_id) ON DELETE CASCADE,
    interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
    interview_mode VARCHAR(50) NOT NULL CHECK (interview_mode IN ('Online', 'Offline', 'Telephone')),
    interview_status VARCHAR(50) NOT NULL DEFAULT 'Scheduled' CHECK (interview_status IN ('Scheduled', 'Completed', 'Rescheduled', 'Cancelled')),
    location_or_link TEXT,
    notes TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 11: Certifications
CREATE TABLE IF NOT EXISTS women_skill_portal.certifications (
    certification_id SERIAL PRIMARY KEY,
    woman_id INT NOT NULL REFERENCES women_skill_portal.women(woman_id) ON DELETE CASCADE,
    program_id INT NOT NULL REFERENCES women_skill_portal.training_programs(program_id) ON DELETE CASCADE,
    certificate_name VARCHAR(200) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 12: Employment_Records
CREATE TABLE IF NOT EXISTS women_skill_portal.employment_records (
    employment_id SERIAL PRIMARY KEY,
    woman_id INT NOT NULL REFERENCES women_skill_portal.women(woman_id) ON DELETE CASCADE,
    job_id INT NOT NULL REFERENCES women_skill_portal.job_postings(job_id) ON DELETE CASCADE,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    salary NUMERIC(12, 2) NOT NULL CHECK (salary >= 0),
    employment_status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (employment_status IN ('Active', 'Probation', 'Resigned', 'Terminated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- SAFE MIGRATION (Ensure columns exist on pre-existing tables)
-- =====================================================================

ALTER TABLE IF EXISTS women_skill_portal.training_programs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS women_skill_portal.training_programs ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE IF EXISTS women_skill_portal.training_programs ADD COLUMN IF NOT EXISTS mode VARCHAR(50) DEFAULT 'Online';
ALTER TABLE IF EXISTS women_skill_portal.training_programs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
ALTER TABLE IF EXISTS women_skill_portal.training_programs ADD COLUMN IF NOT EXISTS duration_weeks INT DEFAULT 4;
ALTER TABLE IF EXISTS women_skill_portal.training_programs ADD COLUMN IF NOT EXISTS course_fee NUMERIC(10, 2) DEFAULT 0.00;

ALTER TABLE IF EXISTS women_skill_portal.job_postings ADD COLUMN IF NOT EXISTS job_description TEXT;
ALTER TABLE IF EXISTS women_skill_portal.job_postings ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Open';
ALTER TABLE IF EXISTS women_skill_portal.job_postings ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE IF EXISTS women_skill_portal.job_postings ADD COLUMN IF NOT EXISTS salary NUMERIC(12, 2);
ALTER TABLE IF EXISTS women_skill_portal.job_postings ADD COLUMN IF NOT EXISTS job_location VARCHAR(150);
ALTER TABLE IF EXISTS women_skill_portal.job_postings ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'Full-Time';

ALTER TABLE IF EXISTS women_skill_portal.skills ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE IF EXISTS women_skill_portal.women ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE IF EXISTS women_skill_portal.women ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE IF EXISTS women_skill_portal.women ADD COLUMN IF NOT EXISTS education_level VARCHAR(100);
ALTER TABLE IF EXISTS women_skill_portal.women ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE IF EXISTS women_skill_portal.women_skills ADD COLUMN IF NOT EXISTS years_experience NUMERIC(3, 1) DEFAULT 0.0;
ALTER TABLE IF EXISTS women_skill_portal.women_skills ADD COLUMN IF NOT EXISTS added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS women_skill_portal.training_providers ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE IF EXISTS women_skill_portal.training_providers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE IF EXISTS women_skill_portal.training_providers ADD COLUMN IF NOT EXISTS website VARCHAR(255);

ALTER TABLE IF EXISTS women_skill_portal.employers ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE IF EXISTS women_skill_portal.employers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE IF EXISTS women_skill_portal.employers ADD COLUMN IF NOT EXISTS website VARCHAR(255);

ALTER TABLE IF EXISTS women_skill_portal.enrollments ADD COLUMN IF NOT EXISTS completion_date DATE;
ALTER TABLE IF EXISTS women_skill_portal.enrollments ADD COLUMN IF NOT EXISTS score NUMERIC(5, 2);

ALTER TABLE IF EXISTS women_skill_portal.job_applications ADD COLUMN IF NOT EXISTS cover_note TEXT;

ALTER TABLE IF EXISTS women_skill_portal.interviews ADD COLUMN IF NOT EXISTS location_or_link TEXT;
ALTER TABLE IF EXISTS women_skill_portal.interviews ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS women_skill_portal.interviews ADD COLUMN IF NOT EXISTS feedback TEXT;

-- =====================================================================
-- PERFORMANCE INDEXES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_women_email ON women_skill_portal.women(email);
CREATE INDEX IF NOT EXISTS idx_women_skills_skill ON women_skill_portal.women_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_provider ON women_skill_portal.training_programs(provider_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_status ON women_skill_portal.training_programs(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_woman ON women_skill_portal.enrollments(woman_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_program ON women_skill_portal.enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON women_skill_portal.enrollments(completion_status);
CREATE INDEX IF NOT EXISTS idx_job_postings_employer ON women_skill_portal.job_postings(employer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON women_skill_portal.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_woman ON women_skill_portal.job_applications(woman_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON women_skill_portal.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application ON women_skill_portal.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_certifications_woman ON women_skill_portal.certifications(woman_id);
CREATE INDEX IF NOT EXISTS idx_employment_records_woman ON women_skill_portal.employment_records(woman_id);

-- =====================================================================
-- SEED SAMPLE DATA (For DBMS Testing & Demonstration)
-- =====================================================================

-- 1. Insert Skills
INSERT INTO women_skill_portal.skills (skill_name, category, description)
VALUES 
    ('Python Programming', 'Information Technology', 'Core Python, data structures, and automation scripting.'),
    ('Web Development (React & Node.js)', 'Software Development', 'Building dynamic modern responsive web applications.'),
    ('Data Analysis with SQL & Excel', 'Data Science', 'Relational database queries, data cleaning, and spreadsheet modeling.'),
    ('UI/UX Design with Figma', 'Creative & Design', 'Wireframing, high-fidelity prototypes, and user research.'),
    ('Digital Marketing & SEO', 'Business & Marketing', 'Search engine optimization, social media strategy, and analytics.'),
    ('Financial Accounting', 'Finance', 'Bookkeeping, balance sheets, and GST compliance.')
ON CONFLICT (skill_name) DO NOTHING;

-- 2. Insert Training Providers
INSERT INTO women_skill_portal.training_providers (provider_name, email, phone, address, website)
VALUES 
    ('Women Tech Empowerment Academy', 'info@womentechacademy.org', '+91 9876543210', 'Indiranagar, Bengaluru, Karnataka', 'https://womentechacademy.org'),
    ('Pragati Skill Institute', 'contact@pragatisills.in', '+91 9123456780', 'Shivajinagar, Pune, Maharashtra', 'https://pragatiskills.in'),
    ('National Digital Literacy Mission', 'support@ndlm-women.org', '+91 9988776655', 'Connaught Place, New Delhi', 'https://ndlm-women.org')
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Training Programs
INSERT INTO women_skill_portal.training_programs (provider_id, program_name, category, duration_weeks, course_fee, description, mode, status)
VALUES 
    (1, 'Full Stack Web Development Bootcamp', 'Software Development', 12, 0.00, 'Comprehensive HTML, CSS, JavaScript, React, and Node.js training.', 'Online', 'Active'),
    (1, 'Python for Data Analytics', 'Data Science', 8, 0.00, 'Learn data analysis with Pandas, NumPy, and SQL databases.', 'Online', 'Active'),
    (2, 'Professional UI/UX Product Design', 'Design', 6, 1500.00, 'Hands-on Figma training with real client portfolio projects.', 'Hybrid', 'Active'),
    (3, 'Executive Digital Marketing Certification', 'Marketing', 4, 0.00, 'Social media marketing, content creation, and search campaigns.', 'Online', 'Active')
ON CONFLICT DO NOTHING;

-- 4. Insert Employers
INSERT INTO women_skill_portal.employers (company_name, industry, email, phone, address, website)
VALUES 
    ('Innovatech Software Solutions', 'Information Technology', 'careers@innovatech.com', '+91 8023456789', 'Electronic City, Bengaluru', 'https://innovatech.com'),
    ('Apex Global Analytics', 'Data & Analytics', 'recruiting@apexanalytics.com', '+91 2244556677', 'BKC, Mumbai', 'https://apexanalytics.com'),
    ('Creative Spark Media', 'Advertising & Design', 'hr@creativespark.in', '+91 1122334455', 'Cyber City, Gurugram', 'https://creativespark.in')
ON CONFLICT (email) DO NOTHING;

-- 5. Insert Job Postings
INSERT INTO women_skill_portal.job_postings (employer_id, job_title, job_description, salary, job_location, employment_type, deadline, status)
VALUES 
    (1, 'Junior Frontend Developer', 'Looking for an enthusiastic web developer proficient in React and JavaScript.', 450000.00, 'Bengaluru', 'Full-Time', CURRENT_DATE + INTERVAL '30 days', 'Open'),
    (2, 'Data Analyst Associate', 'Analyze business data, build SQL reports, and present dashboards.', 500000.00, 'Mumbai', 'Full-Time', CURRENT_DATE + INTERVAL '25 days', 'Open'),
    (3, 'UI/UX Designer Intern', 'Assist product design team with mobile wireframes and asset preparation.', 240000.00, 'Remote', 'Internship', CURRENT_DATE + INTERVAL '20 days', 'Open'),
    (1, 'Python Backend Engineer', 'Develop and maintain RESTful APIs with Node.js and PostgreSQL.', 600000.00, 'Hybrid', 'Full-Time', CURRENT_DATE + INTERVAL '45 days', 'Open')
ON CONFLICT DO NOTHING;

-- 6. Insert Sample Registered Women
INSERT INTO women_skill_portal.women (full_name, email, phone, education_level, address, bio)
VALUES 
    ('Priya Sharma', 'priya.sharma@example.com', '+91 9811122233', 'Bachelor of Computer Applications', 'Bengaluru, Karnataka', 'Aspiring web developer eager to build modern applications.'),
    ('Ananya Verma', 'ananya.verma@example.com', '+91 9822233344', 'B.Sc Statistics', 'Pune, Maharashtra', 'Passionate data analyst skilled in SQL and statistical modeling.'),
    ('Sneha Kulkarni', 'sneha.kulkarni@example.com', '+91 9833344455', 'B.A. Graphic Design', 'Mumbai, Maharashtra', 'Creative UI designer with a passion for accessible digital products.')
ON CONFLICT (email) DO NOTHING;

-- 7. Insert Women Skills (Composite PK)
INSERT INTO women_skill_portal.women_skills (woman_id, skill_id, proficiency_level, years_experience)
VALUES 
    (1, 2, 'Intermediate', 1.5),
    (1, 1, 'Beginner', 0.5),
    (2, 3, 'Advanced', 2.0),
    (2, 1, 'Intermediate', 1.0),
    (3, 4, 'Advanced', 2.5)
ON CONFLICT (woman_id, skill_id) DO NOTHING;

-- 8. Insert Enrollments
INSERT INTO women_skill_portal.enrollments (woman_id, program_id, enrollment_date, completion_status, completion_date, score)
VALUES 
    (1, 1, CURRENT_DATE - INTERVAL '60 days', 'Completed', CURRENT_DATE - INTERVAL '10 days', 92.5),
    (2, 2, CURRENT_DATE - INTERVAL '30 days', 'In Progress', NULL, NULL),
    (3, 3, CURRENT_DATE - INTERVAL '50 days', 'Completed', CURRENT_DATE - INTERVAL '5 days', 88.0)
ON CONFLICT (woman_id, program_id) DO NOTHING;

-- 9. Insert Certifications (Earned upon completed training)
INSERT INTO women_skill_portal.certifications (woman_id, program_id, certificate_name, certificate_number, issue_date)
VALUES 
    (1, 1, 'Certified Full Stack Web Developer', 'CERT-2025-WDEV-001', CURRENT_DATE - INTERVAL '10 days'),
    (3, 3, 'Certified UI/UX Product Designer', 'CERT-2025-UIUX-002', CURRENT_DATE - INTERVAL '5 days')
ON CONFLICT (certificate_number) DO NOTHING;

-- 10. Insert Job Applications
INSERT INTO women_skill_portal.job_applications (woman_id, job_id, application_date, application_status, cover_note)
VALUES 
    (1, 1, CURRENT_DATE - INTERVAL '8 days', 'Interviewing', 'I recently completed the Web Development Bootcamp and would love to contribute to Innovatech.'),
    (2, 2, CURRENT_DATE - INTERVAL '5 days', 'Reviewed', 'Excited to apply my analytical background and SQL skills to business problems at Apex.'),
    (3, 3, CURRENT_DATE - INTERVAL '4 days', 'Offered', 'Enclosing my Figma design portfolio showcasing clean, user-centric mobile designs.')
ON CONFLICT (woman_id, job_id) DO NOTHING;

-- 11. Insert Interviews
INSERT INTO women_skill_portal.interviews (application_id, interview_date, interview_mode, interview_status, location_or_link, notes)
VALUES 
    (1, CURRENT_TIMESTAMP + INTERVAL '2 days', 'Online', 'Scheduled', 'https://meet.google.com/abc-defg-hij', 'Technical round on React and JavaScript fundamentals.'),
    (3, CURRENT_TIMESTAMP - INTERVAL '2 days', 'Online', 'Completed', 'https://meet.google.com/xyz-uvwx-rst', 'Portfolio review round was very positive.')
ON CONFLICT DO NOTHING;

-- 12. Insert Employment Records
INSERT INTO women_skill_portal.employment_records (woman_id, job_id, joining_date, salary, employment_status)
VALUES 
    (3, 3, CURRENT_DATE + INTERVAL '10 days', 240000.00, 'Active')
ON CONFLICT DO NOTHING;
