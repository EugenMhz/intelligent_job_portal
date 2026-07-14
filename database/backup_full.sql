-- ==================================================================
-- Full Database Backup (Schema + Data) for Intelligent Job Portal
-- Generated automatically
-- ==================================================================

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
CREATE TYPE application_status AS ENUM ('Applied', 'Shortlisted', 'Interviewing', 'Rejected', 'Withdrawn');
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


-- Data for table users
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (1, 'alex.johnson@email.com', '$2b$10$xyzJobseekerHash1', 'seeker', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (2, 'alex.rivera@example.com', '$2b$10$xyzJobseekerHash2', 'seeker', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (3, 'sarah.chen@example.com', '$2b$10$xyzJobseekerHash3', 'seeker', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (4, 'marcus.johnson@example.com', '$2b$10$xyzJobseekerHash4', 'seeker', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (5, 'elena.petrova@example.com', '$2b$10$xyzJobseekerHash5', 'seeker', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (6, 'jane.doe@intelligentportal.com', '$2b$10$xyzRecruiterHash1', 'recruiter', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (7, 'recruiter_test@domain.com', '$2b$12$cbZh6lch5vG.3MCh9Ik/aeCq9X1QYC1TsC8ilJqQdUlhrlH/bHMTC', 'recruiter', '2026-07-13 21:34:19.654632+05:45', '2026-07-13 21:46:15.595412+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (11, 'sumina@gmail.com', '$2b$12$i.7QZ9L8TY9JYaJGN/PctOR1oCfdzbUbIeJOPF2Kd5gRCfR3DqpNy', 'seeker', '2026-07-14 10:29:24.939171+05:45', '2026-07-14 10:29:24.939171+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (10, 'martin@gmail.com', '$2b$12$qC8Ho4XOp/h3fvxOmdckeujn5j/E9RiUfDZJpP3NBfkbB9sj.qdM.', 'recruiter', '2026-07-13 22:42:12.890955+05:45', '2026-07-14 11:10:05.996587+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (12, 'seeker_test@example.com', '$2b$12$aP6jHahyFEWc.6d3kASiPeGJA0kmiBgWO9AN6AA7mJJKZXUsi/NgO', 'seeker', '2026-07-14 12:54:56.216308+05:45', '2026-07-14 12:54:56.216308+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (13, 'testseeker@example.com', '$2b$12$U2u3d9HAcJNBO8LyGQG6j.Erb2GGVRJot0Px5rl55AjrTeO81pKdy', 'seeker', '2026-07-14 17:10:32.725941+05:45', '2026-07-14 17:10:32.725941+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (14, 'testrecruiter@example.com', '$2b$12$thr63aEeYhLADjTx5R10sO7x3wfCz2f7qY9KDuDJ603CPzuihNwvK', 'recruiter', '2026-07-14 17:57:42.852306+05:45', '2026-07-14 17:57:42.852306+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (9, 'Aashish@gmail.com', '$2b$12$aQzh5z/Nnx8ienaVgiptkO2KfnRNv5dQ3bWptWbQyRpoMtH946BWS', 'recruiter', '2026-07-13 21:37:58.195575+05:45', '2026-07-14 18:16:22.889784+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (15, 'mhrzn009@gmail.com', '$2b$12$WnrxaEqW3cGeNOE5Q1Jhcu5UO2lplSFApaq9LvnF.EJsXm9wdkFLm', 'recruiter', '2026-07-14 18:07:31.250388+05:45', '2026-07-14 18:28:14.716417+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (8, 'binammaharjan11@gmail.com', '$2b$12$Rqd3ox.7NaVVKLfJSLLyMePzzQZB53.cMbyu8XW1UFhehny3SdF/m', 'seeker', '2026-07-13 21:36:56.190933+05:45', '2026-07-14 18:44:30.178362+05:45');
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (16, 'nlp_seeker@example.com', '$2b$12$/vbbebiuqMz6ntwBT7Ghqevwy/qnhop4vF6gXOk3H4PYl9StkDm1G', 'seeker', '2026-07-14 23:54:51.006488+05:45', '2026-07-14 23:54:51.006488+05:45');

-- Data for table skills
INSERT INTO skills (id, name) VALUES (1, 'React.js');
INSERT INTO skills (id, name) VALUES (2, 'TypeScript');
INSERT INTO skills (id, name) VALUES (3, 'Tailwind CSS');
INSERT INTO skills (id, name) VALUES (4, 'UI Design');
INSERT INTO skills (id, name) VALUES (6, 'GraphQL');
INSERT INTO skills (id, name) VALUES (7, 'Figma');
INSERT INTO skills (id, name) VALUES (8, 'Sketch');
INSERT INTO skills (id, name) VALUES (9, 'Prototyping');
INSERT INTO skills (id, name) VALUES (10, 'Strategy');
INSERT INTO skills (id, name) VALUES (11, 'Design Systems');
INSERT INTO skills (id, name) VALUES (12, 'Iconography');
INSERT INTO skills (id, name) VALUES (13, 'User Research');
INSERT INTO skills (id, name) VALUES (14, 'Leadership');
INSERT INTO skills (id, name) VALUES (16, 'SQL');
INSERT INTO skills (id, name) VALUES (17, 'PyTorch');
INSERT INTO skills (id, name) VALUES (20, 'Flask');
INSERT INTO skills (id, name) VALUES (21, 'NLP');
INSERT INTO skills (id, name) VALUES (23, 'Machine Learning');
INSERT INTO skills (id, name) VALUES (25, 'Database Architecture');
INSERT INTO skills (id, name) VALUES (26, 'Cybersecurity');
INSERT INTO skills (id, name) VALUES (27, 'AI Ethics');
INSERT INTO skills (id, name) VALUES (28, 'Data Governance');
INSERT INTO skills (id, name) VALUES (29, 'Risk Assessment');
INSERT INTO skills (id, name) VALUES (30, 'HCI');
INSERT INTO skills (id, name) VALUES (31, 'Web Accessibility');
INSERT INTO skills (id, name) VALUES (32, 'User Testing');
INSERT INTO skills (id, name) VALUES (33, 'UX Research');
INSERT INTO skills (id, name) VALUES (34, 'QA');
INSERT INTO skills (id, name) VALUES (36, 'JavaScript');
INSERT INTO skills (id, name) VALUES (19, 'React');
INSERT INTO skills (id, name) VALUES (5, 'Next.js');
INSERT INTO skills (id, name) VALUES (18, 'Node.js');
INSERT INTO skills (id, name) VALUES (40, 'Express');
INSERT INTO skills (id, name) VALUES (41, 'Django');
INSERT INTO skills (id, name) VALUES (22, 'PostgreSQL');
INSERT INTO skills (id, name) VALUES (24, 'Docker');
INSERT INTO skills (id, name) VALUES (44, 'Git');
INSERT INTO skills (id, name) VALUES (45, 'GitHub');
INSERT INTO skills (id, name) VALUES (15, 'Python');
INSERT INTO skills (id, name) VALUES (47, 'Pandas');
INSERT INTO skills (id, name) VALUES (48, 'NumPy');
INSERT INTO skills (id, name) VALUES (49, 'Tableau');
INSERT INTO skills (id, name) VALUES (50, 'Power BI');
INSERT INTO skills (id, name) VALUES (51, 'Communication');
INSERT INTO skills (id, name) VALUES (52, 'Problem Solving');
INSERT INTO skills (id, name) VALUES (53, 'Project Management');
INSERT INTO skills (id, name) VALUES (54, 'Tailwind CSs');

-- Data for table jobseeker_profiles
INSERT INTO jobseeker_profiles (user_id, full_name, title, profile_picture_url, resume_url, auto_apply, auto_apply_match_threshold, education, created_at, updated_at) VALUES (2, 'Alex Rivera', 'Sr. Designer', NULL, 'Alex_Rivera_Resume.pdf', TRUE, 75, 'M.S. in Human-Computer Interaction - Georgia Institute of Technology', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobseeker_profiles (user_id, full_name, title, profile_picture_url, resume_url, auto_apply, auto_apply_match_threshold, education, created_at, updated_at) VALUES (3, 'Sarah Chen', 'UX Architect', NULL, 'Sarah_Chen_Portfolio.pdf', FALSE, 80, 'B.F.A. in Graphic Design - Rhode Island School of Design', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobseeker_profiles (user_id, full_name, title, profile_picture_url, resume_url, auto_apply, auto_apply_match_threshold, education, created_at, updated_at) VALUES (4, 'Marcus Johnson', 'Visual Designer', NULL, 'Marcus_J_Design.pdf', TRUE, 65, 'B.S. in Web Design & Interactive Media - Academy of Art University', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobseeker_profiles (user_id, full_name, title, profile_picture_url, resume_url, auto_apply, auto_apply_match_threshold, education, created_at, updated_at) VALUES (5, 'Elena Petrova', 'UI/UX Lead', NULL, 'Elena_Petrova_CV.pdf', TRUE, 70, 'B.S. in Computer Science & Design - Carnegie Mellon University', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobseeker_profiles (user_id, full_name, title, profile_picture_url, resume_url, auto_apply, auto_apply_match_threshold, education, created_at, updated_at) VALUES (11, 'Sumina ', '', NULL, '/uploads/11_Sumina_Maharjan_CV.docx', TRUE, 70, '', '2026-07-14 10:29:24.939171+05:45', '2026-07-14 10:48:27.000655+05:45');
INSERT INTO jobseeker_profiles (user_id, full_name, title, profile_picture_url, resume_url, auto_apply, auto_apply_match_threshold, education, created_at, updated_at) VALUES (1, 'Alex Johnson', 'Senior Frontend Developer', NULL, 'Alex_Johnson_Resume_2024.pdf', TRUE, 70, 'B.S. in Computer Science - Stanford University', '2026-07-13 21:14:49.266321+05:45', '2026-07-14 13:00:22.616407+05:45');
INSERT INTO jobseeker_profiles (user_id, full_name, title, profile_picture_url, resume_url, auto_apply, auto_apply_match_threshold, education, created_at, updated_at) VALUES (8, 'Binam Maharjan', '', '/uploads/profile_pic_8_binam.jpg', '/uploads/8_Binam_Maharjan_Demo_CV_v2.docx', TRUE, 70, '', '2026-07-13 21:36:56.190933+05:45', '2026-07-14 13:04:36.229964+05:45');
INSERT INTO jobseeker_profiles (user_id, full_name, title, profile_picture_url, resume_url, auto_apply, auto_apply_match_threshold, education, created_at, updated_at) VALUES (12, 'Seeker Test', NULL, '/uploads/profile_pic_12_martin.jpg', NULL, TRUE, 70, NULL, '2026-07-14 12:54:56.216308+05:45', '2026-07-14 13:10:04.006809+05:45');
INSERT INTO jobseeker_profiles (user_id, full_name, title, profile_picture_url, resume_url, auto_apply, auto_apply_match_threshold, education, created_at, updated_at) VALUES (13, 'Test Seeker', NULL, NULL, NULL, TRUE, 70, NULL, '2026-07-14 17:10:32.725941+05:45', '2026-07-14 17:10:32.725941+05:45');
INSERT INTO jobseeker_profiles (user_id, full_name, title, profile_picture_url, resume_url, auto_apply, auto_apply_match_threshold, education, created_at, updated_at) VALUES (16, 'Test Seeker NLP', 'Senior React Developer', NULL, '', TRUE, 70, 'BSc Computer Science', '2026-07-14 23:54:51.006488+05:45', '2026-07-15 00:21:53.036477+05:45');

-- Data for table recruiter_profiles
INSERT INTO recruiter_profiles (user_id, full_name, title, profile_picture_url, phone, department, location, bio, created_at, updated_at) VALUES (6, 'Jane Doe', 'Senior Recruiter', NULL, '+1 (555) 382-9012', 'Talent Acquisition', 'San Francisco, CA (Remote)', 'Passionate about connecting exceptional engineering and design talent with meaningful opportunities. 8+ years of technical recruiting experience.', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO recruiter_profiles (user_id, full_name, title, profile_picture_url, phone, department, location, bio, created_at, updated_at) VALUES (7, 'Test Recruiter', 'Recruiter', NULL, '+1 (555) 019-2834', 'Test Company', 'Seattle, WA', 'Leading team scaling and talent acquisition for high-growth tech firms.', '2026-07-13 21:34:19.654632+05:45', '2026-07-13 21:45:32.966092+05:45');
INSERT INTO recruiter_profiles (user_id, full_name, title, profile_picture_url, phone, department, location, bio, created_at, updated_at) VALUES (10, 'Martin Dhaubhadel', 'Recruiter', '/uploads/profile_pic_10_martin.jpg', '1234567890', 'MD Company', 'Bafal, Kathmandu', 'Dhau Budo', '2026-07-13 22:42:12.890955+05:45', '2026-07-14 13:06:33.405071+05:45');
INSERT INTO recruiter_profiles (user_id, full_name, title, profile_picture_url, phone, department, location, bio, created_at, updated_at) VALUES (9, 'Aashish Tamang', 'Recruiter', '/uploads/profile_pic_9_aashish.jpg', '9876543210', 'AT Company', 'Kathmandu', 'Leading team scaling and talent acquisition for high-growth tech firms.', '2026-07-13 21:37:58.195575+05:45', '2026-07-14 17:44:41.812368+05:45');
INSERT INTO recruiter_profiles (user_id, full_name, title, profile_picture_url, phone, department, location, bio, created_at, updated_at) VALUES (14, 'Test Recruiter', NULL, NULL, '9812345679', 'Test Company', NULL, NULL, '2026-07-14 17:57:42.852306+05:45', '2026-07-14 17:57:42.852306+05:45');
INSERT INTO recruiter_profiles (user_id, full_name, title, profile_picture_url, phone, department, location, bio, created_at, updated_at) VALUES (15, 'Eugen Maharjan', 'Recruiter', '/uploads/profile_pic_15_Eugen.png', '9813382138', 'EM Company', '', '', '2026-07-14 18:07:31.250388+05:45', '2026-07-14 18:08:06.181275+05:45');

-- Data for table jobseeker_skills
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (1, 1);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (1, 2);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (1, 3);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (1, 4);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (1, 5);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (1, 6);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (1, 7);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (2, 7);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (2, 4);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (2, 13);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (2, 9);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (3, 9);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (3, 10);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (3, 8);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (3, 7);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (4, 11);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (4, 12);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (4, 7);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (5, 14);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (5, 7);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (5, 13);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (16, 1);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (16, 2);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (16, 5);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (16, 3);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (11, 15);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (11, 36);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (11, 19);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (11, 5);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (11, 18);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (11, 40);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (11, 41);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (11, 22);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (11, 24);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (11, 44);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (8, 15);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (8, 47);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (8, 48);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (8, 49);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (8, 50);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (8, 51);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (8, 52);
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (8, 53);

-- Data for table jobs
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (10293, 6, 'Senior UX Designer', 'Product Design', 'Remote', 'Active', 'We are looking for a Senior UX Designer to join our product team and lead UI system designs.', '2023-10-14 14:45:00+05:45', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (10294, 6, 'Senior Frontend Engineer', 'Engineering', 'Remote', 'Active', 'Lead frontend developments using modern React and styled CSS structures.', '2023-10-12 16:15:00+05:45', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (10295, 6, 'Product Designer', 'Design', 'San Francisco, CA', 'Active', 'Collaborate across teams to design functional interfaces and high-quality mockups.', '2023-10-08 20:00:00+05:45', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (10296, 6, 'Marketing Manager', 'Marketing', 'New York, NY', 'Draft', 'Design marketing campaigns and analyze promotional conversions.', '2023-10-05 13:45:00+05:45', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (10297, 6, 'DevOps Engineer', 'Infrastructure', 'Hybrid', 'Closed', 'Scale deployment orchestration, container systems, and logging mechanisms.', '2023-09-28 17:05:00+05:45', '2026-07-13 21:14:49.266321+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (2, 9, 'NLP Data Engineer', 'Engineering', 'Hybrid', 'Active', 'We are looking for an innovative engineer to help build and optimize our text extraction pipelines and semantic matching algorithms. You will be responsible for developing automated document parsing systems and working heavily with sentence transformers to improve our data analysis capabilities.', '2026-07-13 22:13:18.514826+05:45', '2026-07-13 22:13:18.514826+05:45', '2026-07-13 22:13:18.514826+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (3, 9, 'Full-Stack Software Engineer', 'Engineering', 'Kathmandu, Nepal', 'Active', 'Join our fast-paced team to build scalable web applications. You will be responsible for designing robust relational database schemas, developing secure RESTful APIs, and creating highly responsive front-end interfaces. Experience with modern accessibility standards is a huge plus.', '2026-07-13 22:14:12.480086+05:45', '2026-07-13 22:14:12.480086+05:45', '2026-07-13 22:14:12.480086+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (4, 9, 'Database Administrator', 'Infrastructure', 'Lalitpur, Nepal', 'Draft', 'We are seeking an experienced DBA to manage, optimize, and secure our core database systems. The ideal candidate will have deep expertise in relational database structures, performance tuning, and integrating vector extensions for advanced querying.', '2026-07-13 22:16:00.242213+05:45', '2026-07-13 22:16:00.242213+05:45', '2026-07-13 22:25:26.146964+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (5, 9, 'QA Engineer', 'Engineering', 'Kathmandu, Nepal', 'Active', 'Perform quality assurance, automated testing, and write test scenarios.', '2026-07-13 22:31:35.035509+05:45', '2026-07-13 22:31:35.035509+05:45', '2026-07-13 22:31:35.035509+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (6, 9, 'QA Engineer Draft 2', 'Engineering', 'Kathmandu, Nepal', 'Draft', 'Perform quality assurance, automated testing, and write test scenarios.', '2026-07-13 22:33:24.797175+05:45', '2026-07-13 22:33:24.797175+05:45', '2026-07-13 22:38:43.339185+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (1, 9, 'Senior Product Designer', 'Engineering', 'Remote', 'Closed', 'Senior Product Designer Required with 5 years experience in the field.', '2026-07-13 22:08:43.612233+05:45', '2026-07-13 22:08:43.612233+05:45', '2026-07-13 22:38:52.072463+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (7, 10, 'Cloud Security & AI Governance Analyst', 'Engineering', 'Bhaktapur, Nepal', 'Draft', 'We are looking for an analytical professional to evaluate the security, legal, and ethical implications of our large-scale data analytics and AI deployments. You will help establish robust cybersecurity frameworks, analyze potential cloud security breaches, and mitigate risks associated with emerging data-driven technologies.', '2026-07-13 22:44:33.661337+05:45', '2026-07-13 22:44:33.661337+05:45', '2026-07-13 22:44:33.661337+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (8, 10, 'HCI & Accessibility Researcher', 'Engineering', 'Lalitpur, Nepal', 'Active', 'Join our R&D team to analyze specific Human-Computer Interaction (HCI) challenges, with a special focus on the healthcare sector. You will be responsible for proposing, designing, and testing essential web and mobile accessibility features to ensure our digital products provide inclusive experiences for all users.', '2026-07-13 22:45:19.346560+05:45', '2026-07-13 22:45:19.346560+05:45', '2026-07-13 22:45:19.346560+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (9, 9, 'QA', 'Design', 'Remote', 'Closed', 'QA NEEDED
- Address: Naxal', '2026-07-14 10:00:42.271990+05:45', '2026-07-14 10:00:42.271990+05:45', '2026-07-14 10:01:04.098343+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (10, 6, 'Backend Python Engineer', 'Engineering', 'Remote', 'Active', 'Build scalable microservices using Django and PostgreSQL.', '2026-07-14 13:16:41.048127+05:45', '2026-07-14 13:16:41.048127+05:45', '2026-07-14 13:16:41.048127+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (11, 6, 'Lead Figma Designer', 'Design', 'Kathmandu', 'Active', 'Manage design systems and direct the aesthetic styling.', '2026-07-14 13:16:41.048127+05:45', '2026-07-14 13:16:41.048127+05:45', '2026-07-14 13:16:41.048127+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (12, 6, 'Cloud Architect', 'Infrastructure', 'Remote', 'Active', 'Maintain AWS infrastructure and Kubernetes clusters.', '2026-07-14 13:16:41.048127+05:45', '2026-07-14 13:16:41.048127+05:45', '2026-07-14 13:16:41.048127+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (13, 6, 'Marketing Coordinator', 'Marketing', 'Lalitpur', 'Active', 'Coordinate campaigns and brand outreach programs.', '2026-07-14 13:16:41.048127+05:45', '2026-07-14 13:16:41.048127+05:45', '2026-07-14 13:16:41.048127+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (14, 6, 'Technical Writer', 'Documentation', 'Remote', 'Active', 'Author API specifications and technical documentation.', '2026-07-14 13:16:41.048127+05:45', '2026-07-14 13:16:41.048127+05:45', '2026-07-14 13:16:41.048127+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (15, 6, 'Auto-Apply Verification React Expert', 'Engineering', 'Remote', 'Active', 'We are seeking a senior React developer skilled in React.js, TypeScript, Next.js, and Tailwind CSS to build awesome web applications.', '2026-07-15 00:20:07.549603+05:45', '2026-07-15 00:20:07.549603+05:45', '2026-07-15 00:20:07.549603+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (16, 6, 'Auto-Apply Verification React Expert', 'Engineering', 'Remote', 'Active', 'We are seeking a senior React developer skilled in React.js, TypeScript, Next.js, and Tailwind CSS to build awesome web applications.', '2026-07-15 00:21:08.708181+05:45', '2026-07-15 00:21:08.708181+05:45', '2026-07-15 00:21:08.708181+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (17, 6, 'Auto-Apply Verification React Expert', 'Engineering', 'Remote', 'Active', 'We are seeking a senior React developer skilled in React.js, TypeScript, Next.js, and Tailwind CSS to build awesome web applications.', '2026-07-15 00:21:55.152104+05:45', '2026-07-15 00:21:55.152104+05:45', '2026-07-15 00:21:55.152104+05:45');
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date, created_at, updated_at) VALUES (18, 10, 'Auto Apply Test', 'Engineering', 'Remote', 'Active', 'We are seeking a senior React developer skilled in React.js, TypeScript, Next.js, and Tailwind CSS to build awesome web applications.', '2026-07-15 00:29:10.815150+05:45', '2026-07-15 00:29:10.815150+05:45', '2026-07-15 00:29:10.815150+05:45');

-- Data for table job_skills
INSERT INTO job_skills (job_id, skill_id) VALUES (10293, 7);
INSERT INTO job_skills (job_id, skill_id) VALUES (10293, 13);
INSERT INTO job_skills (job_id, skill_id) VALUES (10293, 9);
INSERT INTO job_skills (job_id, skill_id) VALUES (10294, 1);
INSERT INTO job_skills (job_id, skill_id) VALUES (10294, 2);
INSERT INTO job_skills (job_id, skill_id) VALUES (10294, 3);
INSERT INTO job_skills (job_id, skill_id) VALUES (10295, 7);
INSERT INTO job_skills (job_id, skill_id) VALUES (10295, 9);
INSERT INTO job_skills (job_id, skill_id) VALUES (10295, 4);
INSERT INTO job_skills (job_id, skill_id) VALUES (1, 19);
INSERT INTO job_skills (job_id, skill_id) VALUES (1, 20);
INSERT INTO job_skills (job_id, skill_id) VALUES (2, 15);
INSERT INTO job_skills (job_id, skill_id) VALUES (2, 21);
INSERT INTO job_skills (job_id, skill_id) VALUES (2, 22);
INSERT INTO job_skills (job_id, skill_id) VALUES (2, 23);
INSERT INTO job_skills (job_id, skill_id) VALUES (3, 19);
INSERT INTO job_skills (job_id, skill_id) VALUES (3, 3);
INSERT INTO job_skills (job_id, skill_id) VALUES (3, 18);
INSERT INTO job_skills (job_id, skill_id) VALUES (3, 22);
INSERT INTO job_skills (job_id, skill_id) VALUES (4, 22);
INSERT INTO job_skills (job_id, skill_id) VALUES (4, 16);
INSERT INTO job_skills (job_id, skill_id) VALUES (4, 24);
INSERT INTO job_skills (job_id, skill_id) VALUES (4, 25);
INSERT INTO job_skills (job_id, skill_id) VALUES (7, 26);
INSERT INTO job_skills (job_id, skill_id) VALUES (7, 27);
INSERT INTO job_skills (job_id, skill_id) VALUES (7, 28);
INSERT INTO job_skills (job_id, skill_id) VALUES (7, 29);
INSERT INTO job_skills (job_id, skill_id) VALUES (8, 30);
INSERT INTO job_skills (job_id, skill_id) VALUES (8, 31);
INSERT INTO job_skills (job_id, skill_id) VALUES (8, 32);
INSERT INTO job_skills (job_id, skill_id) VALUES (8, 33);
INSERT INTO job_skills (job_id, skill_id) VALUES (9, 34);
INSERT INTO job_skills (job_id, skill_id) VALUES (10, 15);
INSERT INTO job_skills (job_id, skill_id) VALUES (10, 16);
INSERT INTO job_skills (job_id, skill_id) VALUES (11, 7);
INSERT INTO job_skills (job_id, skill_id) VALUES (11, 4);
INSERT INTO job_skills (job_id, skill_id) VALUES (12, 1);
INSERT INTO job_skills (job_id, skill_id) VALUES (12, 2);
INSERT INTO job_skills (job_id, skill_id) VALUES (13, 1);
INSERT INTO job_skills (job_id, skill_id) VALUES (13, 2);
INSERT INTO job_skills (job_id, skill_id) VALUES (14, 1);
INSERT INTO job_skills (job_id, skill_id) VALUES (14, 2);
INSERT INTO job_skills (job_id, skill_id) VALUES (15, 1);
INSERT INTO job_skills (job_id, skill_id) VALUES (15, 2);
INSERT INTO job_skills (job_id, skill_id) VALUES (15, 5);
INSERT INTO job_skills (job_id, skill_id) VALUES (15, 3);
INSERT INTO job_skills (job_id, skill_id) VALUES (16, 1);
INSERT INTO job_skills (job_id, skill_id) VALUES (16, 2);
INSERT INTO job_skills (job_id, skill_id) VALUES (16, 5);
INSERT INTO job_skills (job_id, skill_id) VALUES (16, 3);
INSERT INTO job_skills (job_id, skill_id) VALUES (17, 1);
INSERT INTO job_skills (job_id, skill_id) VALUES (17, 2);
INSERT INTO job_skills (job_id, skill_id) VALUES (17, 5);
INSERT INTO job_skills (job_id, skill_id) VALUES (17, 3);
INSERT INTO job_skills (job_id, skill_id) VALUES (18, 1);
INSERT INTO job_skills (job_id, skill_id) VALUES (18, 2);
INSERT INTO job_skills (job_id, skill_id) VALUES (18, 54);
INSERT INTO job_skills (job_id, skill_id) VALUES (18, 5);

-- Data for table saved_jobs
INSERT INTO saved_jobs (jobseeker_id, job_id, created_at) VALUES (8, 10296, '2026-07-14 13:28:47.386504+05:45');
INSERT INTO saved_jobs (jobseeker_id, job_id, created_at) VALUES (8, 2, '2026-07-14 13:28:47.894686+05:45');
INSERT INTO saved_jobs (jobseeker_id, job_id, created_at) VALUES (8, 10297, '2026-07-14 13:39:09.897783+05:45');
INSERT INTO saved_jobs (jobseeker_id, job_id, created_at) VALUES (8, 6, '2026-07-14 13:43:17.870581+05:45');
INSERT INTO saved_jobs (jobseeker_id, job_id, created_at) VALUES (8, 5, '2026-07-14 13:48:55.286300+05:45');
INSERT INTO saved_jobs (jobseeker_id, job_id, created_at) VALUES (13, 5, '2026-07-14 17:11:30.626371+05:45');
INSERT INTO saved_jobs (jobseeker_id, job_id, created_at) VALUES (11, 8, '2026-07-14 17:18:05.187279+05:45');
INSERT INTO saved_jobs (jobseeker_id, job_id, created_at) VALUES (8, 10, '2026-07-14 18:44:48.952154+05:45');
INSERT INTO saved_jobs (jobseeker_id, job_id, created_at) VALUES (16, 10294, '2026-07-15 00:05:46.867085+05:45');
INSERT INTO saved_jobs (jobseeker_id, job_id, created_at) VALUES (11, 10, '2026-07-15 00:06:47.424852+05:45');
INSERT INTO saved_jobs (jobseeker_id, job_id, created_at) VALUES (11, 3, '2026-07-15 00:06:49.151724+05:45');

-- Data for table applications
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (3, 10293, 4, 'Applied', 85, 'Manual', '2023-10-15 15:00:00+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (4, 10293, 5, 'Applied', 79, 'Manual', '2023-10-15 20:15:00+05:45', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (2, 10293, 3, 'Applied', 92, 'Auto-Applied', '2023-10-14 18:25:00+05:45', '2026-07-13 21:17:23.469946+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (1, 10293, 2, 'Rejected', 98, 'Manual', '2023-10-14 17:05:00+05:45', '2026-07-13 21:17:48.395041+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (6, 10, 13, 'Applied', 0, 'Manual', '2026-07-14 17:12:00.765800+05:45', '2026-07-14 17:12:00.765800+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (7, 14, 13, 'Applied', 0, 'Manual', '2026-07-14 17:12:19.185582+05:45', '2026-07-14 17:12:19.185582+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (8, 12, 13, 'Applied', 0, 'Manual', '2026-07-14 17:12:36.162869+05:45', '2026-07-14 17:12:36.162869+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (9, 8, 13, 'Applied', 0, 'Manual', '2026-07-14 17:16:19.777314+05:45', '2026-07-14 17:16:19.777314+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (10, 8, 11, 'Rejected', 0, 'Manual', '2026-07-14 17:18:09.206527+05:45', '2026-07-14 17:20:25.680933+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (5, 5, 13, 'Interviewing', 75, 'Manual', '2026-07-14 17:11:44.341991+05:45', '2026-07-14 17:23:59.674785+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (12, 3, 8, 'Rejected', 0, 'Manual', '2026-07-14 17:24:44.488684+05:45', '2026-07-14 17:30:22.524034+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (13, 2, 8, 'Shortlisted', 25, 'Manual', '2026-07-14 17:24:49.030380+05:45', '2026-07-14 17:41:38.516617+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (11, 5, 8, 'Interviewing', 75, 'Manual', '2026-07-14 17:24:40.340716+05:45', '2026-07-14 17:46:59.015252+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (16, 5, 11, 'Withdrawn', 75, 'Manual', '2026-07-14 18:47:32.153247+05:45', '2026-07-15 00:09:00.481980+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (14, 3, 11, 'Withdrawn', 75, 'Manual', '2026-07-14 18:47:29.003309+05:45', '2026-07-15 00:09:33.751184+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (15, 2, 11, 'Withdrawn', 50, 'Manual', '2026-07-14 18:47:30.545469+05:45', '2026-07-15 00:09:49.026177+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (17, 10, 11, 'Applied', 62, 'Manual', '2026-07-15 00:11:49.782326+05:45', '2026-07-15 00:11:49.782326+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (18, 16, 1, 'Applied', 78, 'Auto-Applied', '2026-07-15 00:21:08.934245+05:45', '2026-07-15 00:21:08.934245+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (20, 17, 1, 'Applied', 78, 'Auto-Applied', '2026-07-15 00:21:55.215445+05:45', '2026-07-15 00:21:55.215445+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (21, 17, 16, 'Applied', 84, 'Auto-Applied', '2026-07-15 00:21:55.563934+05:45', '2026-07-15 00:21:55.563934+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (22, 18, 1, 'Applied', 80, 'Auto-Applied', '2026-07-15 00:29:10.875246+05:45', '2026-07-15 00:29:10.875246+05:45');
INSERT INTO applications (id, job_id, jobseeker_id, status, match_score, method, applied_at, updated_at) VALUES (23, 18, 16, 'Applied', 84, 'Auto-Applied', '2026-07-15 00:29:11.137920+05:45', '2026-07-15 00:29:11.137920+05:45');

-- Data for table jobseeker_work_histories
INSERT INTO jobseeker_work_histories (id, jobseeker_id, role, company, period, description, created_at) VALUES (1, 2, 'Sr. Product Designer', 'Creative Flow', '2021 - Present', 'Led redesign of the core dashboard application, resulting in a 40% increase in user retention. Established and documented the company''s first unified design system.', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobseeker_work_histories (id, jobseeker_id, role, company, period, description, created_at) VALUES (2, 2, 'UX Designer', 'DesignStudio', '2018 - 2021', 'Designed custom web applications for client companies. Conducted user research, usability testing, and built complex clickable wireframe prototypes.', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobseeker_work_histories (id, jobseeker_id, role, company, period, description, created_at) VALUES (3, 3, 'UX Architect', 'TechPulse', '2020 - Present', 'Created high-fidelity interactive prototype layouts. Improved user onboarding flow, reducing customer churn by 18%.', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobseeker_work_histories (id, jobseeker_id, role, company, period, description, created_at) VALUES (4, 3, 'Visual Designer', 'PixelPerfect', '2017 - 2020', 'Crafted marketing collaterals and custom interface illustrations. Partnered with developers to build functional, pixel-perfect layouts.', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobseeker_work_histories (id, jobseeker_id, role, company, period, description, created_at) VALUES (5, 4, 'Junior Visual Designer', 'Spectrum', '2022 - Present', 'Assisted senior designers in managing the company''s visual asset library. Created high-quality icons and layout illustrations.', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobseeker_work_histories (id, jobseeker_id, role, company, period, description, created_at) VALUES (6, 5, 'UI/UX Lead', 'BrightDev', '2019 - Present', 'Manage a team of 5 designers. Decreased user task completion times by 25% by streamlining key operations.', '2026-07-13 21:14:49.266321+05:45');
INSERT INTO jobseeker_work_histories (id, jobseeker_id, role, company, period, description, created_at) VALUES (7, 5, 'Lead Product Designer', 'CoreFintech', '2015 - 2019', 'Supervised end-to-end product development for a leading mobile investment client app.', '2026-07-13 21:14:49.266321+05:45');

-- Reset Serial Sequences for Auto-Increment Columns
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), true);
SELECT setval('skills_id_seq', COALESCE((SELECT MAX(id) FROM skills), 1), true);
SELECT setval('jobs_id_seq', COALESCE((SELECT MAX(id) FROM jobs), 1), true);
SELECT setval('applications_id_seq', COALESCE((SELECT MAX(id) FROM applications), 1), true);
SELECT setval('jobseeker_work_histories_id_seq', COALESCE((SELECT MAX(id) FROM jobseeker_work_histories), 1), true);