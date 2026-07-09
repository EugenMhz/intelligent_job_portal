from datetime import date
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

from mock_data import JOBS

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:root@localhost:5433/postgres"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

CORS(app)

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx"}


class UserProfile(db.Model):
    __tablename__ = "user_profiles"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default="Job Seeker")

    def to_response(self):
        return {
            "id": f"user-{self.id}",
            "name": self.name,
            "email": self.email,
            "role": self.role,
        }


class JobApplication(db.Model):
    __tablename__ = "job_applications"

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String(50), nullable=False, unique=True)
    status = db.Column(db.String(50), nullable=False, default="Submitted")
    applied_on = db.Column(db.Date, nullable=False, default=date.today)
    similarity_score = db.Column(db.String(10), nullable=False, default="87%")

    def to_response(self):
        return {
            "id": f"app-{self.id}",
            "jobId": self.job_id,
            "status": self.status,
            "appliedOn": str(self.applied_on),
            "similarityScore": self.similarity_score,
        }


class SavedJob(db.Model):
    __tablename__ = "saved_jobs"

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String(50), nullable=False, unique=True)


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def find_job(job_id: str):
    return next((job for job in JOBS if job["id"] == job_id), None)


@app.get("/")
def root():
    return jsonify(
        {
            "message": "Job Portal Flask backend is running.",
            "apiBase": "/api",
            "health": "/api/health",
        }
    )


@app.get("/api")
def api_index():
    return jsonify(
        {
            "message": "API is available.",
            "endpoints": [
                "/api/health",
                "/api/db-health",
                "/api/auth/login",
                "/api/auth/signup",
                "/api/jobs",
                "/api/jobs/<job_id>",
                "/api/dashboard",
                "/api/applications",
                "/api/saved-jobs",
                "/api/upload-cv",
            ],
        }
    )


@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok", "service": "job-portal-backend"})


@app.get("/api/db-health")
def db_health_check():
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify({"status": "ok", "database": "connected"})
    except Exception as exc:
        return jsonify({"status": "error", "database": "disconnected", "message": str(exc)}), 500


@app.post("/api/auth/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    user = UserProfile.query.filter_by(email=email).first()
    if user is None or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid credentials."}), 401

    return jsonify({"message": "Login successful.", "user": user.to_response(), "token": "mock-jwt-token"})


@app.post("/api/auth/signup")
def signup():
    payload = request.get_json(silent=True) or {}
    name = payload.get("name", "").strip()
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    role = payload.get("role", "Job Seeker").strip() or "Job Seeker"

    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required."}), 400

    if UserProfile.query.filter_by(email=email).first() is not None:
        return jsonify({"message": "Email already exists."}), 409

    new_user = UserProfile(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        role=role,
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Signup successful.", "user": new_user.to_response()}), 201


@app.get("/api/jobs")
def list_jobs():
    q = request.args.get("q", "").strip().lower()
    location = request.args.get("location", "").strip().lower()
    skill = request.args.get("skill", "").strip().lower()

    filtered = JOBS

    if q:
        filtered = [
            job
            for job in filtered
            if q in job["title"].lower()
            or q in job["company"].lower()
            or any(q in s.lower() for s in job["skills"])
        ]

    if location:
        filtered = [job for job in filtered if location in job["location"].lower()]

    if skill:
        filtered = [job for job in filtered if any(skill in s.lower() for s in job["skills"])]

    return jsonify({"jobs": filtered, "count": len(filtered)})


@app.get("/api/jobs/<job_id>")
def get_job(job_id: str):
    job = find_job(job_id)
    if job is None:
        return jsonify({"message": "Job not found."}), 404

    return jsonify(job)


@app.get("/api/dashboard")
def dashboard():
    recommended_jobs = JOBS[:3]
    total_applications = JobApplication.query.count()
    interview_count = JobApplication.query.filter(JobApplication.status.ilike("%interview%")).count()
    saved_jobs_count = SavedJob.query.count()

    return jsonify(
        {
            "recommendedJobs": recommended_jobs,
            "stats": {
                "totalApplications": total_applications,
                "interviews": interview_count,
                "savedJobs": saved_jobs_count,
            },
        }
    )


@app.get("/api/applications")
def list_applications():
    applications = JobApplication.query.order_by(JobApplication.id.desc()).all()
    return jsonify({"applications": [application.to_response() for application in applications]})


@app.post("/api/applications")
def create_application():
    payload = request.get_json(silent=True) or {}
    job_id = payload.get("jobId", "").strip()

    if not job_id:
        return jsonify({"message": "jobId is required."}), 400

    if find_job(job_id) is None:
        return jsonify({"message": "Job not found."}), 404

    if JobApplication.query.filter_by(job_id=job_id).first() is not None:
        return jsonify({"message": "Already applied for this job."}), 409

    next_application = JobApplication(job_id=job_id, status="Submitted", similarity_score="87%")
    db.session.add(next_application)
    db.session.commit()

    return jsonify({"message": "Application submitted.", "application": next_application.to_response()}), 201


@app.get("/api/saved-jobs")
def get_saved_jobs():
    saved_job_records = SavedJob.query.all()
    saved_job_ids = [saved_job.job_id for saved_job in saved_job_records]
    saved_jobs = [job for job in JOBS if job["id"] in saved_job_ids]
    return jsonify({"savedJobIds": saved_job_ids, "savedJobs": saved_jobs})


@app.post("/api/saved-jobs")
def save_job():
    payload = request.get_json(silent=True) or {}
    job_id = payload.get("jobId", "").strip()

    if not job_id:
        return jsonify({"message": "jobId is required."}), 400

    if find_job(job_id) is None:
        return jsonify({"message": "Job not found."}), 404

    saved_job = SavedJob.query.filter_by(job_id=job_id).first()
    if saved_job is None:
        db.session.add(SavedJob(job_id=job_id))
        db.session.commit()

    saved_job_ids = [row.job_id for row in SavedJob.query.all()]
    return jsonify({"message": "Job saved.", "savedJobIds": saved_job_ids})


@app.delete("/api/saved-jobs/<job_id>")
def unsave_job(job_id: str):
    saved_job = SavedJob.query.filter_by(job_id=job_id).first()
    if saved_job is not None:
        db.session.delete(saved_job)
        db.session.commit()

    saved_job_ids = [row.job_id for row in SavedJob.query.all()]
    return jsonify({"message": "Job removed from saved list.", "savedJobIds": saved_job_ids})


@app.post("/api/upload-cv")
def upload_cv():
    if "cv" not in request.files:
        return jsonify({"message": "No CV file provided. Use form-data key 'cv'."}), 400

    cv_file = request.files["cv"]

    if cv_file.filename == "":
        return jsonify({"message": "Empty file name."}), 400

    if not allowed_file(cv_file.filename):
        return jsonify({"message": "Unsupported file type. Allowed: pdf, doc, docx."}), 400

    filename = secure_filename(cv_file.filename)
    save_path = UPLOAD_DIR / filename
    cv_file.save(save_path)

    # Placeholder extraction output; replace with parser integration later.
    extracted_skills = ["React", "Node.js", "Communication", "SQL"]

    return jsonify(
        {
            "message": "CV uploaded and parsed successfully.",
            "fileName": filename,
            "extractedSkills": extracted_skills,
        }
    )


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
