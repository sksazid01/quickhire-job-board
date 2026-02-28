import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { initializeDatabase, pool } from "./db.js";
import {
  validateApplicationPayload,
  validateJobPayload,
} from "./validation.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
  })
);
app.use(express.json());

app.get("/api/health", async (_request, response) => {
  await pool.query("SELECT 1");
  response.json({ ok: true });
});

app.get("/api/jobs", async (request, response) => {
  const search = request.query.search?.toString().trim() || "";
  const category = request.query.category?.toString().trim() || "";
  const location = request.query.location?.toString().trim() || "";

  const filters = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    filters.push(
      `(title ILIKE $${values.length} OR company ILIKE $${values.length} OR description ILIKE $${values.length})`
    );
  }

  if (category) {
    values.push(category);
    filters.push(`category = $${values.length}`);
  }

  if (location) {
    values.push(location);
    filters.push(`location = $${values.length}`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const query = `
    SELECT
      jobs.*,
      COUNT(applications.id)::int AS application_count
    FROM jobs
    LEFT JOIN applications ON applications.job_id = jobs.id
    ${whereClause}
    GROUP BY jobs.id
    ORDER BY jobs.created_at DESC
  `;

  const { rows } = await pool.query(query, values);
  response.json(rows);
});

app.get("/api/jobs/meta", async (_request, response) => {
  const [categoriesResult, locationsResult] = await Promise.all([
    pool.query("SELECT DISTINCT category FROM jobs ORDER BY category ASC"),
    pool.query("SELECT DISTINCT location FROM jobs ORDER BY location ASC"),
  ]);

  response.json({
    categories: categoriesResult.rows.map((item) => item.category),
    locations: locationsResult.rows.map((item) => item.location),
  });
});

app.get("/api/jobs/:id", async (request, response) => {
  const id = Number(request.params.id);

  if (!Number.isInteger(id)) {
    return response.status(400).json({ message: "Invalid job id." });
  }

  const { rows } = await pool.query(
    `
      SELECT
        jobs.*,
        COUNT(applications.id)::int AS application_count
      FROM jobs
      LEFT JOIN applications ON applications.job_id = jobs.id
      WHERE jobs.id = $1
      GROUP BY jobs.id
    `,
    [id]
  );

  if (!rows[0]) {
    return response.status(404).json({ message: "Job not found." });
  }

  return response.json(rows[0]);
});

app.post("/api/jobs", async (request, response) => {
  const validation = validateJobPayload(request.body);

  if (!validation.isValid) {
    return response.status(400).json({
      message: "Invalid job payload.",
      errors: validation.errors,
    });
  }

  const { title, company, location, category, description, employment_type, salary_range } =
    request.body;

  const { rows } = await pool.query(
    `
      INSERT INTO jobs (
        title,
        company,
        location,
        category,
        description,
        employment_type,
        salary_range
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      title.trim(),
      company.trim(),
      location.trim(),
      category.trim(),
      description.trim(),
      employment_type.trim(),
      salary_range.trim(),
    ]
  );

  return response.status(201).json({
    ...rows[0],
    application_count: 0,
  });
});

app.delete("/api/jobs/:id", async (request, response) => {
  const id = Number(request.params.id);

  if (!Number.isInteger(id)) {
    return response.status(400).json({ message: "Invalid job id." });
  }

  const { rowCount } = await pool.query("DELETE FROM jobs WHERE id = $1", [id]);

  if (rowCount === 0) {
    return response.status(404).json({ message: "Job not found." });
  }

  return response.status(204).send();
});

app.post("/api/applications", async (request, response) => {
  const jobId = Number(request.body.job_id);

  if (!Number.isInteger(jobId)) {
    return response.status(400).json({ message: "Valid job_id is required." });
  }

  const validation = validateApplicationPayload(request.body);

  if (!validation.isValid) {
    return response.status(400).json({
      message: "Invalid application payload.",
      errors: validation.errors,
    });
  }

  const jobExists = await pool.query("SELECT id FROM jobs WHERE id = $1", [jobId]);

  if (!jobExists.rows[0]) {
    return response.status(404).json({ message: "Job not found." });
  }

  const { name, email, resume_link, cover_note } = request.body;

  const { rows } = await pool.query(
    `
      INSERT INTO applications (
        job_id,
        name,
        email,
        resume_link,
        cover_note
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [jobId, name.trim(), email.trim(), resume_link.trim(), cover_note.trim()]
  );

  return response.status(201).json(rows[0]);
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    message: "Internal server error.",
  });
});

async function startServer() {
  await initializeDatabase();

  app.listen(config.port, () => {
    console.log(`QuickHire API running on http://localhost:${config.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start QuickHire API.", error);
  process.exit(1);
});
