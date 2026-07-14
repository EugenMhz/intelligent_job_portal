-- PostgreSQL Database Schema for Intelligent Job Portal

-- Drop existing tables and types if they exist (for easy schema migration/re-run)
DROP TABLE IF EXISTS jobseeker_work_histories CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS job_skills CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS jobseeker_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS recruiter_profiles CASCADE;
DROP TABLE IF EXISTS jobseeker_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS application_method CASCADE;

-- Enums Declarations
CREATE TYPE user_role AS ENUM ('seeker', 'recruiter');
CREATE TYPE job_status AS ENUM ('Active', 'Draft', 'Closed');
CREATE TYPE application_status AS ENUM ('Applied', 'Shortlisted', 'Interviewing', 'Rejected');
CREATE TYPE application_method AS ENUM ('Manual', 'Auto-Applied');

-- Users Authentication Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobseeker Profile Table
CREATE TABLE jobseeker_profiles (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    profile_picture_url VARCHAR(255),
    resume_url VARCHAR(255),
    auto_apply BOOLEAN DEFAULT TRUE,
    auto_apply_match_threshold INT DEFAULT 70 CHECK (auto_apply_match_threshold BETWEEN 0 AND 100),
    education TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recruiter Profile Table
CREATE TABLE recruiter_profiles (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    profile_picture_url VARCHAR(255),
    phone VARCHAR(50),
    department VARCHAR(255),
    location VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Skills Table
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Jobseeker Skills Junction Table (Many-to-Many)
CREATE TABLE jobseeker_skills (
    jobseeker_id INT REFERENCES users(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (jobseeker_id, skill_id)
);

-- Jobs Listings Table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    recruiter_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    location VARCHAR(255),
    status job_status DEFAULT 'Active',
    description TEXT NOT NULL,
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Required Skills Junction Table (Many-to-Many)
CREATE TABLE job_skills (
    job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- Saved Jobs Bookmarks Table
CREATE TABLE saved_jobs (
    jobseeker_id INT REFERENCES users(id) ON DELETE CASCADE,
    job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (jobseeker_id, job_id)
);

-- Applications Table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
    jobseeker_id INT REFERENCES users(id) ON DELETE CASCADE,
    status application_status DEFAULT 'Applied',
    match_score INT CHECK (match_score BETWEEN 0 AND 100),
    method application_method DEFAULT 'Manual',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobseeker Work History Table (One-to-Many)
CREATE TABLE jobseeker_work_histories (
    id SERIAL PRIMARY KEY,
    jobseeker_id INT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    period VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Automatically Update updated_at Triggers Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger Assignments
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobseeker_profiles_updated_at BEFORE UPDATE ON jobseeker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recruiter_profiles_updated_at BEFORE UPDATE ON recruiter_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Database Indexes for Performance Optimization
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_jobseeker ON applications(jobseeker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_jobseeker_skills_skill ON jobseeker_skills(skill_id);
CREATE INDEX idx_job_skills_skill ON job_skills(skill_id);
