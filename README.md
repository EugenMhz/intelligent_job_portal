# 🚀 Intelligent Job Portal

A full-stack intelligent job portal that connects **job seekers** and **recruiters** through a modern, database-driven web application. Built with **React + Vite** on the frontend and **Flask + PostgreSQL** on the backend.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Authentication](#authentication)
  - [Recruiter Portal](#recruiter-portal)
  - [Job Seeker Portal](#job-seeker-portal)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Branch Info](#branch-info)

---

## Overview

The Intelligent Job Portal is a role-based web application that allows:

- **Recruiters** to post job opportunities, manage applicants, track hiring stages, and maintain their profiles.
- **Job Seekers** to browse jobs, apply, track applications, and manage their profile.

All data is persisted in a **PostgreSQL** database, and the system enforces recruiter-level data isolation (each recruiter only sees their own postings and applicants).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 8, React Router v6 |
| Styling | Vanilla CSS + utility classes |
| Icons | Lucide React |
| Backend | Python Flask |
| Database | PostgreSQL |
| DB Driver | psycopg2 |
| CORS | Flask-CORS |
| Environment | python-dotenv |

---

## Features

### Authentication

- **Signup** — Role selection (Recruiter / Job Seeker), full name, email, password. Email is stored and matched case-insensitively (`LOWER(email)`).
- **Login** — Validates credentials against PostgreSQL `users` table. Returns user session stored in `localStorage`.
- **Logout** — Confirmation popup before clearing session.
- **Change Password** — Verifies current password against DB, updates to new password on success.

---

### Recruiter Portal

#### 🗂 Dashboard
- **Stats cards** — Total Jobs Posted, Active Applicants, Recent Hires — all fetched from DB.
- **Recent Job Postings table** — Shows job title, status, posted date (from `posted_date` DB column), and applicant count.
- **View Details modal** — Inline job detail overlay on dashboard.
- **Edit Job modal** — Inline editing of job title, department, location, status, and description — updates via `PUT /api/jobs/:id`.
- **View All Postings** — Redirects to Job Management → Active Postings → All Jobs tab.

#### 📝 Job Posting Management
- **Create New Posting tab** — Form with job title, department, location, description, and required skills.
- **Save as Draft** — Checkbox above submit button. Draft jobs are saved with `status = 'Draft'` and hidden from Active view.
- **Active Postings tab** — Inline table listing all jobs with filter toggle:
  - **Active Jobs Only** — shows only `status = 'Active'` jobs.
  - **All Jobs** — shows active + draft jobs.
- "Archived" option removed.

#### 👥 Applicant Management
- Lists all candidates for the recruiter's jobs, filtered by `recruiterId`.
- **Min. Match Score** slider filter.
- Tabs: All / Shortlisted / Interviewing.
- Sort by: Highest Match, Most Recent, A–Z.
- Shortlist / Un-shortlist toggle updates DB.
- View Applicant Details page with full profile.

#### 👤 Recruiter Profile
- Pulls user data from DB on page load.
- Edit profile (name, title, company, location, phone, bio) — saved via `PUT /api/recruiter/profile`.
- **Sidebar stats** — Active Jobs, Total Applicants, Response Rate — computed dynamically from DB.
- **Logout confirmation popup**.

#### 🔒 Change Password
- Verifies old password against DB before updating.

---

### Job Seeker Portal

- Dashboard, Jobs listing, Job Description, Applications tracker, Saved Jobs (Bookmarks).
- Profile page with **logout confirmation popup**.
- Navbar with search, profile avatar, and nav links — logo on far left, all other items aligned right.

---

## Project Structure

```
intelligent_job_portal/
├── database/
│   ├── schema.sql          # PostgreSQL table definitions
│   └── seed.sql            # Sample seed data
├── flask_server/
│   └── app.py              # Flask REST API server
├── server/
│   └── index.js            # (Legacy Node server — not used in current stack)
├── src/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── signup.jsx
│   ├── pages/
│   │   ├── recruiter/
│   │   │   ├── RecruiterShell.jsx        # Route shell + data fetching
│   │   │   ├── RecruiterNavbar.jsx       # Recruiter navbar (no search)
│   │   │   ├── DashboardOverview.jsx     # Dashboard stats + job table
│   │   │   ├── JobPostingManagement.jsx  # Create + manage job postings
│   │   │   ├── ApplicantManagement.jsx   # Applicant list + filters
│   │   │   ├── ApplicantDetails.jsx      # Individual applicant view
│   │   │   ├── Profile.jsx               # Recruiter profile + logout popup
│   │   │   └── ChangePasswordAdmin.jsx   # Change password with DB verify
│   │   └── jobseeker/
│   │       ├── Navbar.jsx
│   │       ├── Profile.jsx               # Logout confirmation popup
│   │       ├── Job.jsx
│   │       ├── JobDescription.jsx
│   │       ├── Application.jsx
│   │       ├── Bookmark.jsx
│   │       └── Jobseeker Dashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## Database Schema

Key tables in PostgreSQL (`intelligent_job_portal` database):

| Table | Description |
|---|---|
| `users` | All users (recruiters + job seekers) with `role`, `email`, `password_hash` |
| `recruiter_profiles` | Extended recruiter info (company, title, location, bio, phone) |
| `jobseeker_profiles` | Extended job seeker info |
| `jobs` | Job postings with `recruiter_id`, `status` (Active/Draft/Closed), `posted_date` |
| `applications` | Links job seekers to jobs with `status` (Applied/Shortlisted/Interviewing) |
| `jobseeker_work_histories` | Work experience records per job seeker |

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.9+
- **PostgreSQL** 14+
- **pgAdmin** (optional, for DB management)

---

### Database Setup

1. Open **pgAdmin** and connect to your PostgreSQL server.
2. Create a new database named `intelligent_job_portal`.
3. Open the **Query Tool** and run:

```sql
-- Run schema first
\i database/schema.sql

-- Then seed sample data
\i database/seed.sql
```

---

### Backend Setup

```bash
cd flask_server

# Install Python dependencies
pip install flask flask-cors psycopg2-binary python-dotenv

# Create .env file (see Environment Variables section)

# Start the Flask server
python app.py
```

The Flask API will run at **http://localhost:5000**.

---

### Frontend Setup

```bash
# From project root
npm install

# Start the development server
npm run dev
```

The Vite dev server runs at **http://localhost:5173**.

---

## Environment Variables

Create a `.env` file inside `flask_server/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=intelligent_job_portal
DB_USER=postgres
DB_PASSWORD=your_password_here
```

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## API Endpoints (Flask)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login and return user session |
| `PUT` | `/api/auth/change-password` | Change password (verifies old password) |
| `GET` | `/api/jobs?recruiterId=X` | Get all jobs for a recruiter |
| `POST` | `/api/jobs` | Create a new job posting |
| `PUT` | `/api/jobs/:id` | Update a job posting |
| `GET` | `/api/applicants?recruiterId=X` | Get all applicants for recruiter's jobs |
| `PUT` | `/api/applicants/:id/status` | Update applicant status |
| `GET` | `/api/recruiter/profile/:id` | Get recruiter profile |
| `PUT` | `/api/recruiter/profile/:id` | Update recruiter profile |

---

## Branch Info

| Branch | Description |
|---|---|
| `fe_w_db_n_be` | ✅ **Current** — Frontend + Flask backend + PostgreSQL integration |

---

## 👥 Contributors

Built as a capstone project for the **Intelligent Job Portal** system.
