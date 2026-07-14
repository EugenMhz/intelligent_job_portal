import os
import re
import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# CV parsing libraries
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

try:
    from docx import Document as DocxDocument
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

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

        # Fetch the user's name and profile picture from profile
        full_name = ""
        profile_picture_url = None
        if role == 'seeker':
            cur.execute("SELECT full_name, profile_picture_url FROM jobseeker_profiles WHERE user_id = %s", (user_id,))
            prof = cur.fetchone()
            if prof:
                full_name = prof['full_name']
                profile_picture_url = prof.get('profile_picture_url')
        elif role == 'recruiter':
            cur.execute("SELECT full_name, profile_picture_url FROM recruiter_profiles WHERE user_id = %s", (user_id,))
            prof = cur.fetchone()
            if prof:
                full_name = prof['full_name']
                profile_picture_url = prof.get('profile_picture_url')

        return jsonify({
            "id": user_id,
            "email": user['email'],
            "role": role,
            "name": full_name,
            "profile_picture_url": profile_picture_url
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


def send_reset_email(to_email, reset_link):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    mail_port = os.getenv("MAIL_PORT", "587")
    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")

    # If SMTP username/password are placeholders or empty, do not attempt to send
    if (not mail_username or not mail_password or 
        mail_username == "your-email@gmail.com" or 
        mail_password == "your-16-character-app-password"):
        app.logger.warning("SMTP Mail credentials are using placeholders or not configured. Email NOT sent.")
        return False

    msg = MIMEMultipart()
    msg['From'] = mail_username
    msg['To'] = to_email
    msg['Subject'] = "Reset Your Password - Intelligent Job Portal"

    body = f"""Hello,

We received a request to reset your password for your Intelligent Job Portal account. 
Please click the link below to choose a new password:

{reset_link}

Note: This link will expire in 15 minutes.

If you did not request this, you can safely ignore this email.

Best regards,
Intelligent Job Portal Team
"""
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(mail_server, int(mail_port))
        server.starttls()  # Upgrade connection to secure SSL/TLS
        server.login(mail_username, mail_password)
        server.sendmail(mail_username, to_email, msg.as_string())
        server.quit()
        app.logger.info(f"Password reset email successfully sent to {to_email}.")
        return True
    except Exception as e:
        app.logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    import secrets
    data = request.get_json() or {}
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    email = email.strip().lower()

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT id FROM users WHERE LOWER(email) = %s", (email,))
        user = cur.fetchone()

        if not user:
            return jsonify({"message": "If the email is registered, a password reset link will be sent."}), 200

        token = secrets.token_urlsafe(32)
        expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15)

        cur.execute(
            "UPDATE users SET reset_token = %s, reset_token_expiry = %s WHERE id = %s",
            (token, expiry, user['id'])
        )
        conn.commit()

        reset_link = f"http://localhost:5173/reset-password?token={token}"
        email_sent = send_reset_email(email, reset_link)

        # Log it to console for easy local access
        app.logger.info(f"\n========================================\nPASSWORD RESET LINK FOR {email}:\n{reset_link}\n========================================\n")

        return jsonify({
            "message": "If the email is registered, a password reset link will be sent.",
            "dev_reset_link": reset_link,
            "email_sent": email_sent
        }), 200

    except Exception as e:
        conn.rollback()
        app.logger.error(f"Error during forgot password: {str(e)}")
        return jsonify({"error": "Internal server error during password reset request"}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token')
    new_password = data.get('newPassword')

    if not token or not new_password:
        return jsonify({"error": "Token and newPassword are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Check token and expiry
        cur.execute(
            "SELECT id FROM users WHERE reset_token = %s AND reset_token_expiry > CURRENT_TIMESTAMP",
            (token,)
        )
        user = cur.fetchone()

        if not user:
            return jsonify({"error": "Invalid or expired token"}), 400

        # Update password
        new_password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        cur.execute(
            "UPDATE users SET password_hash = %s, reset_token = NULL, reset_token_expiry = NULL WHERE id = %s",
            (new_password_hash, user['id'])
        )
        conn.commit()

        return jsonify({"message": "Password has been reset successfully"}), 200

    except Exception as e:
        conn.rollback()
        app.logger.error(f"Error during reset password: {str(e)}")
        return jsonify({"error": "Internal server error during password reset"}), 500
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
                       COALESCE(COUNT(a.id), 0)::integer AS "applicantsCount",
                       ARRAY(
                         SELECT s.name 
                         FROM job_skills js
                         JOIN skills s ON js.skill_id = s.id
                         WHERE js.job_id = j.id
                       ) AS skills
                FROM jobs j
                LEFT JOIN applications a ON j.id = a.job_id
                WHERE j.recruiter_id = %s
                GROUP BY j.id
                ORDER BY j.posted_date DESC
            """, (recruiter_id,))
        else:
            cur.execute("""
                SELECT j.*, 
                       COALESCE(COUNT(a.id), 0)::integer AS "applicantsCount",
                       ARRAY(
                         SELECT s.name 
                         FROM job_skills js
                         JOIN skills s ON js.skill_id = s.id
                         WHERE js.job_id = j.id
                       ) AS skills
                FROM jobs j
                LEFT JOIN applications a ON j.id = a.job_id
                WHERE j.status = 'Active'
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


@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job_by_id(job_id):
    """Get details of a single job opportunity by ID."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT j.*, 
                   rp.full_name AS recruiter_name,
                   rp.title AS recruiter_title,
                   rp.profile_picture_url AS recruiter_profile_picture_url,
                   rp.location AS recruiter_location,
                   rp.bio AS recruiter_bio,
                   u.email AS recruiter_email,
                   ARRAY(
                     SELECT s.name 
                     FROM job_skills js
                     JOIN skills s ON js.skill_id = s.id
                     WHERE js.job_id = j.id
                   ) AS skills
            FROM jobs j
            LEFT JOIN recruiter_profiles rp ON j.recruiter_id = rp.user_id
            LEFT JOIN users u ON j.recruiter_id = u.id
            WHERE j.id = %s
        """, (job_id,))
        job = cur.fetchone()
        cur.close()
        
        if not job:
            return jsonify({"error": "Job opportunity not found"}), 404
            
        return jsonify(job), 200
    except Exception as e:
        app.logger.error(f"Error fetching job by ID: {str(e)}")
        return jsonify({"error": "Failed to fetch job details"}), 500
    finally:
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
                j.title AS "jobTitle",
                jp.resume_url AS "resumeUrl",
                jp.profile_picture_url AS "profilePictureUrl",
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


# ==============================================================================
# CV UPLOAD & SKILL EXTRACTION ROUTES
# ==============================================================================

# Curated skill keyword list (200+ skills across tech, design, data, soft skills)
SKILL_KEYWORDS = [
    # Programming Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Rust",
    "Ruby", "Swift", "Kotlin", "PHP", "Scala", "R", "MATLAB", "Dart", "Perl",
    # Web Frontend
    "React", "Vue", "Angular", "Next.js", "Nuxt.js", "HTML", "CSS", "Sass", "SCSS",
    "Tailwind", "Bootstrap", "jQuery", "Redux", "Zustand", "GraphQL", "REST",
    "Webpack", "Vite", "Babel",
    # Web Backend
    "Node.js", "Express", "Flask", "Django", "FastAPI", "Spring Boot", "Laravel",
    "Rails", "ASP.NET", "NestJS", "Hapi", "Koa",
    # Databases
    "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Cassandra", "DynamoDB",
    "Elasticsearch", "Oracle", "MSSQL", "Firebase", "Supabase", "PrismaORM",
    # Cloud & DevOps
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible",
    "Jenkins", "GitHub Actions", "CircleCI", "Nginx", "Linux", "Bash",
    "CI/CD", "Helm", "Prometheus", "Grafana",
    # Data / ML / AI
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow",
    "PyTorch", "Keras", "scikit-learn", "Pandas", "NumPy", "Matplotlib",
    "Seaborn", "OpenCV", "Hugging Face", "LangChain", "Spark", "Hadoop",
    "Tableau", "Power BI", "Data Analysis", "Data Engineering", "ETL",
    # Mobile
    "React Native", "Flutter", "Android", "iOS", "Xcode",
    # Design & UX
    "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InDesign",
    "UI/UX", "Wireframing", "Prototyping", "User Research",
    # Security
    "Cybersecurity", "Penetration Testing", "OWASP", "Cryptography", "OAuth",
    "JWT", "SSL/TLS",
    # Version Control & Tools
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Trello",
    "Notion", "Slack", "VS Code", "IntelliJ",
    # Methodologies
    "Agile", "Scrum", "Kanban", "DevOps", "TDD", "BDD", "Microservices",
    "RESTful API", "SOAP", "gRPC", "Event-Driven",
    # Soft Skills
    "Leadership", "Communication", "Teamwork", "Problem Solving", "Critical Thinking",
    "Project Management", "Time Management", "Mentoring", "Collaboration",
]

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(filepath):
    """Extract text from PDF using PyMuPDF."""
    if not PYMUPDF_AVAILABLE:
        return ""
    try:
        doc = fitz.open(filepath)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        app.logger.error(f"PDF extraction error: {e}")
        return ""

def extract_text_from_docx(filepath):
    """Extract text from DOCX using python-docx."""
    if not DOCX_AVAILABLE:
        return ""
    try:
        doc = DocxDocument(filepath)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        app.logger.error(f"DOCX extraction error: {e}")
        return ""

def extract_skills(text):
    """Match skill keywords against CV text (case-insensitive, whole-word)."""
    found = []
    text_lower = text.lower()
    for skill in SKILL_KEYWORDS:
        # Build a pattern that matches the skill as a whole token
        pattern = r'(?<![\w/])' + re.escape(skill.lower()) + r'(?![\w/])'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found

@app.route('/api/cv/upload', methods=['POST'])
def upload_cv():
    """Upload CV, extract text, extract skills, store in DB."""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    user_id = request.form.get('userId')

    if not user_id:
        return jsonify({"error": "userId is required"}), 400
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF and DOCX files are allowed"}), 400

    # Check file size
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        return jsonify({"error": "File exceeds 5MB limit"}), 400

    # Save file
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = secure_filename(f"{user_id}_{file.filename}")
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Extract text
    ext = filename.rsplit('.', 1)[1].lower()
    if ext == 'pdf':
        text = extract_text_from_pdf(filepath)
    elif ext in ('docx', 'doc'):
        text = extract_text_from_docx(filepath)
    else:
        text = ""

    # Extract skills
    extracted_skills = extract_skills(text)

    # Save to DB
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Update resume_url in jobseeker_profiles
        resume_url = f"/uploads/{filename}"
        cur.execute(
            "UPDATE jobseeker_profiles SET resume_url = %s, updated_at = NOW() WHERE user_id = %s",
            (resume_url, user_id)
        )

        # Upsert skills and link to jobseeker
        for skill_name in extracted_skills:
            # Insert skill into master skills table if not exists
            cur.execute(
                "INSERT INTO skills (name) VALUES (%s) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
                (skill_name,)
            )
            skill_row = cur.fetchone()
            skill_id = skill_row['id']

            # Link skill to jobseeker (ignore duplicates)
            cur.execute(
                "INSERT INTO jobseeker_skills (jobseeker_id, skill_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (user_id, skill_id)
            )

        conn.commit()
        cur.close()

        return jsonify({
            "message": "CV uploaded and skills extracted successfully",
            "filename": filename,
            "resume_url": resume_url,
            "skills": extracted_skills,
            "skill_count": len(extracted_skills)
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        app.logger.error(f"CV upload DB error: {str(e)}")
        return jsonify({"error": "Failed to save CV data to database"}), 500
    finally:
        if conn:
            conn.close()


# Serve uploaded CV files
@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    """Serve a file from the uploads directory with correct mimetype and inline disposition."""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    mimetype = None
    if ext == 'pdf':
        mimetype = 'application/pdf'
    elif ext == 'docx':
        mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    elif ext == 'doc':
        mimetype = 'application/msword'
    elif ext in ['png', 'jpg', 'jpeg', 'webp']:
        mimetype = f'image/{ext if ext != "jpg" else "jpeg"}'
        
    try:
        response = send_from_directory(UPLOAD_FOLDER, filename, mimetype=mimetype)
        if ext in ['pdf', 'png', 'jpg', 'jpeg', 'webp']:
            response.headers['Content-Disposition'] = 'inline'
        return response
    except Exception as e:
        app.logger.error(f"Error serving upload {filename}: {str(e)}")
        return jsonify({"error": "File not found"}), 404


@app.route('/api/cv/delete/<int:user_id>', methods=['DELETE'])
def delete_cv(user_id):
    """Delete the user's CV file and clear resume_url from DB."""
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Get the current resume_url to find the file
        cur.execute("SELECT resume_url FROM jobseeker_profiles WHERE user_id = %s", (user_id,))
        row = cur.fetchone()
        if not row or not row['resume_url']:
            return jsonify({"error": "No CV found for this user"}), 404

        resume_url = row['resume_url']  # e.g. /uploads/1_resume.pdf
        filename = resume_url.lstrip('/uploads/')
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        # Delete file from disk if it exists
        if os.path.exists(filepath):
            os.remove(filepath)

        # Clear resume_url in DB
        cur.execute(
            "UPDATE jobseeker_profiles SET resume_url = NULL, updated_at = NOW() WHERE user_id = %s",
            (user_id,)
        )
        conn.commit()
        cur.close()

        return jsonify({"message": "CV deleted successfully"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        app.logger.error(f"CV delete error: {str(e)}")
        return jsonify({"error": "Failed to delete CV"}), 500
    finally:
        if conn:
            conn.close()


# ==============================================================================
# PROFILE PICTURE API ROUTES
# ==============================================================================

ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_image(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS

@app.route('/api/profile-picture/upload', methods=['POST'])
def upload_profile_picture():
    """Upload profile picture, store in uploads directory, update DB URL."""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    user_id = request.form.get('userId')
    role = request.form.get('role')  # 'seeker' or 'recruiter'

    if not user_id or not role:
        return jsonify({"error": "userId and role are required"}), 400
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    if not allowed_image(file.filename):
        return jsonify({"error": "Only image files (png, jpg, jpeg, gif, webp) are allowed"}), 400

    # Check file size (max 5MB)
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        return jsonify({"error": "File exceeds 5MB limit"}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = secure_filename(f"profile_pic_{user_id}_{file.filename}")
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    profile_picture_url = f"/uploads/{filename}"
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        if role == 'seeker':
            cur.execute(
                "UPDATE jobseeker_profiles SET profile_picture_url = %s, updated_at = NOW() WHERE user_id = %s",
                (profile_picture_url, user_id)
            )
        elif role == 'recruiter':
            cur.execute(
                "UPDATE recruiter_profiles SET profile_picture_url = %s, updated_at = NOW() WHERE user_id = %s",
                (profile_picture_url, user_id)
            )
        else:
            return jsonify({"error": "Invalid role. Must be 'seeker' or 'recruiter'"}), 400

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Profile picture uploaded successfully",
            "profile_picture_url": profile_picture_url
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        app.logger.error(f"Profile picture upload DB error: {str(e)}")
        return jsonify({"error": "Failed to update profile picture in database"}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/profile-picture/delete', methods=['DELETE'])
def delete_profile_picture():
    """Delete profile picture file from disk and clear its database column."""
    data = request.get_json() or {}
    user_id = data.get('userId')
    role = data.get('role')

    if not user_id or not role:
        return jsonify({"error": "userId and role are required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Get current profile picture url
        if role == 'seeker':
            cur.execute("SELECT profile_picture_url FROM jobseeker_profiles WHERE user_id = %s", (user_id,))
        elif role == 'recruiter':
            cur.execute("SELECT profile_picture_url FROM recruiter_profiles WHERE user_id = %s", (user_id,))
        else:
            return jsonify({"error": "Invalid role. Must be 'seeker' or 'recruiter'"}), 400

        row = cur.fetchone()
        if not row or not row['profile_picture_url']:
            return jsonify({"error": "No profile picture found for this user"}), 404

        profile_picture_url = row['profile_picture_url']
        filename = profile_picture_url.lstrip('/uploads/')
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        # Delete file from disk if it exists
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as fe:
                app.logger.warning(f"Failed to remove profile pic file from disk: {fe}")

        # Clear column in DB
        if role == 'seeker':
            cur.execute(
                "UPDATE jobseeker_profiles SET profile_picture_url = NULL, updated_at = NOW() WHERE user_id = %s",
                (user_id,)
            )
        elif role == 'recruiter':
            cur.execute(
                "UPDATE recruiter_profiles SET profile_picture_url = NULL, updated_at = NOW() WHERE user_id = %s",
                (user_id,)
            )

        conn.commit()
        cur.close()

        return jsonify({"message": "Profile picture deleted successfully"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        app.logger.error(f"Profile picture delete error: {str(e)}")
        return jsonify({"error": "Failed to delete profile picture"}), 500
    finally:
        if conn:
            conn.close()


# ==============================================================================
# BOOKMARKS / SAVED JOBS API ROUTES
# ==============================================================================

@app.route('/api/bookmarks', methods=['POST'])
def add_bookmark():
    """Bookmark a job for a jobseeker."""
    data = request.get_json() or {}
    user_id = data.get('userId')
    job_id = data.get('jobId')

    if not user_id or not job_id:
        return jsonify({"error": "userId and jobId are required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Check if already bookmarked
        cur.execute(
            "SELECT 1 FROM saved_jobs WHERE jobseeker_id = %s AND job_id = %s",
            (user_id, job_id)
        )
        if cur.fetchone():
            return jsonify({"message": "Job already bookmarked"}), 200

        cur.execute(
            "INSERT INTO saved_jobs (jobseeker_id, job_id) VALUES (%s, %s)",
            (user_id, job_id)
        )
        conn.commit()
        cur.close()
        return jsonify({"message": "Job bookmarked successfully"}), 201
    except Exception as e:
        if conn:
            conn.rollback()
        app.logger.error(f"Add bookmark error: {str(e)}")
        return jsonify({"error": "Failed to bookmark job"}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/bookmarks', methods=['DELETE'])
def remove_bookmark():
    """Remove a bookmarked job for a jobseeker."""
    data = request.get_json() or {}
    user_id = data.get('userId')
    job_id = data.get('jobId')

    if not user_id or not job_id:
        return jsonify({"error": "userId and jobId are required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "DELETE FROM saved_jobs WHERE jobseeker_id = %s AND job_id = %s",
            (user_id, job_id)
        )
        conn.commit()
        cur.close()
        return jsonify({"message": "Bookmark removed successfully"}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        app.logger.error(f"Remove bookmark error: {str(e)}")
        return jsonify({"error": "Failed to remove bookmark"}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/bookmarks/<int:user_id>', methods=['GET'])
def get_user_bookmarks(user_id):
    """Get all bookmarked job IDs for a user."""
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT s_j.job_id 
            FROM saved_jobs s_j
            JOIN jobs j ON s_j.job_id = j.id
            WHERE s_j.jobseeker_id = %s AND j.status = 'Active'
        """, (user_id,))
        rows = cur.fetchall()
        bookmarked_ids = [row['job_id'] for row in rows]
        cur.close()
        return jsonify(bookmarked_ids), 200
    except Exception as e:
        app.logger.error(f"Get bookmarks error: {str(e)}")
        return jsonify({"error": "Failed to fetch bookmarks"}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/bookmarks/details/<int:user_id>', methods=['GET'])
def get_user_bookmarks_details(user_id):
    """Get full details of all bookmarked jobs for a jobseeker."""
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Select job details joined with saved_jobs table
        cur.execute("""
            SELECT j.*, 
                   s_j.created_at AS saved_at,
                   ARRAY(
                     SELECT s.name 
                     FROM job_skills js
                     JOIN skills s ON js.skill_id = s.id
                     WHERE js.job_id = j.id
                   ) AS skills
            FROM saved_jobs s_j
            JOIN jobs j ON s_j.job_id = j.id
            WHERE s_j.jobseeker_id = %s AND j.status = 'Active'
            ORDER BY s_j.created_at DESC
        """, (user_id,))
        bookmarks = cur.fetchall()
        cur.close()
        return jsonify(bookmarks), 200
    except Exception as e:
        app.logger.error(f"Get bookmarks details error: {str(e)}")
        return jsonify({"error": "Failed to fetch bookmarks details"}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/applications', methods=['POST'])
def create_application():
    """Create a new job application for a seeker."""
    data = request.get_json() or {}
    seeker_id = data.get('seeker_id')
    job_id = data.get('job_id')
    method = data.get('method', 'Manual')

    if not seeker_id or not job_id:
        return jsonify({"error": "seeker_id and job_id are required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if already applied
        cur.execute("""
            SELECT id FROM applications 
            WHERE jobseeker_id = %s AND job_id = %s
        """, (seeker_id, job_id))
        if cur.fetchone():
            return jsonify({"error": "Already applied for this job"}), 400

        # Fetch seeker's skills
        cur.execute("""
            SELECT s.name 
            FROM jobseeker_skills jsk 
            JOIN skills s ON jsk.skill_id = s.id 
            WHERE jsk.jobseeker_id = %s
        """, (seeker_id,))
        seeker_skills = [row['name'].lower() for row in cur.fetchall()]

        # Fetch job's skills
        cur.execute("""
            SELECT s.name 
            FROM job_skills js 
            JOIN skills s ON js.skill_id = s.id 
            WHERE js.job_id = %s
        """, (job_id,))
        job_skills = [row['name'].lower() for row in cur.fetchall()]

        # Calculate match score (defaults to 75 if job has no skills listed)
        match_score = 75
        if job_skills:
            matches = [skill for skill in job_skills if skill in seeker_skills]
            match_score = round((len(matches) / len(job_skills)) * 100)

        cur.execute("""
            INSERT INTO applications (jobseeker_id, job_id, status, match_score, method, applied_at, updated_at)
            VALUES (%s, %s, 'Applied', %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, job_id, jobseeker_id, status, match_score, method, applied_at AS created_at, updated_at
        """, (seeker_id, job_id, match_score, method))
        application = cur.fetchone()
        conn.commit()
        cur.close()
        return jsonify(application), 201
    except Exception as e:
        if conn:
            conn.rollback()
        app.logger.error(f"Create application error: {str(e)}")
        return jsonify({"error": "Failed to create application"}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/applications', methods=['GET'])
def get_user_applications():
    """Get all applications submitted by a seeker."""
    seeker_id = request.args.get('seeker_id')
    if not seeker_id:
        return jsonify({"error": "seeker_id is required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT a.id, a.job_id, a.jobseeker_id, a.status, a.match_score, a.method, a.applied_at AS created_at, a.updated_at,
                   j.title, 
                   j.department, 
                   j.location, 
                   j.posted_date
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.jobseeker_id = %s
            ORDER BY a.applied_at DESC
        """, (seeker_id,))
        apps = cur.fetchall()
        cur.close()
        return jsonify(apps), 200
    except Exception as e:
        app.logger.error(f"Get seeker applications error: {str(e)}")
        return jsonify({"error": "Failed to fetch applications"}), 500
    finally:
        if conn:
            conn.close()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
