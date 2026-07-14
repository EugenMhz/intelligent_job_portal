from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
from db import get_db_connection

bookmark_bp = Blueprint('bookmark', __name__)

@bookmark_bp.route('/api/bookmarks', methods=['POST'])
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
        current_app.logger.error(f"Add bookmark error: {str(e)}")
        return jsonify({"error": "Failed to bookmark job"}), 500
    finally:
        if conn:
            conn.close()


@bookmark_bp.route('/api/bookmarks', methods=['DELETE'])
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
        current_app.logger.error(f"Remove bookmark error: {str(e)}")
        return jsonify({"error": "Failed to remove bookmark"}), 500
    finally:
        if conn:
            conn.close()


@bookmark_bp.route('/api/bookmarks/<int:user_id>', methods=['GET'])
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
        current_app.logger.error(f"Get bookmarks error: {str(e)}")
        return jsonify({"error": "Failed to fetch bookmarks"}), 500
    finally:
        if conn:
            conn.close()


@bookmark_bp.route('/api/bookmarks/details/<int:user_id>', methods=['GET'])
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
        
        # Calculate semantic matches
        try:
            from matcher import calculate_matches
            bookmarks = calculate_matches(cur, int(user_id), bookmarks)
        except Exception as match_err:
            current_app.logger.error(f"Semantic match error in bookmarks details: {match_err}")

        cur.close()
        return jsonify(bookmarks), 200
    except Exception as e:
        current_app.logger.error(f"Get bookmarks details error: {str(e)}")
        return jsonify({"error": "Failed to fetch bookmarks details"}), 500
    finally:
        if conn:
            conn.close()


@bookmark_bp.route('/api/applications', methods=['POST'])
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

        # Fetch job details for matching
        cur.execute("""
            SELECT j.title, j.department, j.location, j.description,
                   ARRAY(
                     SELECT s.name 
                     FROM job_skills js
                     JOIN skills s ON js.skill_id = s.id
                     WHERE js.job_id = j.id
                   ) AS skills
            FROM jobs j
            WHERE j.id = %s
        """, (job_id,))
        job = cur.fetchone()
        if not job:
            return jsonify({"error": "Job not found"}), 404

        # Calculate match score (semantic matching with fallback)
        try:
            from matcher import calculate_matches
            enriched_jobs = calculate_matches(cur, int(seeker_id), [job])
            match_score = enriched_jobs[0]['match_score']
        except Exception as match_err:
            current_app.logger.error(f"Failed to calculate semantic match score for application: {match_err}")
            match_score = 75

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
        current_app.logger.error(f"Create application error: {str(e)}")
        return jsonify({"error": "Failed to create application"}), 500
    finally:
        if conn:
            conn.close()


@bookmark_bp.route('/api/applications', methods=['GET'])
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
        current_app.logger.error(f"Get seeker applications error: {str(e)}")
        return jsonify({"error": "Failed to fetch applications"}), 500
    finally:
        if conn:
            conn.close()
