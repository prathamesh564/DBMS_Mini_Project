
CREATE SCHEMA IF NOT EXISTS women_skill_portal;
--1. Women
CREATE TABLE women_skill_portal.women (
    woman_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    education_level VARCHAR(50),
    address VARCHAR(200)
);

-- 2. Skills
CREATE TABLE women_skill_portal.skills (
    skill_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    description VARCHAR(200)
);

-- 3. Women_Skills:
CREATE TABLE women_skill_portal.women_skills (
    woman_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_level VARCHAR(30),
    PRIMARY KEY (woman_id, skill_id),
    FOREIGN KEY (woman_id)
        REFERENCES women_skill_portal.women(woman_id),
    FOREIGN KEY (skill_id)
        REFERENCES women_skill_portal.skills(skill_id)
);

-- 4. Training_Providers
CREATE TABLE women_skill_portal.training_providers (
    provider_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    provider_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    address VARCHAR(200)
);

-- 5. Training_Programs
CREATE TABLE women_skill_portal.training_programs (
    program_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    provider_id INT NOT NULL,
    program_name VARCHAR(100) NOT NULL,
    duration_weeks INT,
    course_fee DECIMAL(10,2),
    FOREIGN KEY (provider_id)
        REFERENCES women_skill_portal.training_providers(provider_id)
);

-- 6. Enrollments
CREATE TABLE women_skill_portal.enrollments (
    enrollment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    woman_id INT NOT NULL,
    program_id INT NOT NULL,
    enrollment_date DATE,
    completion_status VARCHAR(30) DEFAULT 'Enrolled',
    UNIQUE (woman_id, program_id),
    FOREIGN KEY (woman_id)
        REFERENCES women_skill_portal.women(woman_id),
    FOREIGN KEY (program_id)
        REFERENCES women_skill_portal.training_programs(program_id)
);

-- 7. Employers
CREATE TABLE women_skill_portal.employers (
    employer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    industry VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    address VARCHAR(200)
);

-- 8. Job_Postings
CREATE TABLE women_skill_portal.job_postings (
    job_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employer_id INT NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    job_description TEXT,
    salary DECIMAL(10,2),
    job_location VARCHAR(100),
    employment_type VARCHAR(30),
    posted_date DATE,
    FOREIGN KEY (employer_id)
        REFERENCES women_skill_portal.employers(employer_id)
);

-- 9. Job_Applications
CREATE TABLE women_skill_portal.job_applications (
    application_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    woman_id INT NOT NULL,
    job_id INT NOT NULL,
    application_date DATE,
    application_status VARCHAR(30) DEFAULT 'Applied',
    UNIQUE (woman_id, job_id),
    FOREIGN KEY (woman_id)
        REFERENCES women_skill_portal.women(woman_id),
    FOREIGN KEY (job_id)
        REFERENCES women_skill_portal.job_postings(job_id)
);

-- 10. Interviews
CREATE TABLE women_skill_portal.interviews (
    interview_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id INT NOT NULL,
    interview_date TIMESTAMP,
    interview_mode VARCHAR(30),
    interview_status VARCHAR(30) DEFAULT 'Scheduled',
    FOREIGN KEY (application_id)
        REFERENCES women_skill_portal.job_applications(application_id)
);

-- 11. Certifications
CREATE TABLE women_skill_portal.certifications (
    certification_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    woman_id INT NOT NULL,
    program_id INT NOT NULL,
    certificate_name VARCHAR(100) NOT NULL,
    issue_date DATE,
    certificate_number VARCHAR(50) UNIQUE,
    FOREIGN KEY (woman_id)
        REFERENCES women_skill_portal.women(woman_id),
    FOREIGN KEY (program_id)
        REFERENCES women_skill_portal.training_programs(program_id)
);

-- 12. Employment_Records
CREATE TABLE women_skill_portal.employment_records (
    employment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    woman_id INT NOT NULL,
    job_id INT NOT NULL,
    joining_date DATE,
    salary DECIMAL(10,2),
    employment_status VARCHAR(30) DEFAULT 'Active',
    FOREIGN KEY (woman_id)
        REFERENCES women_skill_portal.women(woman_id),
    FOREIGN KEY (job_id)
        REFERENCES wo

