import fs from 'fs';
import path from 'path';
import { pool } from './database';

async function migrate() {
  console.log('--- Starting Schema Migration for 8-Table Architecture ---');

  try {
    const migrationSqlPath = path.join(__dirname, 'migration_8_tables.sql');
    if (fs.existsSync(migrationSqlPath)) {
      const sql = fs.readFileSync(migrationSqlPath, 'utf8');
      await pool.query(sql);
      console.log('Successfully executed migration_8_tables.sql.');
    } else {
      const schemaSqlPath = path.join(__dirname, 'schema.sql');
      const sql = fs.readFileSync(schemaSqlPath, 'utf8');
      await pool.query(sql);
      console.log('Successfully applied schema.sql.');
    }

    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'women_skill_portal'
      ORDER BY table_name;
    `);

    console.log('Tables present in women_skill_portal schema:');
    console.log(res.rows.map((r: any) => r.table_name));

    await pool.end();
  } catch (err: any) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
