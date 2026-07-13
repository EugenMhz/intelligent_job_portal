import os
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Initialize Flask App
app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# Load environment variables from the server/.env file
env_path = os.path.join(os.path.dirname(__file__), '../server/.env')
load_dotenv(dotenv_path=env_path)

# Custom JSON Provider to handle Datetime objects
from flask.json.provider import DefaultJSONProvider
class CustomJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, (datetime.datetime, datetime.date)):
            return obj.isoformat()
        return super().default(obj)

app.json = CustomJSONProvider(app)

# Database Connection Helper
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "intelligent_job_portal"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "1234"),
        port=os.getenv("DB_PORT", "5432")
    )

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "Flask PostgreSQL API"}), 200

# ==============================================================================
# AUTHENTICATION API ROUTES
# ==============================================================================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    email = data.get('email')
    if email:
        email = email.strip().lower()
    password = data.get('password')
    role = data.get('role')  # 'seeker' or 'recruiter'
    full_name = data.get('fullName')
    phone = data.get('phone', '')
    company_name = data.get('companyName', '')

    if not email or not password or not role or not full_name:
        return jsonify({"error": "Missing required fields: email, password, role, fullName"}), 400

    if role not in ['seeker', 'recruiter']:
        return jsonify({"error": "Invalid role. Must be 'seeker' or 'recruiter'"}), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Check if user already exists (case-insensitively)
        cur.execute("SELECT id FROM users WHERE LOWER(email) = %s", (email,))
        if cur.fetchone():
            return jsonify({"error": "User with this email already exists"}), 400

        # Insert user into users table (storing lowercase email)
        cur.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, %s) RETURNING id, email, role",
            (email, password_hash, role)
        )
        user = cur.fetchone()
        user_id = user['id']

        # Insert into specific profile table
        if role == 'seeker':
            cur.execute(
                "INSERT INTO jobseeker_profiles (user_id, full_name) VALUES (%s, %s)",
                (user_id, full_name)
            )
        elif role == 'recruiter':
            # Map company_name to department for recruiters, phone to phone
            cur.execute(
                "INSERT INTO recruiter_profiles (user_id, full_name, phone, department) VALUES (%s, %s, %s, %s)",
                (user_id, full_name, phone, company_name)
            )

        conn.commit()
        return jsonify({
            "id": user_id,
            "email": user['email'],
            "role": user['role'],
            "name": full_name
        }), 201

    except Exception as e:
        conn.rollback()
        app.logger.error(f"Error during signup: {str(e)}")
        return jsonify({"error": "Internal server error during registration"}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    if email:
        email = email.strip().lower()
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM users WHERE LOWER(email) = %s", (email,))
        user = cur.fetchone()

        if not user or not bcrypt.check_password_hash(user['password_hash'], password):
            return jsonify({"error": "Invalid email or password"}), 401

        user_id = user['id']
        role = user['role']

        # Fetch the user's name from profile
        full_name = ""
        if role == 'seeker':
            cur.execute("SELECT full_name FROM jobseeker_profiles WHERE user_id = %s", (user_id,))
            prof = cur.fetchone()
            if prof:
                full_name = prof['full_name']
        elif role == 'recruiter':
            cur.execute("SELECT full_name FROM recruiter_profiles WHERE user_id = %s", (user_id,))
            prof = cur.fetchone()
            if prof:
                full_name = prof['full_name']

        return jsonify({
            "id": user_id,
            "email": user['email'],
            "role": role,
            "name": full_name
        }), 200

    except Exception as e:
        app.logger.error(f"Error during login: {str(e)}")
        return jsonify({"error": "Internal server error during login"}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/auth/change-password', methods=['PUT'])
def change_password():
    data = request.get_json() or {}
    user_id = data.get('userId')
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    if not user_id or not old_password or not new_password:
        return jsonify({"error": "Missing required fields: userId, oldPassword, newPassword"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.check_password_hash(user['password_hash'], old_password):
            return jsonify({"error": "Incorrect current password"}), 401

        new_password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_password_hash, user_id))
        conn.commit()

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        app.logger.error(f"Error during password change: {str(e)}")
        return jsonify({"error": "Internal server error during password change"}), 500
    finally:
        cur.close()
        conn.close()


# ==============================================================================
# JOBS API ROUTES
# ==============================================================================

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    recruiter_id = request.args.get('recruiterId')
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if recruiter_id:
            cur.execute("""
                SELECT j.*, 
                       COALESCE(COUNT(a.id), 0)::integer AS "applicantsCount"
                FROM jobs j
                LEFT JOIN applications a ON j.id = a.job_id
                WHERE j.recruiter_id = %s
                GROUP BY j.id
                ORDER BY j.posted_date DESC
            """, (recruiter_id,))
        else:
            cur.execute("""
                SELECT j.*, 
                       COALESCE(COUNT(a.id), 0)::integer AS "applicantsCount"
                FROM jobs j
                LEFT JOIN applications a ON j.id = a.job_id
                GROUP BY j.id
                ORDER BY j.posted_date DESC
            """)
        jobs_list = cur.fetchall()
        return jsonify(jobs_list), 200
    except Exception as e:
        app.logger.error(f"Error fetching jobs: {str(e)}")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/jobs', methods=['POST'])
def post_job():
    data = request.get_json() or {}
    recruiter_id = data.get('recruiter_id', 6)
    title = data.get('title')
    department = data.get('department')
    location = data.get('location')
    description = data.get('description')
    status = data.get('status', 'Active')
    skills = data.get('skills', [])

    if not title or not description:
        return jsonify({"error": "Title and description are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Insert job details
        cur.execute("""
            INSERT INTO jobs (recruiter_id, title, department, location, status, description)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING *
        """, (recruiter_id, title, department, location, status, description))
        job = cur.fetchone()
        job_id = job['id']

        # Link skills
        if skills:
            for skill_name in skills:
                # Find or create skill in master table
                cur.execute("SELECT id FROM skills WHERE name = %s", (skill_name,))
                skill_row = cur.fetchone()
                if not skill_row:
                    cur.execute("INSERT INTO skills (name) VALUES (%s) RETURNING id", (skill_name,))
                    skill_id = cur.fetchone()['id']
                else:
                    skill_id = skill_row['id']

                # Link skill to job
                cur.execute("""
                    INSERT INTO job_skills (job_id, skill_id) 
                    VALUES (%s, %s) 
                    ON CONFLICT DO NOTHING
                """, (job_id, skill_id))

        conn.commit()
        return jsonify(job), 201
    except Exception as e:
        conn.rollback()
        app.logger.error(f"Error creating job: {str(e)}")
        return jsonify({"error": "Failed to create job posting"}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    data = request.get_json() or {}
    title = data.get('title')
    department = data.get('department')
    location = data.get('location')
    description = data.get('description')
    status = data.get('status')

    if not title or not description:
        return jsonify({"error": "Title and description are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            UPDATE jobs 
            SET title = %s, department = %s, location = %s, description = %s, status = %s
            WHERE id = %s
            RETURNING *
        """, (title, department, location, description, status, job_id))
        job = cur.fetchone()

        if not job:
            return jsonify({"error": "Job not found"}), 404

        conn.commit()
        return jsonify(job), 200
    except Exception as e:
        conn.rollback()
        app.logger.error(f"Error updating job: {str(e)}")
        return jsonify({"error": "Failed to update job"}), 500
    finally:
        cur.close()
        conn.close()


# ==============================================================================
# APPLICANTS API ROUTES
# ==============================================================================

@app.route('/api/applicants', methods=['GET'])
def get_applicants():
    job_id = request.args.get('jobId')
    recruiter_id = request.args.get('recruiterId')
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        query = """
            SELECT 
                a.id, 
                a.jobseeker_id,
                jp.full_name AS name, 
                jp.title AS role, 
                COALESCE(rp.department, 'Creative Flow') AS company,
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
                jp.title AS "experienceLevel",
                u.email AS "email"
            FROM applications a
            JOIN jobseeker_profiles jp ON a.jobseeker_id = jp.user_id
            JOIN jobs j ON a.job_id = j.id
            LEFT JOIN users u ON a.jobseeker_id = u.id
            LEFT JOIN recruiter_profiles rp ON u.id = rp.user_id
        """
        
        where_clauses = []
        params = []
        
        if job_id:
            where_clauses.append("a.job_id = %s")
            params.append(job_id)
            
        if recruiter_id:
            where_clauses.append("j.recruiter_id = %s")
            params.append(recruiter_id)
            
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
            
        cur.execute(query, tuple(params))
        applicants_list = cur.fetchall()
        
        # Enrich each applicant with work history from jobseeker_work_histories table
        for applicant in applicants_list:
            seeker_id = applicant['jobseeker_id']
            cur.execute("""
                SELECT role, company, period, description AS desc
                FROM jobseeker_work_histories
                WHERE jobseeker_id = %s
                ORDER BY id DESC
            """, (seeker_id,))
            applicant['workHistory'] = cur.fetchall()
            
        return jsonify(applicants_list), 200
    except Exception as e:
        app.logger.error(f"Error fetching applicants: {str(e)}")
        return jsonify({"error": "Failed to fetch applicants list"}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/applicants/<int:app_id>/status', methods=['PATCH'])
def update_applicant_status(app_id):
    data = request.get_json() or {}
    status = data.get('status')
    
    if not status:
        return jsonify({"error": "Status is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            UPDATE applications 
            SET status = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s 
            RETURNING *
        """, (status, app_id))
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Application record not found"}), 404
        conn.commit()
        return jsonify(row), 200
    except Exception as e:
        conn.rollback()
        app.logger.error(f"Error updating application status: {str(e)}")
        return jsonify({"error": "Database update failed"}), 500
    finally:
        cur.close()
        conn.close()


# ==============================================================================
# RECRUITER API ROUTES
# ==============================================================================

@app.route('/api/recruiters/<int:recruiter_id>', methods=['GET'])
def get_recruiter(recruiter_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM recruiter_profiles WHERE user_id = %s", (recruiter_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Recruiter profile not found"}), 404
        return jsonify(row), 200
    except Exception as e:
        app.logger.error(f"Error fetching recruiter: {str(e)}")
        return jsonify({"error": "Failed to query recruiter profile"}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/recruiters/<int:recruiter_id>', methods=['PUT'])
def update_recruiter(recruiter_id):
    data = request.get_json() or {}
    name = data.get('name')
    role = data.get('role')
    phone = data.get('phone')
    department = data.get('department')
    location = data.get('location')
    bio = data.get('bio')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        query = """
            INSERT INTO recruiter_profiles (user_id, full_name, title, phone, department, location, bio, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                title = EXCLUDED.title,
                phone = EXCLUDED.phone,
                department = EXCLUDED.department,
                location = EXCLUDED.location,
                bio = EXCLUDED.bio,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        """
        cur.execute(query, (recruiter_id, name, role, phone, department, location, bio))
        row = cur.fetchone()
        conn.commit()
        return jsonify(row), 200
    except Exception as e:
        conn.rollback()
        app.logger.error(f"Error updating recruiter profile: {str(e)}")
        return jsonify({"error": "Failed to update recruiter profile"}), 500
    finally:
        cur.close()
        conn.close()


# ==============================================================================
# JOBSEEKER API ROUTES (Bonus for Jobseeker integration)
# ==============================================================================

@app.route('/api/jobseekers/<int:seeker_id>', methods=['GET'])
def get_jobseeker(seeker_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM jobseeker_profiles WHERE user_id = %s", (seeker_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Jobseeker profile not found"}), 404
        
        # Get seeker's email from users
        cur.execute("SELECT email FROM users WHERE id = %s", (seeker_id,))
        user_row = cur.fetchone()
        if user_row:
            row['email'] = user_row['email']
            
        # Get seeker's skills
        cur.execute("""
            SELECT s.name 
            FROM jobseeker_skills jsk 
            JOIN skills s ON jsk.skill_id = s.id 
            WHERE jsk.jobseeker_id = %s
        """, (seeker_id,))
        skills = [s['name'] for s in cur.fetchall()]
        row['skills'] = skills
        
        return jsonify(row), 200
    except Exception as e:
        app.logger.error(f"Error fetching jobseeker: {str(e)}")
        return jsonify({"error": "Failed to query jobseeker profile"}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/jobseekers/<int:seeker_id>', methods=['PUT'])
def update_jobseeker(seeker_id):
    data = request.get_json() or {}
    name = data.get('name')
    title = data.get('title')
    resume_url = data.get('resume_url')
    auto_apply = data.get('auto_apply', True)
    auto_apply_threshold = data.get('auto_apply_match_threshold', 70)
    education = data.get('education')
    skills = data.get('skills', [])

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        query = """
            INSERT INTO jobseeker_profiles (user_id, full_name, title, resume_url, auto_apply, auto_apply_match_threshold, education, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                title = EXCLUDED.title,
                resume_url = EXCLUDED.resume_url,
                auto_apply = EXCLUDED.auto_apply,
                auto_apply_match_threshold = EXCLUDED.auto_apply_match_threshold,
                education = EXCLUDED.education,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        """
        cur.execute(query, (seeker_id, name, title, resume_url, auto_apply, auto_apply_threshold, education))
        row = cur.fetchone()
        
        # Delete old skills
        cur.execute("DELETE FROM jobseeker_skills WHERE jobseeker_id = %s", (seeker_id,))
        
        # Insert new skills
        if skills:
            for skill_name in skills:
                cur.execute("SELECT id FROM skills WHERE name = %s", (skill_name,))
                skill_row = cur.fetchone()
                if not skill_row:
                    cur.execute("INSERT INTO skills (name) VALUES (%s) RETURNING id", (skill_name,))
                    skill_id = cur.fetchone()['id']
                else:
                    skill_id = skill_row['id']
                cur.execute("INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (%s, %s)", (seeker_id, skill_id))

        conn.commit()
        row['skills'] = skills
        return jsonify(row), 200
    except Exception as e:
        conn.rollback()
        app.logger.error(f"Error updating jobseeker profile: {str(e)}")
        return jsonify({"error": "Failed to update jobseeker profile"}), 500
    finally:
        cur.close()
        conn.close()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
