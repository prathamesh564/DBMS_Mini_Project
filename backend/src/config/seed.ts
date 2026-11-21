import { pool } from './database';

async function seed() {
  console.log('--- Checking & Seeding Sample Programs & Jobs (8-Table Architecture) ---');
  try {
    // 1. Skills
    await pool.query(`
      INSERT INTO women_skill_portal.skills (skill_name, category, description)
      VALUES 
          ('Python Programming', 'Information Technology', 'Core Python, data structures, and automation scripting.'),
          ('Web Development (React & Node.js)', 'Software Development', 'Building dynamic modern responsive web applications.'),
          ('Data Analysis with SQL & Excel', 'Data Science', 'Relational database queries, data cleaning, and spreadsheet modeling.'),
          ('UI/UX Design with Figma', 'Creative & Design', 'Wireframing, high-fidelity prototypes, and user research.'),
          ('Digital Marketing & SEO', 'Business & Marketing', 'Search engine optimization, social media strategy, and analytics.'),
          ('Financial Accounting', 'Finance', 'Bookkeeping, balance sheets, and GST compliance.')
      ON CONFLICT (skill_name) DO NOTHING;
    `);

    // 2. Training Programs (with provider_name directly)
    await pool.query(`
      INSERT INTO women_skill_portal.training_programs (program_name, category, duration_weeks, course_fee, description, mode, status, provider_name)
      VALUES 
          ('Frontend to Full-Stack Engineering Fellowship', 'Software Development', 16, 0.00, 'Comprehensive React, Next.js, Node.js, and Supabase PostgreSQL architecture.', 'Online', 'Active', 'TechBridge Academy'),
          ('Data Analytics & Business Intelligence Accelerator', 'Data Science', 12, 0.00, 'Hands-on querying with PostgreSQL, Python dataframes, and executive reporting.', 'Online', 'Active', 'Pragati Skill Institute'),
          ('Human-Centered UI/UX Design & Product Systems', 'Design', 10, 0.00, 'Design tokens, Figma component systems, usability heuristics, and portfolio mentoring.', 'Hybrid', 'Active', 'DesignLead Academy'),
          ('Cloud Architecture & DevOps Foundations', 'Cloud Computing', 14, 0.00, 'Docker containerization, CI/CD pipelines, and enterprise AWS deployments.', 'Online', 'Active', 'CloudScale Institute')
      ON CONFLICT DO NOTHING;
    `);

    // 3. Job Postings (with company_name directly)
    await pool.query(`
      INSERT INTO women_skill_portal.job_postings (job_title, job_description, salary, location, job_location, employment_type, deadline, status, company_name)
      VALUES 
          ('Associate Frontend Engineer (React/Next.js)', 'Join our product team to build accessible, high-performance web applications using modern JavaScript.', 82000.00, 'Remote (US/Canada)', 'Remote (US/Canada)', 'Full-Time', CURRENT_DATE + INTERVAL '45 days', 'Open', 'Starlight Software Inc.'),
          ('Junior Data Analyst (SQL & BI)', 'Work closely with data engineers and product managers to extract insights and build SQL data models.', 75000.00, 'Hybrid (New York, NY)', 'Hybrid (New York, NY)', 'Full-Time', CURRENT_DATE + INTERVAL '30 days', 'Open', 'Nexus Financial Group'),
          ('Associate Product Designer (UI/UX)', 'Design user journeys, interaction patterns, and design system components in Figma for consumer products.', 88000.00, 'Remote (Global)', 'Remote (Global)', 'Full-Time', CURRENT_DATE + INTERVAL '30 days', 'Open', 'Vanguard Health Tech'),
          ('Junior Cloud Operations Associate', 'Support infrastructure deployments, automated testing, and CI/CD operations.', 80000.00, 'Remote', 'Remote', 'Full-Time', CURRENT_DATE + INTERVAL '60 days', 'Open', 'Starlight Software Inc.')
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Sample data seeded successfully into PostgreSQL!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await pool.end();
  }
}

seed();
