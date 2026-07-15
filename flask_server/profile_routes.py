from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
from db import get_db_connection

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/api/recruiters/<int:recruiter_id>', methods=['GET'])
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
        current_app.logger.error(f"Error fetching recruiter: {str(e)}")
        return jsonify({"error": "Failed to query recruiter profile"}), 500
    finally:
        cur.close()
        conn.close()


@profile_bp.route('/api/recruiters/<int:recruiter_id>', methods=['PUT'])
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
        current_app.logger.error(f"Error updating recruiter profile: {str(e)}")
        return jsonify({"error": "Failed to update recruiter profile"}), 500
    finally:
        cur.close()
        conn.close()


@profile_bp.route('/api/jobseekers/<int:seeker_id>', methods=['GET'])
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
        current_app.logger.error(f"Error fetching jobseeker: {str(e)}")
        return jsonify({"error": "Failed to query jobseeker profile"}), 500
    finally:
        cur.close()
        conn.close()


@profile_bp.route('/api/jobseekers/<int:seeker_id>', methods=['PUT'])
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

        # Trigger Auto-Apply background worker for this candidate if auto_apply is enabled
        if auto_apply:
            try:
                import threading
                from matcher import run_auto_apply_for_candidate
                threading.Thread(target=run_auto_apply_for_candidate, args=(int(seeker_id),)).start()
            except Exception as thread_err:
                current_app.logger.error(f"Failed to start auto-apply candidate background thread: {thread_err}")

        return jsonify(row), 200
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error updating jobseeker profile: {str(e)}")
        return jsonify({"error": "Failed to update jobseeker profile"}), 500
    finally:
        cur.close()
        conn.close()
