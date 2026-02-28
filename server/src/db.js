import pg from "pg";
import { config } from "./config.js";
import { sampleJobs } from "./sample-data.js";

const { Pool } = pg;
const databaseUrl = new URL(config.databaseUrl);

databaseUrl.searchParams.delete("sslmode");

export const pool = new Pool({
  connectionString: databaseUrl.toString(),
  ssl: { rejectUnauthorized: false },
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      employment_type TEXT NOT NULL,
      salary_range TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      resume_link TEXT NOT NULL,
      cover_note TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM jobs");

  if (rows[0].count > 0) {
    return;
  }

  const insertQuery = `
    INSERT INTO jobs (
      title,
      company,
      location,
      category,
      description,
      employment_type,
      salary_range
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  for (const job of sampleJobs) {
    await pool.query(insertQuery, [
      job.title,
      job.company,
      job.location,
      job.category,
      job.description,
      job.employment_type,
      job.salary_range,
    ]);
  }
}
