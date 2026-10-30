import { pool } from './database';

async function seed() {
  console.log('--- Checking & Seeding Sample Programs & Jobs ---');
  try {
    // Expand phone column length if needed
    await pool.query(`
      ALTER TABLE women_skill_portal.training_providers ALTER COLUMN phone TYPE VARCHAR(30);
      ALTER TABLE women_skill_portal.employers ALTER COLUMN phone TYPE VARCHAR(30);
      ALTER TABLE women_skill_portal.women ALTER COLUMN phone TYPE VARCHAR(30);
    `);

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

    // 2. Training Providers
    await pool.query(`
      INSERT INTO women_skill_portal.training_providers (provider_name, email, phone, address, website)
      VALUES 
          ('TechBridge Academy', 'info@techbridge.edu', '+1-555-019-2834', '100 Innovation Way, San Francisco, CA', 'https://techbridge.edu'),
          ('Pragati Skill Institute', 'contact@pragatiskills.in', '+91-9123456780', 'Shivajinagar, Pune, Maharashtra', 'https://pragatiskills.in'),
          ('CloudScale Institute', 'support@cloudscale.org', '+1-555-482-9102', 'Austin, TX', 'https://cloudscale.org')
      ON CONFLICT (email) DO NOTHING;
    `);

    // 3. Training Programs
    const prov = await pool.query(`SELECT provider_id FROM women_skill_portal.training_providers LIMIT 1;`);
    const provId = prov.rows[0]?.provider_id || 1;

    await pool.query(`
      INSERT INTO women_skill_portal.training_programs (provider_id, program_name, category, duration_weeks, course_fee, description, mode, status)
      VALUES 
          (${provId}, 'Frontend to Full-Stack Engineering Fellowship', 'Software Development', 16, 0.00, 'Comprehensive React, Next.js, Node.js, and Supabase PostgreSQL architecture.', 'Online', 'Active'),
          (${provId}, 'Data Analytics & Business Intelligence Accelerator', 'Data Science', 12, 0.00, 'Hands-on querying with PostgreSQL, Python dataframes, and executive reporting.', 'Online', 'Active'),
          (${provId}, 'Human-Centered UI/UX Design & Product Systems', 'Design', 10, 0.00, 'Design tokens, Figma component systems, usability heuristics, and portfolio mentoring.', 'Hybrid', 'Active'),
          (${provId}, 'Cloud Architecture & DevOps Foundations', 'Cloud Computing', 14, 0.00, 'Docker containerization, CI/CD pipelines, and enterprise AWS deployments.', 'Online', 'Active')
      ON CONFLICT DO NOTHING;
    `);

    // 4. Employers
    await pool.query(`
      INSERT INTO women_skill_portal.employers (company_name, industry, email, phone, address, website)
      VALUES 
          ('Starlight Software Inc.', 'Software & Technology', 'careers@starlightsoftware.com', '+1-555-782-9901', 'Remote / Seattle, WA', 'https://starlightsoftware.com'),
          ('Nexus Financial Group', 'FinTech & Banking', 'recruiting@nexusfinance.com', '+1-555-349-1102', 'New York, NY', 'https://nexusfinance.com'),
          ('Vanguard Health Tech', 'Healthcare Technology', 'talent@vanguardhealth.com', '+1-555-621-4820', 'Boston, MA', 'https://vanguardhealth.com')
      ON CONFLICT (email) DO NOTHING;
    `);

    // 5. Job Postings
    const emp = await pool.query(`SELECT employer_id FROM women_skill_portal.employers LIMIT 1;`);
    const empId = emp.rows[0]?.employer_id || 1;

    await pool.query(`
      INSERT INTO women_skill_portal.job_postings (employer_id, job_title, job_description, salary, job_location, employment_type, deadline, status)
      VALUES 
          (${empId}, 'Associate Frontend Engineer (React/Next.js)', 'Join our product team to build accessible, high-performance web applications using modern JavaScript.', 82000.00, 'Remote (US/Canada)', 'Full-Time', CURRENT_DATE + INTERVAL '45 days', 'Open'),
          (${empId}, 'Junior Data Analyst (SQL & BI)', 'Work closely with data engineers and product managers to extract insights and build SQL data models.', 75000.00, 'Hybrid (New York, NY)', 'Full-Time', CURRENT_DATE + INTERVAL '30 days', 'Open'),
          (${empId}, 'Associate Product Designer (UI/UX)', 'Design user journeys, interaction patterns, and design system components in Figma for consumer products.', 88000.00, 'Remote (Global)', 'Full-Time', CURRENT_DATE + INTERVAL '30 days', 'Open'),
          (${empId}, 'Junior Cloud Operations Associate', 'Support infrastructure deployments, automated testing, and CI/CD operations.', 80000.00, 'Remote', 'Full-Time', CURRENT_DATE + INTERVAL '60 days', 'Open')
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
