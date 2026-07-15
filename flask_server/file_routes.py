import os
import re
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename
from psycopg2.extras import RealDictCursor
from db import get_db_connection

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

file_bp = Blueprint('file', __name__)

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
        current_app.logger.error(f"PDF extraction error: {e}")
        return ""

def extract_text_from_docx(filepath):
    """Extract text from DOCX using python-docx."""
    if not DOCX_AVAILABLE:
        return ""
    try:
        doc = DocxDocument(filepath)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        current_app.logger.error(f"DOCX extraction error: {e}")
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


@file_bp.route('/api/cv/upload', methods=['POST'])
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

        # Check if the user has auto-apply enabled
        cur.execute("SELECT auto_apply FROM jobseeker_profiles WHERE user_id = %s", (user_id,))
        prof = cur.fetchone()
        auto_apply_enabled = prof and prof.get('auto_apply')

        conn.commit()
        cur.close()

        # Trigger Auto-Apply background worker for this candidate if enabled
        if auto_apply_enabled:
            try:
                import threading
                from matcher import run_auto_apply_for_candidate
                threading.Thread(target=run_auto_apply_for_candidate, args=(int(user_id),)).start()
            except Exception as thread_err:
                current_app.logger.error(f"Failed to start auto-apply candidate background thread in upload_cv: {thread_err}")

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
        current_app.logger.error(f"CV upload DB error: {str(e)}")
        return jsonify({"error": "Failed to save CV data to database"}), 500
    finally:
        if conn:
            conn.close()


# Serve uploaded CV files
@file_bp.route('/uploads/<path:filename>', methods=['GET'])
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
        current_app.logger.error(f"Error serving upload {filename}: {str(e)}")
        return jsonify({"error": "File not found"}), 404


@file_bp.route('/api/cv/delete/<int:user_id>', methods=['DELETE'])
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
        current_app.logger.error(f"CV delete error: {str(e)}")
        return jsonify({"error": "Failed to delete CV"}), 500
    finally:
        if conn:
            conn.close()


ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_image(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS


@file_bp.route('/api/profile-picture/upload', methods=['POST'])
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
        current_app.logger.error(f"Profile picture upload DB error: {str(e)}")
        return jsonify({"error": "Failed to update profile picture in database"}), 500
    finally:
        if conn:
            conn.close()


@file_bp.route('/api/profile-picture/delete', methods=['DELETE'])
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
                current_app.logger.warning(f"Failed to remove profile pic file from disk: {fe}")

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
        current_app.logger.error(f"Profile picture delete error: {str(e)}")
        return jsonify({"error": "Failed to delete profile picture"}), 500
    finally:
        if conn:
            conn.close()
