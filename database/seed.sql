-- PostgreSQL Database Seed Data for Intelligent Job Portal

-- Clear existing data (in case script is run multiple times)
TRUNCATE TABLE jobseeker_work_histories CASCADE;
TRUNCATE TABLE applications CASCADE;
TRUNCATE TABLE saved_jobs CASCADE;
TRUNCATE TABLE job_skills CASCADE;
TRUNCATE TABLE jobs CASCADE;
TRUNCATE TABLE jobseeker_skills CASCADE;
TRUNCATE TABLE skills CASCADE;
TRUNCATE TABLE recruiter_profiles CASCADE;
TRUNCATE TABLE jobseeker_profiles CASCADE;
TRUNCATE TABLE users CASCADE;

-- Restart Serial Sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE skills_id_seq RESTART WITH 1;
ALTER SEQUENCE jobs_id_seq RESTART WITH 1;
ALTER SEQUENCE applications_id_seq RESTART WITH 1;
ALTER SEQUENCE jobseeker_work_histories_id_seq RESTART WITH 1;

-- 1. Insert Users (Auth records)
-- Seekers
INSERT INTO users (email, password_hash, role) VALUES
('alex.johnson@email.com', '$2b$10$xyzJobseekerHash1', 'seeker'),     -- ID 1
('alex.rivera@example.com', '$2b$10$xyzJobseekerHash2', 'seeker'),    -- ID 2
('sarah.chen@example.com', '$2b$10$xyzJobseekerHash3', 'seeker'),     -- ID 3
('marcus.johnson@example.com', '$2b$10$xyzJobseekerHash4', 'seeker'),  -- ID 4
('elena.petrova@example.com', '$2b$10$xyzJobseekerHash5', 'seeker');   -- ID 5

-- Recruiters
INSERT INTO users (email, password_hash, role) VALUES
('jane.doe@intelligentportal.com', '$2b$10$xyzRecruiterHash1', 'recruiter'); -- ID 6


-- 2. Insert Skills Master Table
INSERT INTO skills (name) VALUES
('React.js'),       -- ID 1
('TypeScript'),     -- ID 2
('Tailwind CSS'),   -- ID 3
('UI Design'),      -- ID 4
('Next.js'),        -- ID 5
('GraphQL'),        -- ID 6
('Figma'),          -- ID 7
('Sketch'),         -- ID 8
('Prototyping'),    -- ID 9
('Strategy'),       -- ID 10
('Design Systems'), -- ID 11
('Iconography'),    -- ID 12
('User Research'),  -- ID 13
('Leadership'),     -- ID 14
('Python'),         -- ID 15
('SQL'),            -- ID 16
('PyTorch'),        -- ID 17
('Node.js');        -- ID 18


-- 3. Insert Jobseeker Profiles
INSERT INTO jobseeker_profiles (user_id, full_name, title, resume_url, auto_apply, auto_apply_match_threshold, education) VALUES
(1, 'Alex Johnson', 'Senior Frontend Developer', 'Alex_Johnson_Resume_2024.pdf', TRUE, 70, 'B.S. in Computer Science - Stanford University'),
(2, 'Alex Rivera', 'Sr. Designer', 'Alex_Rivera_Resume.pdf', TRUE, 75, 'M.S. in Human-Computer Interaction - Georgia Institute of Technology'),
(3, 'Sarah Chen', 'UX Architect', 'Sarah_Chen_Portfolio.pdf', FALSE, 80, 'B.F.A. in Graphic Design - Rhode Island School of Design'),
(4, 'Marcus Johnson', 'Visual Designer', 'Marcus_J_Design.pdf', TRUE, 65, 'B.S. in Web Design & Interactive Media - Academy of Art University'),
(5, 'Elena Petrova', 'UI/UX Lead', 'Elena_Petrova_CV.pdf', TRUE, 70, 'B.S. in Computer Science & Design - Carnegie Mellon University');


-- 4. Insert Recruiter Profiles
INSERT INTO recruiter_profiles (user_id, full_name, title, phone, department, location, bio) VALUES
(6, 'Jane Doe', 'Senior Recruiter', '+1 (555) 382-9012', 'Talent Acquisition', 'San Francisco, CA (Remote)', 'Passionate about connecting exceptional engineering and design talent with meaningful opportunities. 8+ years of technical recruiting experience.');


-- 5. Link Jobseekers with Skills (Junction)
-- Alex Johnson: React.js, TypeScript, Tailwind CSS, UI Design, Next.js, GraphQL, Figma
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7);

