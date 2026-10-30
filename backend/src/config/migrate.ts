import bcrypt from 'bcryptjs';
import { pool } from './database';

async function migrate() {
  console.log('--- Starting Safe Schema Migration for women_skill_portal ---');

  try {
    // 1. Create user_profiles if missing
    console.log('1. Ensuring user_profiles table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS women_skill_portal.user_profiles (
          user_id SERIAL PRIMARY KEY,
          auth_id VARCHAR(255) UNIQUE,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          role VARCHAR(50) NOT NULL CHECK (role IN ('woman', 'training_provider', 'employer', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Add missing columns to women table
    console.log('2. Updating women table...');
    await pool.query(`
      ALTER TABLE women_skill_portal.women
        ADD COLUMN IF NOT EXISTS user_id INT UNIQUE REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);

    // 3. Add missing columns to training_providers
    console.log('3. Updating training_providers table...');
    await pool.query(`
      ALTER TABLE women_skill_portal.training_providers
        ADD COLUMN IF NOT EXISTS user_id INT UNIQUE REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS website VARCHAR(255),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);

    // 4. Add missing columns to training_programs (Fixes: column tp.category does not exist)
    console.log('4. Updating training_programs table...');
    await pool.query(`
      ALTER TABLE women_skill_portal.training_programs
        ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Software Development',
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS mode VARCHAR(50) DEFAULT 'Online',
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active',
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      UPDATE women_skill_portal.training_programs
      SET category = 'Software Development'
      WHERE category IS NULL;

      UPDATE women_skill_portal.training_programs
      SET status = 'Active'
      WHERE status IS NULL;
    `);

    // 5. Add missing columns to employers
    console.log('5. Updating employers table...');
    await pool.query(`
      ALTER TABLE women_skill_portal.employers
        ADD COLUMN IF NOT EXISTS user_id INT UNIQUE REFERENCES women_skill_portal.user_profiles(user_id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS website VARCHAR(255),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);

    // 6. Add missing columns to job_postings (Fixes: column jp.deadline & jp.status do not exist)
    console.log('6. Updating job_postings table...');
    await pool.query(`
      ALTER TABLE women_skill_portal.job_postings
        ADD COLUMN IF NOT EXISTS deadline DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Open',
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      UPDATE women_skill_portal.job_postings
      SET status = 'Open'
      WHERE status IS NULL;

      UPDATE women_skill_portal.job_postings
      SET deadline = CURRENT_DATE + INTERVAL '30 days'
      WHERE deadline IS NULL;
    `);

    // 7. Add missing columns to enrollments
    console.log('7. Updating enrollments table...');
    await pool.query(`
      ALTER TABLE women_skill_portal.enrollments
        ADD COLUMN IF NOT EXISTS completion_date DATE,
        ADD COLUMN IF NOT EXISTS score NUMERIC(5, 2);
    `);

    // 8. Add missing columns to job_applications
    console.log('8. Updating job_applications table...');
    await pool.query(`
      ALTER TABLE women_skill_portal.job_applications
        ADD COLUMN IF NOT EXISTS cover_note TEXT;
    `);

    // 9. Add missing columns to interviews
    console.log('9. Updating interviews table...');
    await pool.query(`
      ALTER TABLE women_skill_portal.interviews
        ADD COLUMN IF NOT EXISTS location_or_link TEXT,
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS feedback TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);

    // 10. Add missing columns to certifications
    console.log('10. Updating certifications table...');
    await pool.query(`
      ALTER TABLE women_skill_portal.certifications
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);

    // 11. Add missing columns to skills and women_skills
    console.log('11. Updating skills and women_skills tables...');
    await pool.query(`
      ALTER TABLE women_skill_portal.skills
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE women_skill_portal.women_skills
        ADD COLUMN IF NOT EXISTS years_experience NUMERIC(3, 1) DEFAULT 0.0,
        ADD COLUMN IF NOT EXISTS added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);

    // 12. Create employment_records if missing
    console.log('12. Ensuring employment_records table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS women_skill_portal.employment_records (
          employment_id SERIAL PRIMARY KEY,
          woman_id INT NOT NULL REFERENCES women_skill_portal.women(woman_id) ON DELETE CASCADE,
          job_id INT NOT NULL REFERENCES women_skill_portal.job_postings(job_id) ON DELETE CASCADE,
          joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
          salary NUMERIC(12, 2) CHECK (salary >= 0),
          employment_status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (employment_status IN ('Active', 'Probation', 'Resigned', 'Terminated')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 13. Grant Permissions for Supabase Roles
    console.log('13. Refreshing permissions on schema women_skill_portal...');
    await pool.query(`
      GRANT USAGE ON SCHEMA women_skill_portal TO postgres, anon, authenticated, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA women_skill_portal TO postgres, anon, authenticated, service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA women_skill_portal TO postgres, anon, authenticated, service_role;
      GRANT ALL ON ALL ROUTINES IN SCHEMA women_skill_portal TO postgres, anon, authenticated, service_role;
    `);

    // 14. Seed Default Evaluation Users in user_profiles
    console.log('14. Seeding default demo authentication users...');
    const defaultPasswordHash = await bcrypt.hash('SecurePass@2025', 10);

    const demoUsers = [
      { email: 'priya.sharma@empowerher.org', role: 'woman' },
      { email: 'priya.sharma@example.com', role: 'woman' },
      { email: 'recruiter@starlightsoftware.com', role: 'employer' },
      { email: 'director@techbridge.edu', role: 'training_provider' },
      { email: 'admin@empowerher.org', role: 'admin' },
      { email: 'superadmin@empowerher.org', role: 'admin' },
    ];

    for (const u of demoUsers) {
      const res = await pool.query(
        `INSERT INTO women_skill_portal.user_profiles (email, password_hash, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE 
         SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
         RETURNING user_id, email, role;`,
        [u.email, defaultPasswordHash, u.role]
      );
      const userId = res.rows[0]?.user_id;

      // Link candidate woman if matching
      if (u.role === 'woman') {
        await pool.query(
          `UPDATE women_skill_portal.women
           SET user_id = $1
           WHERE (email = $2 OR full_name ILIKE '%Priya%') AND user_id IS NULL`,
          [userId, u.email]
        );
      } else if (u.role === 'employer') {
        await pool.query(
          `UPDATE women_skill_portal.employers
           SET user_id = $1
           WHERE employer_id = (SELECT employer_id FROM women_skill_portal.employers WHERE user_id IS NULL LIMIT 1)`,
          [userId]
        );
      } else if (u.role === 'training_provider') {
        await pool.query(
          `UPDATE women_skill_portal.training_providers
           SET user_id = $1
           WHERE provider_id = (SELECT provider_id FROM women_skill_portal.training_providers WHERE user_id IS NULL LIMIT 1)`,
          [userId]
        );
      }
    }

    console.log('✅ Migration completed successfully! All columns, tables, and demo credentials are ready.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
