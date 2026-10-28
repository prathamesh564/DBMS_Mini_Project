const fs = require('fs');
const path = require('path');
const { pool } = require('./database');

async function run() {
  console.log('--- Initializing Women Skill Development & Employment Portal Database ---');
  try {
    const schemaFile = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaFile, 'utf8');

    console.log('Executing schema definition...');
    await pool.query(sql);

    console.log('Schema `women_skill_portal` and all 12 tables created successfully!');
  } catch (err) {
    console.error('Error initializing schema:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