-- Alex Rivera: Figma, UI Design, User Research, Prototyping
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES
(2, 7), (2, 4), (2, 13), (2, 9);

-- Sarah Chen: Prototyping, Strategy, Sketch, Figma
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES
(3, 9), (3, 10), (3, 8), (3, 7);

-- Marcus Johnson: Design Systems, Iconography, Figma
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES
(4, 11), (4, 12), (4, 7);

-- Elena Petrova: Leadership, Figma, User Research
INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES
(5, 14), (5, 7), (5, 13);


-- 6. Insert Jobs (Posted by recruiter Jane Doe, User ID 6)
-- Set fixed primary keys to match original IDs (10293 to 10297)
INSERT INTO jobs (id, recruiter_id, title, department, location, status, description, posted_date) VALUES
(10293, 6, 'Senior UX Designer', 'Product Design', 'Remote', 'Active', 'We are looking for a Senior UX Designer to join our product team and lead UI system designs.', '2023-10-14 09:00:00+00'),
(10294, 6, 'Senior Frontend Engineer', 'Engineering', 'Remote', 'Active', 'Lead frontend developments using modern React and styled CSS structures.', '2023-10-12 10:30:00+00'),
(10295, 6, 'Product Designer', 'Design', 'San Francisco, CA', 'Active', 'Collaborate across teams to design functional interfaces and high-quality mockups.', '2023-10-08 14:15:00+00'),
(10296, 6, 'Marketing Manager', 'Marketing', 'New York, NY', 'Draft', 'Design marketing campaigns and analyze promotional conversions.', '2023-10-05 08:00:00+00'),
(10297, 6, 'DevOps Engineer', 'Infrastructure', 'Hybrid', 'Closed', 'Scale deployment orchestration, container systems, and logging mechanisms.', '2023-09-28 11:20:00+00');


-- 7. Link Jobs with Required Skills (Junction)
-- Senior UX Designer: Figma, User Research, Prototyping
INSERT INTO job_skills (job_id, skill_id) VALUES
(10293, 7), (10293, 13), (10293, 9);

-- Senior Frontend Engineer: React, TypeScript, Tailwind CSS
INSERT INTO job_skills (job_id, skill_id) VALUES
(10294, 1), (10294, 2), (10294, 3);

-- Product Designer: Figma, Prototyping, UI Design
INSERT INTO job_skills (job_id, skill_id) VALUES
(10295, 7), (10295, 9), (10295, 4);


-- 8. Insert Applications
INSERT INTO applications (job_id, jobseeker_id, status, match_score, method, applied_at) VALUES
(10293, 2, 'Applied', 98, 'Manual', '2023-10-14 11:20:00+00'),      -- Alex Rivera
(10293, 3, 'Shortlisted', 92, 'Auto-Applied', '2023-10-14 12:40:00+00'), -- Sarah Chen
(10293, 4, 'Applied', 85, 'Manual', '2023-10-15 09:15:00+00'),      -- Marcus Johnson
(10293, 5, 'Applied', 79, 'Manual', '2023-10-15 14:30:00+00');      -- Elena Petrova


-- 9. Insert Jobseeker Work History
INSERT INTO jobseeker_work_histories (jobseeker_id, role, company, period, description) VALUES
-- Alex Rivera
(2, 'Sr. Product Designer', 'Creative Flow', '2021 - Present', 'Led redesign of the core dashboard application, resulting in a 40% increase in user retention. Established and documented the company''s first unified design system.'),
(2, 'UX Designer', 'DesignStudio', '2018 - 2021', 'Designed custom web applications for client companies. Conducted user research, usability testing, and built complex clickable wireframe prototypes.'),
-- Sarah Chen
(3, 'UX Architect', 'TechPulse', '2020 - Present', 'Created high-fidelity interactive prototype layouts. Improved user onboarding flow, reducing customer churn by 18%.'),
(3, 'Visual Designer', 'PixelPerfect', '2017 - 2020', 'Crafted marketing collaterals and custom interface illustrations. Partnered with developers to build functional, pixel-perfect layouts.'),
-- Marcus Johnson
(4, 'Junior Visual Designer', 'Spectrum', '2022 - Present', 'Assisted senior designers in managing the company''s visual asset library. Created high-quality icons and layout illustrations.'),
-- Elena Petrova
(5, 'UI/UX Lead', 'BrightDev', '2019 - Present', 'Manage a team of 5 designers. Decreased user task completion times by 25% by streamlining key operations.'),
(5, 'Lead Product Designer', 'CoreFintech', '2015 - 2019', 'Supervised end-to-end product development for a leading mobile investment client app.');
