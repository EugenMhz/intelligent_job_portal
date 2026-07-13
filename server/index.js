const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Verify connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to local PostgreSQL database!');
});

/* ==========================================================================
   API ROUTES
   ========================================================================== */

// 1. Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT j.*, 
             COALESCE(COUNT(a.id), 0)::integer AS "applicantsCount"
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      GROUP BY j.id
      ORDER BY j.posted_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 2. Post a new job
app.post('/api/jobs', async (req, res) => {
  const { recruiter_id, title, department, location, description, status, skills } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert job details
    const insertJobQuery = `
      INSERT INTO jobs (recruiter_id, title, department, location, status, description)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const jobResult = await client.query(insertJobQuery, [
      recruiter_id || 6, // default to jane doe recruiter if not specified
      title,
      department,
      location,
      status || 'Active',
      description
    ]);
    const job = jobResult.rows[0];

    // Link skills
    if (skills && skills.length > 0) {
      for (const skillName of skills) {
        // Find or create skill in skills master table
        let skillResult = await client.query('SELECT id FROM skills WHERE name = $1', [skillName]);
        let skillId;
        
        if (skillResult.rows.length === 0) {
          const insertSkillResult = await client.query('INSERT INTO skills (name) VALUES ($1) RETURNING id', [skillName]);
          skillId = insertSkillResult.rows[0].id;
        } else {
          skillId = skillResult.rows[0].id;
        }

        // Link skill to job
        await client.query('INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [job.id, skillId]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json(job);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating job posting:', err);
    res.status(500).json({ error: 'Failed to create job posting' });
  } finally {
    client.release();
  }
});

// 3. Get applicants list for a job
app.get('/api/applicants', async (req, res) => {
  const { jobId } = req.query;
  try {
    let query = `
      SELECT 
        a.id, 
        jp.full_name AS name, 
        jp.title AS role, 
        COALESCE(rp.department, 'Creative Flow') AS company, -- mock company or mapping
        a.match_score AS "matchScore",
        a.status,
        a.method,
        jp.education,
        a.job_id AS "jobId",
        jp.resume_url AS "resumeUrl",
        ARRAY(
          SELECT s.name 
          FROM jobseeker_skills jsk
          JOIN skills s ON jsk.skill_id = s.id
          WHERE jsk.jobseeker_id = a.jobseeker_id
        ) AS skills,
        jp.title AS "experienceLevel"
      FROM applications a
      JOIN jobseeker_profiles jp ON a.jobseeker_id = jp.user_id
      LEFT JOIN users u ON a.jobseeker_id = u.id
      LEFT JOIN recruiter_profiles rp ON u.id = rp.user_id
    `;
    
    let queryParams = [];
    if (jobId) {
      query += ` WHERE a.job_id = $1`;
      queryParams.push(jobId);
    }
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching applicants:', err);
    res.status(500).json({ error: 'Failed to fetch applicants list' });
  }
});

// 4. Update applicant status (Shortlist, Interviewing, Rejected)
app.patch('/api/applicants/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// 5. Get Recruiter profile details
app.get('/api/recruiters/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM recruiter_profiles WHERE user_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recruiter profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching recruiter profile:', err);
    res.status(500).json({ error: 'Failed to query recruiter profile' });
  }
});

// 6. Update Recruiter profile details
app.put('/api/recruiters/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, phone, department, location, bio } = req.body;
  try {
    const query = `
      INSERT INTO recruiter_profiles (user_id, full_name, title, phone, department, location, bio, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        title = EXCLUDED.title,
        phone = EXCLUDED.phone,
        department = EXCLUDED.department,
        location = EXCLUDED.location,
        bio = EXCLUDED.bio,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`;
    const result = await pool.query(query, [id, name, role, phone, department, location, bio]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating recruiter profile:', err);
    res.status(500).json({ error: 'Failed to update recruiter profile' });
  }
});

// Start Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server successfully running on port ${PORT}`);
});
