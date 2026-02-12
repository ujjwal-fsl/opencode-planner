const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL is missing in environment variables.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get executed migrations
    const { rows: executedMigrations } = await client.query('SELECT filename FROM migrations');
    const executedFilenames = new Set(executedMigrations.map(row => row.filename));

    // Get all migration files
    const updateFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure order

    for (const file of updateFiles) {
      if (!executedFilenames.has(file)) {
        console.log(`🚀 Checking migration: ${file}`);
        
        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        try {
            // STRICT FIX:
            // Since we are adopting an existing DB, we must assume previous migrations (001-007) are already applied.
            // We will attempt to run them, but if they fail due to "relation already exists", we will mark them as applied and continue.
            // Only 008 should be new.
            
            await client.query('BEGIN');
            
            // Check if this is a legacy migration (001-007) that might already exist
            // Heuristic: If it fails with 42P07 (duplicate_table) or similar, we mark it as done.
            try {
                await client.query(sql);
                await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log(`✅ Successfully applied: ${file}`);
            } catch (innerErr) {
                await client.query('ROLLBACK');
                
                // If error is "relation already exists" (42P07) or "type already exists" (42710)
                // We assume this migration was already run in the past but not tracked.
                if (innerErr.code === '42P07' || innerErr.code === '42710') {
                     console.log(`⚠️  Migration ${file} failed but looks like it was already applied (Error: ${innerErr.code}). Marking as skipped/applied.`);
                     await client.query('INSERT INTO migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [file]);
                } else {
                    throw innerErr; // Rethrow genuine errors
                }
            }

        } catch (err) {
          console.error(`❌ Failed to apply migration: ${file}`);
          throw err;
        }
      } else {
        console.log(`⏭️  Skipping migration (already executed): ${file}`);
      }
    }

    console.log('✨ All migrations completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
