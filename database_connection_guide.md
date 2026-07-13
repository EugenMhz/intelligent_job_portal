# PostgreSQL Connection and Integration Guide

This guide explains how to connect and integrate the PostgreSQL database with your Vite React frontend portal. Because React runs directly in the user's browser, it cannot connect directly to PostgreSQL. Instead, you need a **Backend API Server** to act as a bridge.

---

## Step 1: Set Up & Seed Your Local PostgreSQL Database

First, create the database and import the schema and seed scripts we created.

### Using Command Line (psql)
Run the following commands in your terminal (make sure PostgreSQL is installed and added to your system path):

```bash
# 1. Create the database
createdb -U postgres intelligent_job_portal

# 2. Import the schema (tables, triggers, indexes)
psql -U postgres -d intelligent_job_portal -f database/schema.sql

# 3. Load seed mock data
psql -U postgres -d intelligent_job_portal -f database/seed.sql
```

### Using pgAdmin (GUI)
1. Open **pgAdmin** and connect to your server.
2. Right-click on **Databases** &rarr; select **Create** &rarr; **Database...** &rarr; name it `intelligent_job_portal`.
3. Select the new database, click **Tools** in the top menu &rarr; **Query Tool**.
4. Open and run the contents of [schema.sql](file:///c:/Users/lenovo/Desktop/Intelligent%20Job%20Portal/intelligent_job_portal-main/database/schema.sql), then open and run [seed.sql](file:///c:/Users/lenovo/Desktop/Intelligent%20Job%20Portal/intelligent_job_portal-main/database/seed.sql).

---

## Step 2: Create a Backend API Server (Node.js + Express)

To connect React to the database, build a simple API server.

### 1. Initialize Backend
Create a new directory in your project root called `server/`, initialize it, and install required libraries:

```bash
mkdir server
cd server
npm init -y
npm install express pg cors dotenv
```

### 2. Configure Environment Variables
Create a file named `.env` in the `server/` directory:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=intelligent_job_portal
```

### 3. Implement the Server (`server/index.js`)
Create a file named `index.js` inside the `server/` directory:

```javascript
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test DB Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database!');
});

// Sample Route: Get Active Jobs Listings
app.get('/api/jobs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs WHERE status = $1 ORDER BY posted_date DESC', ['Active']);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Sample Route: Create a Job Posting
app.post('/api/jobs', async (req, res) => {
  const { recruiter_id, title, department, location, description } = req.body;
  try {
    const query = `
      INSERT INTO jobs (recruiter_id, title, department, location, status, description)
      VALUES ($1, $2, $3, $4, 'Active', $5) RETURNING *`;
    const result = await pool.query(query, [recruiter_id, title, department, location, description]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create job posting' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

---

## Step 3: Fetch Data in Your React Frontend

Inside your React components (e.g. `DashboardOverview.jsx` or `Job.jsx`), replace your hardcoded state values with API fetches.

### Example React Fetch Integration
```javascript
import React, { useState, useEffect } from 'react';

function DashboardOverview() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from backend API server
    fetch('http://localhost:5000/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching jobs:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div>Loading jobs...</div>;

  return (
    <div>
      {/* Map jobs records as cards */}
      {jobs.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```
