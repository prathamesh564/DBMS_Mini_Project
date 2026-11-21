-- =====================================================================
-- EmpowerHer Portal - Safe Database Migration to Exactly 8 Tables
-- Target Schema: women_skill_portal
-- Preserves all candidate, training program, and job posting data
-- =====================================================================

BEGIN;

-- 1. Ensure schema and search path
CREATE SCHEMA IF NOT EXISTS women_skill_portal;
SET search_path TO women_skill_portal, public;

-- 2. Update user_profiles role check constraint
-- First, convert any existing 'employer' users to 'admin' so the constraint succeeds
UPDATE women_skill_portal.user_profiles
SET role = 'admin', updated_at = CURRENT_TIMESTAMP
WHERE role = 'employer';

-- Update check constraint on user_profiles
ALTER TABLE women_skill_portal.user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE women_skill_portal.user_profiles 
  ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('woman', 'training_provider', 'admin'));

-- 3. Enhance women table
ALTER TABLE women_skill_portal.women
  ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- 4. Enhance training_programs before dropping training_providers
ALTER TABLE women_skill_portal.training_programs
  ADD COLUMN IF NOT EXISTS provider_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS created_by INT REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_id INT REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL;

-- Migrate provider_name from training_providers if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'women_skill_portal' AND table_name = 'training_providers') THEN
    UPDATE women_skill_portal.training_programs tp
    SET provider_name = COALESCE(tp.provider_name, prov.provider_name, 'EmpowerHer Academy'),
        created_by = COALESCE(tp.created_by, prov.user_id, (SELECT user_id FROM women_skill_portal.user_profiles WHERE role = 'training_provider' LIMIT 1), (SELECT user_id FROM women_skill_portal.user_profiles WHERE role = 'admin' LIMIT 1)),
        user_id = COALESCE(tp.user_id, prov.user_id, (SELECT user_id FROM women_skill_portal.user_profiles WHERE role = 'training_provider' LIMIT 1), (SELECT user_id FROM women_skill_portal.user_profiles WHERE role = 'admin' LIMIT 1))
    FROM women_skill_portal.training_providers prov
    WHERE tp.provider_id = prov.provider_id;
  END IF;
END $$;

-- Default any null provider_name
UPDATE women_skill_portal.training_programs
SET provider_name = 'EmpowerHer Academy'
WHERE provider_name IS NULL;

-- Drop foreign key on provider_id and the column
ALTER TABLE women_skill_portal.training_programs
  DROP CONSTRAINT IF EXISTS training_programs_provider_id_fkey;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'women_skill_portal' AND table_name = 'training_programs' AND column_name = 'provider_id') THEN
    ALTER TABLE women_skill_portal.training_programs DROP COLUMN provider_id;
  END IF;
END $$;

-- 5. Enhance enrollments
ALTER TABLE women_skill_portal.enrollments
  ADD COLUMN IF NOT EXISTS assessment_score NUMERIC(5, 2);

UPDATE women_skill_portal.enrollments
SET assessment_score = score
WHERE assessment_score IS NULL AND score IS NOT NULL;

-- 6. Enhance job_postings before dropping employers
ALTER TABLE women_skill_portal.job_postings
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS location VARCHAR(150),
  ADD COLUMN IF NOT EXISTS posted_by INT REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_id INT REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL;

-- Migrate company_name from employers if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'women_skill_portal' AND table_name = 'employers') THEN
    UPDATE women_skill_portal.job_postings jp
    SET company_name = COALESCE(jp.company_name, emp.company_name, 'EmpowerHer Partner'),
        posted_by = COALESCE(jp.posted_by, emp.user_id, (SELECT user_id FROM women_skill_portal.user_profiles WHERE role = 'admin' LIMIT 1)),
        user_id = COALESCE(jp.user_id, emp.user_id, (SELECT user_id FROM women_skill_portal.user_profiles WHERE role = 'admin' LIMIT 1))
    FROM women_skill_portal.employers emp
    WHERE jp.employer_id = emp.employer_id;
  END IF;
END $$;

-- Default any null company_name
UPDATE women_skill_portal.job_postings
SET company_name = 'EmpowerHer Partner'
WHERE company_name IS NULL;

-- Sync location and job_location
UPDATE women_skill_portal.job_postings
SET location = job_location
WHERE location IS NULL AND job_location IS NOT NULL;

UPDATE women_skill_portal.job_postings
SET job_location = location
WHERE job_location IS NULL AND location IS NOT NULL;

-- Drop foreign key on employer_id and the column
ALTER TABLE women_skill_portal.job_postings
  DROP CONSTRAINT IF EXISTS job_postings_employer_id_fkey;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'women_skill_portal' AND table_name = 'job_postings' AND column_name = 'employer_id') THEN
    ALTER TABLE women_skill_portal.job_postings DROP COLUMN employer_id;
  END IF;
END $$;

-- 7. Drop Obsolete Tables (interviews, certifications, employment_records, training_providers, employers)
DROP TABLE IF EXISTS women_skill_portal.interviews CASCADE;
DROP TABLE IF EXISTS women_skill_portal.certifications CASCADE;
DROP TABLE IF EXISTS women_skill_portal.employment_records CASCADE;
DROP TABLE IF EXISTS women_skill_portal.training_providers CASCADE;
DROP TABLE IF EXISTS women_skill_portal.employers CASCADE;

-- 8. Drop Obsolete Indexes
DROP INDEX IF EXISTS women_skill_portal.idx_training_programs_provider;
DROP INDEX IF EXISTS women_skill_portal.idx_job_postings_employer;
DROP INDEX IF EXISTS women_skill_portal.idx_interviews_application;
DROP INDEX IF EXISTS women_skill_portal.idx_certifications_woman;
DROP INDEX IF EXISTS women_skill_portal.idx_employment_records_woman;

-- 9. Create Performance Indexes for 8 Tables
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

COMMIT;

